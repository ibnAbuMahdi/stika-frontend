"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  ArrowUpRight,
  Calendar
} from "lucide-react";
import AgencyLayout from "@/components/AgencyLayout";

interface PPAAnalytics {
  total_routings: number;
  total_accepted: number;
  total_converted: number;
  conversion_rate: number;
  acceptance_rate: number;
  total_fee_savings: number;
  avg_response_time_hours: number;
  routings: Array<{
    id: string;
    client_email: string;
    company_name: string;
    city_requested: string;
    status: string;
    routed_at: string;
    responded_at?: string;
    response_time_hours?: number;
  }>;
}

interface PPAStatus {
  has_ppa_status: boolean;
  ppa_statuses: Array<{
    id: string;
    coverage_type: string;
    coverage_display: string;
    city?: string;
    state?: string;
    effective_date: string;
    total_clients_acquired: number;
    total_campaigns_routed: number;
    platform_fee_savings: number;
  }>;
  benefits: string[];
}

export default function PPAAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ppaStatus, setPpaStatus] = useState<PPAStatus | null>(null);
  const [analytics, setAnalytics] = useState<PPAAnalytics | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { apiService } = await import('@/lib/api');
      
      // Load PPA status
      const statusResponse = await apiService.get('/agencies/ppa/status/');
      if (statusResponse.success) {
        setPpaStatus(statusResponse.data);
        
        if (!statusResponse.data.has_ppa_status) {
          setError("Your agency does not have Preferred Partner status.");
          return;
        }
        
        // Load analytics if PPA status exists
        const analyticsResponse = await apiService.get('/agencies/ppa/analytics/');
        if (analyticsResponse.success) {
          setAnalytics(analyticsResponse.data);
        }
      }
    } catch (error: any) {
      console.error('Error loading PPA data:', error);
      setError(error.response?.data?.message || 'Failed to load PPA analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'converted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <AgencyLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Loading PPA analytics...</p>
          </div>
        </div>
      </AgencyLayout>
    );
  }

  if (error) {
    return (
      <AgencyLayout>
        <div className="p-8">
          <Card>
            <CardContent className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">PPA Analytics Unavailable</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AgencyLayout>
    );
  }

  return (
    <AgencyLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Award className="w-8 h-8 text-purple-600" />
                PPA Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                Track your performance as a Preferred Partner Agency
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              Preferred Partner
            </Badge>
          </div>
        </div>

        {/* PPA Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ppaStatus?.ppa_statuses.map((status) => (
            <Card key={status.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{status.coverage_display}</span>
                  <Badge variant="outline" className="text-xs">
                    {status.coverage_type === 'nationwide' ? 'Nationwide' : 'City'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Clients Acquired</span>
                    <span className="font-semibold">{status.total_clients_acquired}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Campaigns Routed</span>
                    <span className="font-semibold">{status.total_campaigns_routed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fee Savings</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(status.platform_fee_savings)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Since</span>
                      <span>{formatDate(status.effective_date)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Routings</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.total_routings}</p>
                      <p className="text-xs text-gray-500 mt-1">Client requests received</p>
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
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.conversion_rate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-1">{analytics.total_converted} converted</p>
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
                      <p className="text-sm font-medium text-gray-600">Fee Savings</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(analytics.total_fee_savings)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Platform fees waived</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.avg_response_time_hours.toFixed(1)}h
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Hours to respond</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Routings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Client Routings</span>
                  <Badge variant="outline">{analytics.routings.length} recent</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.routings.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.routings.map((routing) => (
                      <div key={routing.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(routing.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">{routing.company_name}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span>{routing.client_email}</span>
                              <span>•</span>
                              <span>{routing.city_requested}</span>
                              <span>•</span>
                              <span>{formatDate(routing.routed_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {routing.response_time_hours && (
                            <span className="text-xs text-gray-500">
                              {routing.response_time_hours.toFixed(1)}h response
                            </span>
                          )}
                          <Badge className={getStatusColor(routing.status)}>
                            {routing.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No client routings yet</p>
                    <p className="text-sm text-gray-500">
                      Client requests will appear here when they're routed to your agency
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Benefits Reminder */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Your PPA Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {ppaStatus?.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AgencyLayout>
  );
}