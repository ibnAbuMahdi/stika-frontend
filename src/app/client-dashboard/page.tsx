"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Eye, 
  MapPin, 
  Calendar,
  Plus,
  BarChart3,
  DollarSign,
  Users,
  Building2,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Link,
  LogOut,
  Loader
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'submitted' | 'approved' | 'active' | 'completed';
  budget: number;
  start_date: string;
  end_date: string;
  impressions?: number;
  clicks?: number;
  geofences_count: number;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Agency connection state
  const [showAgencyBrowser, setShowAgencyBrowser] = useState(false);
  const [showJoinRequestForm, setShowJoinRequestForm] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [joinStatus, setJoinStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Form state for join request
  const [joinForm, setJoinForm] = useState({
    company_name: '',
    industry: '',
    expected_budget: '',
    message: '',
    invite_code: ''
  });

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // First try to get fresh user data from API
        const { apiService } = await import('@/lib/api');
        
        // Check if user is authenticated
        if (!apiService.isAuthenticated()) {
          router.push('/auth/login');
          return;
        }

        let currentUser = null;
        try {
          const response = await apiService.getUserProfile();
          if (response.success && response.user) {
            console.log('User profile from API:', response.user);
            currentUser = response.user;
          }
        } catch (error) {
          console.error('Failed to get fresh user profile:', error);
          // Fallback to localStorage if API call fails
          const userData = localStorage.getItem("user");
          if (userData) {
            currentUser = JSON.parse(userData);
            console.log('User data from localStorage:', currentUser);
          }
        }

        // Validate user type
        if (!currentUser || currentUser.user_type !== 'client') {
          console.log('Unauthorized access to client dashboard:', currentUser?.user_type);
          apiService.clearAuthTokens();
          if (currentUser?.user_type === 'agency' || currentUser?.user_type === 'agency_admin') {
            router.push('/dashboard');
          } else {
            router.push('/auth/login');
          }
          return;
        }

        // User is authorized, set user data and load join status
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
        loadJoinStatus(currentUser);
      } catch (error) {
        console.error('User initialization failed:', error);
        router.push('/auth/login');
      }
    };
    
    initializeUser();

    // Mock campaigns data for client
    setCampaigns([
      {
        id: "1",
        name: "Summer Sale Campaign",
        status: "active",
        budget: 150000,
        start_date: "2024-01-15",
        end_date: "2024-02-15",
        impressions: 25000,
        clicks: 1200,
        geofences_count: 3
      },
      {
        id: "2", 
        name: "Product Launch - Lagos",
        status: "submitted",
        budget: 200000,
        start_date: "2024-02-01",
        end_date: "2024-02-28",
        geofences_count: 2
      },
      {
        id: "3",
        name: "Brand Awareness Drive",
        status: "draft",
        budget: 100000,
        start_date: "2024-03-01",
        end_date: "2024-03-15",
        geofences_count: 1
      }
    ]);
  }, []);

  const loadJoinStatus = async (userData?: any) => {
    try {
      // Use passed userData or current user state
      const currentUser = userData || user;
      
      // Check if user is a client before calling client-specific endpoints
      if (currentUser?.user_type !== 'client') {
        console.log('User is not a client, skipping join status load');
        return;
      }
      
      const { apiService } = await import('@/lib/api');
      const response = await apiService.getClientJoinStatus();
      if (response.success) {
        setJoinStatus(response);
      }
    } catch (error) {
      console.error('Failed to load join status:', error);
    }
  };

  const loadAgencies = async () => {
    try {
      setIsLoading(true);
      const { apiService } = await import('@/lib/api');
      const response = await apiService.getPublicAgencies();
      if (response.success) {
        setAgencies(response.agencies || []);
      }
    } catch (error) {
      console.error('Failed to load agencies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    try {
      setIsLoading(true);
      const { apiService } = await import('@/lib/api');
      
      const requestData = {
        agency_id: selectedAgency.id,
        company_name: joinForm.company_name,
        industry: joinForm.industry,
        expected_budget: joinForm.expected_budget ? parseFloat(joinForm.expected_budget) : undefined,
        message: joinForm.message,
        invite_code: joinForm.invite_code
      };

      const response = await apiService.submitJoinRequest(requestData);
      
      if (response.success) {
        alert(response.message);
        setShowJoinRequestForm(false);
        setShowAgencyBrowser(false);
        setJoinForm({
          company_name: '',
          industry: '',
          expected_budget: '',
          message: '',
          invite_code: ''
        });
        loadJoinStatus(); // Refresh status
      } else {
        alert(response.message || 'Failed to submit join request');
      }
    } catch (error: any) {
      console.error('Failed to submit join request:', error);
      alert(error.message || 'Failed to submit join request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteCodeJoin = async () => {
    if (!joinForm.invite_code.trim()) return;
    
    try {
      setIsLoading(true);
      const { apiService } = await import('@/lib/api');
      
      // Debug: Check user data
      console.log('Current user data:', user);
      console.log('User type:', user?.user_type);
      
      // Check if user is actually a client
      if (!user || user.user_type !== 'client') {
        alert('You must be logged in as a client to join agencies');
        return;
      }
      
      // Step 1: Validate the invite code and get agency information
      console.log('Validating invite code:', joinForm.invite_code);
      const validateResponse = await apiService.validateInviteCode(joinForm.invite_code);
      
      if (!validateResponse.success || !validateResponse.valid) {
        alert(validateResponse.message || 'Invalid invite code. Please check the code and try again.');
        return;
      }
      
      const agency = validateResponse.agency;
      console.log('Found agency from invite code:', agency);
      
      // Step 2: Submit join request with both agency_id and invite_code
      const requestData = {
        agency_id: agency.id,
        invite_code: joinForm.invite_code,
        company_name: user?.full_name || '', // Use user's name as default
        industry: 'technology', // Default industry - user can update later
        message: 'Joined using invite code'
      };

      console.log('Sending join request data:', requestData);
      const response = await apiService.submitJoinRequest(requestData);
      
      if (response.success) {
        alert(response.message || `Successfully joined ${agency.name} using invite code!`);
        setJoinForm({
          company_name: '',
          industry: '',
          expected_budget: '',
          message: '',
          invite_code: ''
        });
        loadJoinStatus(); // Refresh status to show new connection
      } else {
        alert(response.message || 'Failed to join agency. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to join with invite code:', error);
      alert(error.message || 'Failed to join with invite code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowseAgencies = () => {
    setShowAgencyBrowser(true);
    loadAgencies();
  };

  const handleSelectAgency = (agency: any) => {
    setSelectedAgency(agency);
    setShowJoinRequestForm(true);
    setShowAgencyBrowser(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { apiService } = await import('@/lib/api');
      await apiService.logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear tokens and redirect
      const { apiService } = await import('@/lib/api');
      apiService.clearAuthTokens();
      router.push('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name || 'Client'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your advertising campaigns and track performance
            </p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors duration-200 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-3xl font-bold text-gray-900">{activeCampaigns.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-3xl font-bold text-gray-900">₦{totalBudget.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">₦565,000</p>
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
                  <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                  <p className="text-3xl font-bold text-gray-900">₦85,000</p>
                  <p className="text-xs text-green-600 mt-1">
                    Available for campaigns
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaigns List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Campaigns</CardTitle>
                <Button onClick={handleBrowseAgencies}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
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
                          <p className="font-medium">₦{campaign.budget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Geofences</p>
                          <p className="font-medium">{campaign.geofences_count}</p>
                        </div>
                        {campaign.impressions && (
                          <div>
                            <p className="text-gray-600">Impressions</p>
                            <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                          </div>
                        )}
                        {campaign.clicks && (
                          <div>
                            <p className="text-gray-600">Clicks</p>
                            <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
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
                          View Details
                        </Button>
                        {campaign.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/campaigns/${campaign.id}`}
                          >
                            Track Performance
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agency Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show connection status or options */}
                {joinStatus?.approved_agencies?.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Connected to {joinStatus.approved_agencies.length} {joinStatus.approved_agencies.length === 1 ? 'agency' : 'agencies'}</span>
                    </div>
                    {joinStatus.approved_agencies.map((agency: any) => (
                      <div key={agency.id} className="p-3 border rounded-lg bg-green-50">
                        <p className="font-medium text-sm">{agency.agency.name}</p>
                        <p className="text-xs text-gray-600">{agency.agency.city}, {agency.agency.state}</p>
                      </div>
                    ))}
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handleBrowseAgencies}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect to Another Agency
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Connect with advertising agencies to start creating campaigns</p>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleBrowseAgencies}
                      disabled={isLoading}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      {isLoading ? 'Loading...' : 'Browse Agencies'}
                    </Button>
                    
                    <div className="text-center text-xs text-gray-500">
                      or
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter invite code"
                        value={joinForm.invite_code}
                        onChange={(e) => setJoinForm({...joinForm, invite_code: e.target.value})}
                      />
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={!joinForm.invite_code.trim() || isLoading}
                        onClick={handleInviteCodeJoin}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        {isLoading ? 'Joining...' : 'Join with Code'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show pending requests */}
                {joinStatus?.join_requests?.filter((req: any) => req.status === 'pending').length > 0 && (
                  <div className="border-t pt-3 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Pending Requests</p>
                    {joinStatus.join_requests.filter((req: any) => req.status === 'pending').map((req: any) => (
                      <div key={req.id} className="p-2 border rounded bg-yellow-50 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-yellow-600" />
                          <span className="font-medium">{req.agency.name}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Waiting for approval</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wallet Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Balance</span>
                    <span className="font-semibold text-lg">₦85,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Funded</span>
                    <span className="font-medium">₦650,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Approval</span>
                    <span className="font-medium text-yellow-600">₦300,000</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    className="w-full mb-2" 
                    onClick={() => window.location.href = "/wallet"}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                  <Button variant="outline" className="w-full">
                    Transaction History
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Contact your agency or our support team for campaign assistance.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Agency Browser Modal */}
      {showAgencyBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <CardHeader>
              <CardTitle>Browse Agencies</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[70vh]">
              {isLoading ? (
                <div className="text-center py-8">Loading agencies...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agencies.map((agency) => (
                    <div
                      key={agency.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSelectAgency(agency)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{agency.name}</h3>
                          <p className="text-sm text-gray-600">{agency.city}, {agency.state}</p>
                        </div>
                        <Badge variant="secondary">{agency.agency_type}</Badge>
                      </div>
                      
                      {agency.description && (
                        <p className="text-sm text-gray-600 mb-3">{agency.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{agency.total_campaigns} campaigns</span>
                        <span>{agency.active_campaigns} active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAgencyBrowser(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Join Request Form Modal */}
      {showJoinRequestForm && selectedAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Join {selectedAgency.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={joinForm.company_name}
                  onChange={(e) => setJoinForm({...joinForm, company_name: e.target.value})}
                  placeholder="Your company name"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select 
                  value={joinForm.industry}
                  onValueChange={(value) => setJoinForm({...joinForm, industry: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expected_budget">Expected Monthly Budget (₦)</Label>
                <Input
                  id="expected_budget"
                  type="number"
                  value={joinForm.expected_budget}
                  onChange={(e) => setJoinForm({...joinForm, expected_budget: e.target.value})}
                  placeholder="100000"
                />
              </div>

              <div>
                <Label htmlFor="invite_code">Invite Code (Optional)</Label>
                <Input
                  id="invite_code"
                  value={joinForm.invite_code}
                  onChange={(e) => setJoinForm({...joinForm, invite_code: e.target.value})}
                  placeholder="Enter invite code if you have one"
                />
              </div>

              <div>
                <Label htmlFor="message">Message to Agency (Optional)</Label>
                <Textarea
                  id="message"
                  value={joinForm.message}
                  onChange={(e) => setJoinForm({...joinForm, message: e.target.value})}
                  placeholder="Tell them about your advertising goals..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowJoinRequestForm(false);
                    setSelectedAgency(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleJoinRequest}
                  disabled={isLoading || !joinForm.company_name.trim() || !joinForm.industry}
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}