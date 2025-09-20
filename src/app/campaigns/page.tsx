"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Filter, MoreVertical, Eye, Edit, Trash2, Play, BarChart3, Send, CheckCircle, XCircle, Rocket } from "lucide-react";
import AgencyLayout from "@/components/AgencyLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  budget: number;
  spent: number;
  duration: number;
  remainingDays: number;
  riders: number;
  targetLocation: string;
  createdAt: string;
  // Workflow fields
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  launched_at?: string;
  rejection_reason?: string;
  // Funding fields
  funding_source: 'agency' | 'client' | 'shared';
  agency_contribution: number;
  client_contribution: number;
  total_campaign_cost: number;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Fashion Sale',
    status: 'active',
    budget: 150000,
    spent: 45000,
    duration: 30,
    remainingDays: 22,
    riders: 15,
    targetLocation: 'Lagos, Victoria Island',
    createdAt: '2025-01-10',
    submitted_at: '2025-01-09T10:00:00Z',
    approved_at: '2025-01-09T14:30:00Z',
    launched_at: '2025-01-10T08:00:00Z',
    funding_source: 'shared',
    agency_contribution: 75000,
    client_contribution: 75000,
    total_campaign_cost: 150000
  },
  {
    id: '2', 
    name: 'Tech Product Launch',
    status: 'approved',
    budget: 200000,
    spent: 0,
    duration: 14,
    remainingDays: 14,
    riders: 20,
    targetLocation: 'Lagos, Ikeja',
    createdAt: '2025-01-12',
    submitted_at: '2025-01-12T09:00:00Z',
    approved_at: '2025-01-12T16:00:00Z',
    funding_source: 'client',
    agency_contribution: 0,
    client_contribution: 200000,
    total_campaign_cost: 200000
  },
  {
    id: '3',
    name: 'Restaurant Opening',
    status: 'completed',
    budget: 75000,
    spent: 75000,
    duration: 7,
    remainingDays: 0,
    riders: 8,
    targetLocation: 'Abuja, Wuse',
    createdAt: '2025-01-05',
    submitted_at: '2025-01-04T15:00:00Z',
    approved_at: '2025-01-04T17:00:00Z',
    launched_at: '2025-01-05T08:00:00Z',
    funding_source: 'agency',
    agency_contribution: 75000,
    client_contribution: 0,
    total_campaign_cost: 75000
  },
  {
    id: '4',
    name: 'New Brand Campaign',
    status: 'draft',
    budget: 100000,
    spent: 0,
    duration: 21,
    remainingDays: 21,
    riders: 12,
    targetLocation: 'Lagos, Surulere',
    createdAt: '2025-01-13',
    funding_source: 'agency',
    agency_contribution: 100000,
    client_contribution: 0,
    total_campaign_cost: 100000
  },
  {
    id: '5',
    name: 'Holiday Promotion',
    status: 'submitted',
    budget: 180000,
    spent: 0,
    duration: 10,
    remainingDays: 10,
    riders: 18,
    targetLocation: 'Lagos, Lekki',
    createdAt: '2025-01-11',
    submitted_at: '2025-01-11T11:30:00Z',
    funding_source: 'shared',
    agency_contribution: 90000,
    client_contribution: 90000,
    total_campaign_cost: 180000
  },
  {
    id: '6',
    name: 'Product Demo Campaign',
    status: 'rejected',
    budget: 120000,
    spent: 0,
    duration: 14,
    remainingDays: 14,
    riders: 10,
    targetLocation: 'Abuja, Maitama',
    createdAt: '2025-01-08',
    submitted_at: '2025-01-08T14:00:00Z',
    rejected_at: '2025-01-09T10:00:00Z',
    rejection_reason: 'Budget allocation needs revision. Please adjust geofence budgets and resubmit.',
    funding_source: 'client',
    agency_contribution: 0,
    client_contribution: 120000,
    total_campaign_cost: 120000
  }
];

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const { apiService } = await import('@/lib/api');
      
      // Fetch campaigns from backend
      const response = await apiService.getCampaigns();
      
      if (response.success && response.campaigns) {
        // Transform backend campaigns to match our Campaign interface
        const backendCampaigns: Campaign[] = response.campaigns.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status as Campaign['status'],
          budget: campaign.total_budget || 0,
          spent: campaign.total_spent || 0,
          duration: campaign.geofences_count ? 30 : 0, // Default duration, could be calculated from start/end dates
          remainingDays: 0, // Would need calculation based on actual dates
          riders: campaign.total_required_riders || 0,
          targetLocation: 'Multiple locations', // Could be calculated from geofences
          createdAt: campaign.created_at || new Date().toISOString(),
          funding_source: 'agency' as const, // Default, could come from backend
          agency_contribution: campaign.total_budget || 0,
          client_contribution: 0,
          total_campaign_cost: campaign.total_budget || 0
        }));
        
        // Combine backend campaigns with mock campaigns
        const allCampaigns = [...backendCampaigns, ...mockCampaigns];
        setCampaigns(allCampaigns);
      } else {
        // Fallback to mock campaigns only
        console.warn('Failed to fetch campaigns from backend, using mock data');
        setCampaigns(mockCampaigns);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      // Fallback to mock campaigns
      setCampaigns(mockCampaigns);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.targetLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-purple-100 text-purple-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusDisplayText = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'submitted':
        return 'Submitted';
      case 'pending_approval':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return (status as string).charAt(0).toUpperCase() + (status as string).slice(1);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: string) => {
    console.log(`Action: ${action} on campaign: ${campaignId}`);
    
    switch (action) {
      case 'view':
        router.push(`/campaigns/${campaignId}`);
        break;
      case 'edit':
        router.push(`/campaigns/create?edit=${campaignId}`);
        break;
      case 'delete':
        await handleDeleteCampaign(campaignId);
        break;
      case 'submit':
        // TODO: API call to submit for approval
        console.log(`Submitting campaign ${campaignId} for approval`);
        break;
      case 'launch':
        // TODO: API call to launch campaign
        console.log(`Launching campaign ${campaignId}`);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      alert('Campaign not found');
      return;
    }

    // Check if campaign can be deleted
    if (campaign.status !== 'draft' && campaign.status !== 'rejected') {
      alert(`Cannot delete campaign in ${campaign.status} status. Only draft and rejected campaigns can be deleted.`);
      return;
    }

    const confirmMessage = `Are you sure you want to delete "${campaign.name}"?\n\nThis action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const { apiService } = await import('@/lib/api');
      const response = await apiService.deleteCampaign(campaignId);

      if (response.success) {
        // Remove campaign from local state
        setCampaigns(prevCampaigns => 
          prevCampaigns.filter(c => c.id !== campaignId)
        );
        alert('Campaign deleted successfully');
      } else {
        alert(response.message || 'Failed to delete campaign');
      }
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      alert(error.message || 'Failed to delete campaign');
    }
  };

  const getAvailableActions = (campaign: Campaign) => {
    const actions = ['view']; // View is always available
    
    switch (campaign.status) {
      case 'draft':
        actions.push('edit', 'delete', 'submit');
        break;
      case 'submitted':
      case 'pending_approval':
        // No actions for agencies - waiting for admin approval
        break;
      case 'approved':
        actions.push('launch');
        break;
      case 'rejected':
        actions.push('edit', 'delete', 'submit');
        break;
      case 'active':
        // No pause action for physical campaigns - riders can't "turn off" advertisements
        break;
      case 'completed':
      case 'cancelled':
        // Read-only actions only
        break;
    }
    
    return actions;
  };

  const getActionButton = (action: string, campaign: Campaign) => {
    switch (action) {
      case 'view':
        return (
          <Button
            key="view"
            variant="ghost"
            size="sm"
            onClick={() => handleCampaignAction(campaign.id, 'view')}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
        );
      case 'edit':
        return (
          <Button
            key="edit"
            variant="ghost"
            size="sm"
            onClick={() => handleCampaignAction(campaign.id, 'edit')}
            title="Edit Campaign"
          >
            <Edit className="w-4 h-4" />
          </Button>
        );
      case 'delete':
        return (
          <Button
            key="delete"
            variant="ghost"
            size="sm"
            onClick={() => handleCampaignAction(campaign.id, 'delete')}
            title="Delete Campaign"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        );
      case 'submit':
        return (
          <Button
            key="submit"
            variant="ghost"
            size="sm"
            onClick={() => handleCampaignAction(campaign.id, 'submit')}
            title="Submit for Review"
            className="text-blue-600 hover:text-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        );
      case 'launch':
        return (
          <Button
            key="launch"
            variant="ghost"
            size="sm"
            onClick={() => handleCampaignAction(campaign.id, 'launch')}
            title="Launch Campaign"
            className="text-green-600 hover:text-green-700"
          >
            <Rocket className="w-4 h-4" />
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded text-white text-sm font-bold flex items-center justify-center mx-auto mb-4 animate-pulse">
            S
          </div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <AgencyLayout>
      <div className="p-8">

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {campaigns.filter(c => c.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Awaiting Review</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {campaigns.filter(c => ['submitted', 'pending_approval'].includes(c.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {campaigns.filter(c => c.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search campaigns..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

{/* More Filters button commented out
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
*/}
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardContent className="p-0">
            {filteredCampaigns.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No campaigns found</p>
                <p className="text-gray-400 text-sm">
                  {searchTerm || statusFilter !== 'all' 
                    ? "Try adjusting your search or filters" 
                    : "Create your first campaign to get started"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]" style={{ tableLayout: 'auto' }}>
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-50">Campaign</th>
                      <th className="px-1 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">Budget</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">Performance</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">Duration</th>
                      <th className="px-2 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="transition-shadow hover:shadow-md rounded-xl border-b border-gray-100 group">
                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold text-lg">
                              {campaign.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-base font-semibold text-gray-900 leading-tight">{campaign.name}</p>
                              <p className="text-xs text-gray-500">{campaign.targetLocation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-1 py-5 align-middle text-center whitespace-nowrap" style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusColor(campaign.status)} group-hover:scale-105 transition-transform`}>
                              {getStatusDisplayText(campaign.status)}
                            </span>
                            {campaign.status === 'rejected' && campaign.rejection_reason && (
                              <span className="text-xs text-red-600 max-w-xs truncate cursor-help" title={campaign.rejection_reason}>
                                {campaign.rejection_reason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              ₦{campaign.spent.toLocaleString()} <span className="text-gray-400">/</span> ₦{campaign.budget.toLocaleString()}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (campaign.spent / campaign.budget) * 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {campaign.funding_source === 'shared' ? 'Shared funding' : 
                               campaign.funding_source === 'client' ? 'Client funded' : 'Agency funded'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{campaign.riders} riders</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{campaign.duration} days</p>
                            <p className="text-xs text-gray-500">
                              {campaign.remainingDays > 0 ? `${campaign.remainingDays} left` : 'Ended'}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 py-5 align-middle text-center w-20">
                          <div className="flex items-center justify-center space-x-2">
                            {getAvailableActions(campaign).map(action => (
                              <span className="group/action" key={action}>
                                {getActionButton(action, campaign)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AgencyLayout>
  );
}