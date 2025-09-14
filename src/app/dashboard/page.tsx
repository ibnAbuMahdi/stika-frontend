"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Users, DollarSign, BarChart3, Eye, MapPin, Calendar, Filter, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CompanyInfoModal from "@/components/CompanyInfoModal";
import AgencyLayout from "@/components/AgencyLayout";

interface Campaign {
  id: string;
  name: string;
  client: string;
  status: 'draft' | 'submitted' | 'approved' | 'active' | 'completed' | 'paused';
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  riders_assigned: number;
  impressions?: number;
  geofences_count: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showCompanyInfoModal, setShowCompanyInfoModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState({
    active_campaigns: 0,
    total_riders: 0,
    total_budget: 0,
    total_impressions: 0,
  });
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Check user authorization before loading dashboard data
    checkUserAuthorization();
  }, []);

  const checkUserAuthorization = async () => {
    try {
      const { apiService } = await import('@/lib/api');
      
      // Check if user is authenticated
      if (!apiService.isAuthenticated()) {
        router.push('/auth/login');
        return;
      }

      // Get user data to validate user type
      let currentUser = null;
      try {
        const response = await apiService.getUserProfile();
        if (response.success && response.user) {
          currentUser = response.user;
        }
      } catch (error) {
        // Fallback to localStorage
        const localUserData = localStorage.getItem('user');
        if (localUserData) {
          currentUser = JSON.parse(localUserData);
        }
      }

      // Validate user type
      if (!currentUser || (currentUser.user_type !== 'agency' && currentUser.user_type !== 'agency_admin')) {
        console.log('Unauthorized access to agency dashboard:', currentUser?.user_type);
        apiService.clearAuthTokens();
        if (currentUser?.user_type === 'client') {
          router.push('/client-dashboard');
        } else {
          router.push('/auth/login');
        }
        return;
      }

      // User is authorized, proceed with loading dashboard data
      loadDashboardData();
    } catch (error) {
      console.error('Authorization check failed:', error);
      router.push('/auth/login');
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const { apiService } = await import('@/lib/api');
      
      // Get fresh user profile
      if (apiService.isAuthenticated()) {
        const response = await apiService.getUserProfile();
        if (response.success && response.user) {
          setUserData(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          setProfileComplete(response.user.agency?.is_profile_complete === true);
          setShowWelcomeNotification(!response.user.agency?.is_profile_complete);
        }
      } else {
        // Fallback to localStorage
        const localUserData = localStorage.getItem('user');
        if (localUserData) {
          const parsedUser = JSON.parse(localUserData);
          setUserData(parsedUser);
          setProfileComplete(parsedUser.agency?.is_profile_complete === true);
          setShowWelcomeNotification(!parsedUser.agency?.is_profile_complete);
        }
      }

      // Load dashboard metrics
      const dashboardResponse = await apiService.getDashboardMetrics();
      if (dashboardResponse.success) {
        setMetrics(dashboardResponse.metrics || {
          active_campaigns: 0,
          total_riders: 0,
          total_budget: 0,
          total_impressions: 0
        });
        setCampaigns(dashboardResponse.campaigns || []);
        
        // Update user data if available
        if (dashboardResponse.user) {
          setUserData(dashboardResponse.user);
          localStorage.setItem('user', JSON.stringify(dashboardResponse.user));
          setProfileComplete(dashboardResponse.user.agency?.is_profile_complete === true);
          setShowWelcomeNotification(!dashboardResponse.user.agency?.is_profile_complete);
        }
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
      
      // Fallback to localStorage
      const localUserData = localStorage.getItem('user');
      if (localUserData) {
        const parsedUser = JSON.parse(localUserData);
        setUserData(parsedUser);
        setProfileComplete(parsedUser.agency?.is_profile_complete === true);
        setShowWelcomeNotification(!parsedUser.agency?.is_profile_complete);
      }
      
      // Mock data for development
      setCampaigns([
        {
          id: "1",
          name: "Coca Cola Summer Campaign",
          client: "Coca Cola Nigeria",
          status: "active",
          budget: 500000,
          spent: 125000,
          start_date: "2024-01-15",
          end_date: "2024-03-15",
          riders_assigned: 45,
          impressions: 125000,
          geofences_count: 5,
          created_at: "2024-01-10"
        },
        {
          id: "2", 
          name: "MTN Data Promo",
          client: "MTN Nigeria",
          status: "submitted",
          budget: 300000,
          spent: 0,
          start_date: "2024-02-01",
          end_date: "2024-02-28",
          riders_assigned: 30,
          geofences_count: 3,
          created_at: "2024-01-25"
        }
      ]);

      setMetrics({
        active_campaigns: 2,
        total_riders: 75,
        total_budget: 800000,
        total_impressions: 125000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { apiService } = await import('@/lib/api');
      await apiService.logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear tokens and redirect even if logout fails
      const { apiService } = await import('@/lib/api');
      apiService.clearAuthTokens();
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
  };

  const handleUpdateCompanyInfo = () => {
    setShowCompanyInfoModal(true);
  };

  const handleCreateCampaign = () => {
    if (userData?.agency?.is_profile_complete === false) {
      // Show modal instead of redirecting
      setShowCompanyInfoModal(true);
      return;
    }
    router.push("/campaigns/create");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AgencyLayout>
      {/* Welcome Notification */}
      {showWelcomeNotification && (
        <div className="fixed bottom-6 left-6 right-6 z-50 lg:left-auto lg:w-96">
          <div className="bg-purple-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-full p-2 mt-1">
                  <span className="text-lg">🎉</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Congrats!</h3>
                  <p className="text-sm opacity-90 mb-3">
                    To create a campaign, kindly Update your company info.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleUpdateCompanyInfo}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    Update company info →
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setShowWelcomeNotification(false)}
                className="text-white/70 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-3xl font-bold text-gray-900">{activeCampaigns}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {campaigns.filter(c => c.status === 'submitted').length} pending approval
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Riders</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.total_riders}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {campaigns.reduce((acc, c) => acc + c.riders_assigned, 0)} assigned
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₦{campaigns.reduce((acc, c) => acc + c.budget, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ₦{campaigns.reduce((acc, c) => acc + c.spent, 0).toLocaleString()} spent
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

{/* Total Impressions card commented out
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
*/}
        </div>

        {/* Recent Campaigns Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaigns Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Campaigns</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm" onClick={() => router.push('/campaigns')}>
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
{/* Impressions display commented out
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {campaign.impressions?.toLocaleString() || 0}
                            </span>
*/}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {campaign.riders_assigned}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {campaign.geofences_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(campaign.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₦{campaign.budget.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            ₦{campaign.spent.toLocaleString()} spent
                          </p>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agency Profile Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agency Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-3 overflow-hidden">
                    <img
                      src="/api/placeholder/64/64"
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold">A</div>';
                      }}
                    />
                  </div>
                  <h4 className="font-semibold text-lg">
                    {userData?.full_name || userData?.username || 'User'}
                  </h4>
                  <p className="text-purple-600 text-sm">Agency Admin</p>
                  <p className="text-gray-600 text-sm">
                    {userData?.agency?.name || 'Company Name'}
                  </p>
                </div>

                <div className="space-y-3 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wallet Balance</span>
                    <span className="font-medium text-purple-600">
                      ₦{userData?.agency?.current_balance?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spending</span>
                    <span className="font-medium">
                      ₦{userData?.agency?.total_spend?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Campaigns</span>
                    <span className="font-medium">{activeCampaigns}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleUpdateCompanyInfo}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Company Info Modal */}
      <CompanyInfoModal
        isOpen={showCompanyInfoModal}
        onClose={() => setShowCompanyInfoModal(false)}
        onUpdateCompanyInfo={() => {
          setShowCompanyInfoModal(false);
          setShowWelcomeNotification(false);
          setProfileComplete(true);
          // Refresh dashboard data to get updated profile
          loadDashboardData();
        }}
      />
    </AgencyLayout>
  );
}