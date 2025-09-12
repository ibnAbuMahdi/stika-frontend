"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Upload,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: string;
  name: string;
  description: string;
  client: string;
  status: 'draft' | 'submitted' | 'approved' | 'active' | 'completed' | 'rejected' | 'paused';
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  riders_assigned: number;
  impressions?: number;
  geofences_count: number;
  created_at: string;
  campaign_type: string;
  sticker_image?: string;
  regulatory_approval_document?: string;
  verification_frequency: number;
  target_audience?: string;
  marketing_objectives?: string;
  rejection_reason?: string;
  notes?: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  // Mock campaign data - will come from API
  const mockCampaigns: Campaign[] = [
    {
      id: "1",
      name: "Coca Cola Summer Campaign",
      description: "Summer refreshment campaign targeting young adults in Lagos metropolitan area during peak summer months.",
      client: "Coca Cola Nigeria",
      status: "active",
      budget: 500000,
      spent: 125000,
      start_date: "2024-01-15",
      end_date: "2024-03-15",
      riders_assigned: 45,
      impressions: 125000,
      geofences_count: 5,
      created_at: "2024-01-10",
      campaign_type: "brand_awareness",
      verification_frequency: 7,
      target_audience: "Young adults 18-35, urban professionals",
      marketing_objectives: "Increase brand awareness and drive summer sales"
    },
    {
      id: "2", 
      name: "MTN Data Promo",
      description: "Promote new data packages and network improvements across key commercial areas.",
      client: "MTN Nigeria",
      status: "submitted",
      budget: 300000,
      spent: 0,
      start_date: "2024-02-01",
      end_date: "2024-02-28",
      riders_assigned: 30,
      geofences_count: 3,
      created_at: "2024-01-25",
      campaign_type: "promotional",
      verification_frequency: 7,
      target_audience: "Tech-savvy millennials and Gen Z",
      marketing_objectives: "Drive data package subscriptions"
    },
    {
      id: "3",
      name: "Dangote Cement Launch",
      description: "Launch campaign for new cement product line targeting construction professionals.",
      client: "Dangote Group",
      status: "draft",
      budget: 750000,
      spent: 0,
      start_date: "2024-02-10",
      end_date: "2024-04-10",
      riders_assigned: 60,
      geofences_count: 8,
      created_at: "2024-01-20",
      campaign_type: "product_launch",
      verification_frequency: 7,
      target_audience: "Construction professionals, contractors",
      marketing_objectives: "Establish market presence for new product line"
    },
    {
      id: "4",
      name: "First Bank Anniversary",
      description: "Celebrate 130 years of banking excellence and promote anniversary offers.",
      client: "First Bank Nigeria",
      status: "rejected",
      budget: 200000,
      spent: 0,
      start_date: "2024-03-01",
      end_date: "2024-03-31",
      riders_assigned: 0,
      geofences_count: 2,
      created_at: "2024-01-28",
      campaign_type: "event",
      verification_frequency: 7,
      target_audience: "Existing and potential bank customers",
      marketing_objectives: "Increase customer acquisition and retention",
      rejection_reason: "Budget allocation needs approval from finance team. Please resubmit with detailed cost breakdown."
    }
  ];

  useEffect(() => {
    // Get user type from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserType(user.user_type);
    }

    // Simulate API call
    const foundCampaign = mockCampaigns.find(c => c.id === campaignId);
    if (foundCampaign) {
      setCampaign(foundCampaign);
      setEditedCampaign({ ...foundCampaign });
    }
    setIsLoading(false);
  }, [campaignId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'draft': return <Edit2 className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const canEdit = campaign?.status === 'draft' || campaign?.status === 'rejected';

  const getBackUrl = () => {
    // Client users should go back to client dashboard, agency users to campaigns list
    return userType === 'client' ? '/client-dashboard' : '/campaigns';
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCampaign(campaign ? { ...campaign } : null);
  };

  const handleSave = async () => {
    if (!editedCampaign) return;
    
    setIsSaving(true);
    try {
      // TODO: API call to save changes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCampaign(editedCampaign);
      setIsEditing(false);
      
      // Show success message (in real app, use toast)
      alert("Campaign updated successfully!");
    } catch (error) {
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!editedCampaign) return;
    
    setIsSaving(true);
    try {
      // TODO: API call to submit for approval
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedCampaign = { ...editedCampaign, status: 'submitted' as const };
      setCampaign(updatedCampaign);
      setEditedCampaign(updatedCampaign);
      setIsEditing(false);
      
      alert("Campaign submitted for approval!");
    } catch (error) {
      alert("Failed to submit campaign. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Campaign, value: any) => {
    if (editedCampaign) {
      setEditedCampaign({
        ...editedCampaign,
        [field]: value
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist.</p>
          <Button onClick={() => router.push(getBackUrl())}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {userType === 'client' ? 'Back to Dashboard' : 'Back to Campaigns'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push(getBackUrl())}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? editedCampaign?.name : campaign.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getStatusColor(campaign.status)}>
                    {getStatusIcon(campaign.status)}
                    <span className="ml-1 capitalize">{campaign.status}</span>
                  </Badge>
                  <span className="text-gray-600">{campaign.client}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && canEdit && (
                <Button onClick={() => router.push(`/campaigns/create?edit=${campaign.id}`)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Campaign
                </Button>
              )}
              {isEditing && (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  {campaign.status === 'draft' && (
                    <Button 
                      onClick={handleSubmitForApproval} 
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? "Submitting..." : "Submit for Approval"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rejection Reason */}
        {campaign.status === 'rejected' && campaign.rejection_reason && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900 mb-1">Campaign Rejected</h3>
                  <p className="text-red-800">{campaign.rejection_reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedCampaign?.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{campaign.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="campaign_type">Campaign Type</Label>
                    {isEditing ? (
                      <Select
                        value={editedCampaign?.campaign_type || ""}
                        onValueChange={(value) => handleInputChange("campaign_type", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                          <SelectItem value="product_launch">Product Launch</SelectItem>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="seasonal">Seasonal</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-gray-900 capitalize">{campaign.campaign_type.replace('_', ' ')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={editedCampaign?.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{campaign.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="target_audience">Target Audience</Label>
                    {isEditing ? (
                      <Input
                        id="target_audience"
                        value={editedCampaign?.target_audience || ""}
                        onChange={(e) => handleInputChange("target_audience", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{campaign.target_audience}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="marketing_objectives">Marketing Objectives</Label>
                    {isEditing ? (
                      <Input
                        id="marketing_objectives"
                        value={editedCampaign?.marketing_objectives || ""}
                        onChange={(e) => handleInputChange("marketing_objectives", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{campaign.marketing_objectives}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    {isEditing ? (
                      <Input
                        id="start_date"
                        type="date"
                        value={editedCampaign?.start_date || ""}
                        onChange={(e) => handleInputChange("start_date", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{new Date(campaign.start_date).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    {isEditing ? (
                      <Input
                        id="end_date"
                        type="date"
                        value={editedCampaign?.end_date || ""}
                        onChange={(e) => handleInputChange("end_date", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{new Date(campaign.end_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="verification_frequency">Verification Frequency (per week)</Label>
                  {isEditing ? (
                    <Input
                      id="verification_frequency"
                      type="number"
                      min="1"
                      max="7"
                      value={editedCampaign?.verification_frequency || 7}
                      onChange={(e) => handleInputChange("verification_frequency", parseInt(e.target.value))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{campaign.verification_frequency} times per week</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Creative Assets */}
            <Card>
              <CardHeader>
                <CardTitle>Creative Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Sticker Image</Label>
                  {isEditing ? (
                    <div className="mt-1">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload sticker image</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-600">No image uploaded</p>
                  )}
                </div>

                <div>
                  <Label>Regulatory Approval Document</Label>
                  {isEditing ? (
                    <div className="mt-1">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload approval document</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-600">No document uploaded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Budget</span>
                  </div>
                  <span className="font-medium">₦{campaign.budget.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Spent</span>
                  </div>
                  <span className="font-medium">₦{campaign.spent.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Riders Assigned</span>
                  </div>
                  <span className="font-medium">{campaign.riders_assigned}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Geofences</span>
                  </div>
                  <span className="font-medium">{campaign.geofences_count}</span>
                </div>

                {campaign.impressions && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Impressions</span>
                    <span className="font-medium">{campaign.impressions.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/campaigns/${campaign.id}/geofences`)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage Geofences
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/campaigns/${campaign.id}/riders`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Riders
                </Button>

                {campaign.status !== 'draft' && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                )}

                {(campaign.status === 'draft' || campaign.status === 'rejected') && (
                  <Button 
                    className="w-full justify-start text-red-600 hover:text-red-700" 
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Campaign
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}