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
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const { apiService } = await import('@/lib/api');
      
      // Check authentication
      if (!apiService.isAuthenticated()) {
        router.push('/auth/login');
        return;
      }
      
      const response = await apiService.getDashboardData();
      
      if (response.success) {
        setCampaigns(response.campaigns || []);
        setMetrics(response.metrics || {});
        setUserData(response.user);
        
        // Check if profile is complete
        const isComplete = response.user?.agency?.is_profile_complete || false;
        setProfileComplete(isComplete);
        
        // Show welcome notification if profile is not complete
        setShowWelcomeNotification(!isComplete);
      } else {
        console.error('Failed to load dashboard data:', response.message);
        // If unauthorized, redirect to login
        if (response.message?.includes('auth') || response.message?.includes('token')) {
          router.push('/auth/login');
        }
      }
    } catch (error: any) {
      console.error('Dashboard data error:', error);
      // If network error or auth error, redirect to login
      if (error.message?.includes('auth') || error.message?.includes('token') || error.message?.includes('401')) {
        router.push('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Use metrics from API or calculate from campaigns as fallback
  const activeCampaigns = metrics.active_campaigns || campaigns.filter(c => c.status === 'active').length;
  const totalRiders = metrics.total_riders || campaigns.reduce((sum, c) => sum + c.riders_assigned, 0);
  const totalBudget = metrics.total_budget || campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalImpressions = metrics.total_impressions || campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);


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

  const handleCreateCampaign = () => {
    if (!profileComplete) {
      // Show modal to update company info first
      setShowCompanyInfoModal(true);
      return;
    }
    window.location.href = "/campaigns/create";
  };

  const handleUpdateCompanyInfo = () => {
    window.location.href = "/settings";
  };

  const handleLogout = async () => {
    try {
      const { apiService } = await import('@/lib/api');
      await apiService.logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear tokens and redirect
      const { apiService } = await import('@/lib/api');
      apiService.clearAuthTokens();
      router.push('/auth/login');
    }
  };

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
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white border-r border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <img 
                src="/stika_1.svg" 
                alt="Stika" 
                className="w-16 h-16"
              />
              <span className="text-2xl font-bold text-purple-800">
                Stika
              </span>
            </div>

            <nav className="space-y-2">
              <a
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-white bg-purple-600 rounded-lg font-medium"
              >
                <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
                </div>
                Dashboard
              </a>
              
              <a
                href="/campaigns"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-5 h-5 bg-gray-600 rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
                Campaigns
              </a>
              
              <a
                href="/clients"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <Users className="w-5 h-5" />
                Clients
              </a>
              
              
              <a
                href="/wallet"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <Wallet className="w-5 h-5" />
                Wallet
              </a>
              
              <a
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <User className="w-5 h-5" />
                Profile
              </a>
            </nav>

            <div className="mt-auto pt-20">
              <div className="space-y-2">
                <a
                  href="/help"
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
                >
                  <HelpCircle className="w-5 h-5" />
                  Help and support
                </a>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg w-full text-left transition-colors duration-200 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
                <p className="text-gray-600">
                  Welcome {userData?.full_name || userData?.username || 'User'}.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button onClick={handleCreateCampaign} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create campaign
                </Button>
              </div>
            </div>
          </header>

          <div className="p-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Riders</p>
                      <p className="text-3xl font-bold text-gray-900">{totalRiders}</p>
                      <p className="text-xs text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        +12% this month
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
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
                      <p className="text-3xl font-bold text-gray-900">₦{(totalBudget / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-500 mt-1">
                        ₦{(totalSpent / 1000).toFixed(0)}K spent
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                      <p className="text-3xl font-bold text-gray-900">{(totalImpressions / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-green-600 mt-1">
                        <Eye className="h-3 w-3 inline mr-1" />
                        +8% vs last month
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Eye className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                      <Button size="sm" onClick={() => window.location.href = "/campaigns"}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaigns.slice(0, 5).map((campaign) => (
                        <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{campaign.client}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Budget</p>
                              <p className="font-medium">₦{(campaign.budget / 1000).toFixed(0)}K</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Riders</p>
                              <p className="font-medium">{campaign.riders_assigned}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Geofences</p>
                              <p className="font-medium">{campaign.geofences_count}</p>
                            </div>
                            {campaign.impressions && (
                              <div>
                                <p className="text-gray-600">Impressions</p>
                                <p className="font-medium">{(campaign.impressions / 1000).toFixed(0)}K</p>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end mt-4 space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.location.href = `/campaigns/${campaign.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {(campaign.status === 'draft' || campaign.status === 'rejected') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.location.href = `/campaigns/create?edit=${campaign.id}`}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
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
        </div>

      {/* Company Info Modal */}
      <CompanyInfoModal
        isOpen={showCompanyInfoModal}
        onClose={() => setShowCompanyInfoModal(false)}
        onUpdateCompanyInfo={() => {
          setShowCompanyInfoModal(false);
          handleUpdateCompanyInfo();
        }}
      />
    </AgencyLayout>
  );
}