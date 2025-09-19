"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  MapPin, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  DollarSign,
  Palette,
  Package,
  FileText,
  AlertCircle,
  Plus,
  X,
  ChevronDown,
  Award,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import MapLocationPicker from "@/components/MapLocationPicker";
import CampaignTemplateSelector from "@/components/CampaignTemplateSelector";
import { CampaignTemplate } from "@/utils/campaignTemplates";
import AgencyLayout from "@/components/AgencyLayout";

interface CampaignStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface GeofenceData {
  name: string;
  description?: string;
  priority: number;
  center_latitude: number;
  center_longitude: number;
  radius_meters: number;
  budget: number;
  rate_type: 'per_km' | 'per_hour' | 'fixed_daily' | 'hybrid';
  rate_per_km?: number;
  rate_per_hour?: number;
  fixed_daily_rate?: number;
  max_riders: number;
  min_riders: number;
  start_date?: string;
  end_date?: string;
  target_coverage_hours: number;
  is_high_priority: boolean;
  area_type?: string;
  special_instructions?: string;
  pickup_locations: PickupLocationData[];
}

interface PickupLocationData {
  contact_name: string;
  contact_phone: string;
  address: string;
  landmark?: string;
  pickup_instructions?: string;
  operating_hours: Record<string, string>; // JSON object with day keys
  is_active: boolean;
  notes?: string;
}

interface CampaignFormData {
  // Basic Details (Overview Only)
  name: string;
  description: string;
  campaign_type: 'brand_awareness' | 'product_launch' | 'promotional' | 'event' | 'seasonal';
  client_id: string;
  target_audience?: string;
  marketing_objectives?: string;
  status?: string; // Track current campaign status for validation

  // Funding - NEW for Hybrid Payment Model
  funding_source: 'agency' | 'client' | 'shared';
  agency_contribution: number;
  client_contribution: number;

  // Creative & Brand (Global Settings)
  sticker_image: File | null;
  regulatory_approval_document: File | null;
  verification_frequency: number;
  tags: string[];
  notes?: string;

  // Geofences (Primary Data - contains dates, budgets, rates, riders)
  geofences: GeofenceData[];
}

// Mock clients data - will come from API
const mockClients = [
  { id: '1', name: 'Coca Cola Nigeria', client_type: 'corporate' },
  { id: '2', name: 'MTN Nigeria', client_type: 'corporate' },
  { id: '3', name: 'Green Foods', client_type: 'sme' },
];

// Mock agency wallet - will come from API
const mockAgencyWallet = {
  balance: 85000,
  available_balance: 75000
};

function CreateCampaignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCampaignId = searchParams.get('edit');
  const isEditMode = !!editCampaignId;
  
  const [showTemplateSelector, setShowTemplateSelector] = useState(!isEditMode);
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<CampaignStep[]>([
    { id: 1, title: 'Basic Details', description: 'Campaign name, client, and type', completed: false, current: true },
    { id: 2, title: 'Creative & Brand', description: 'Sticker design and brand elements', completed: false, current: false },
    { id: 3, title: 'Geofences & Areas', description: 'Define campaign areas and budgets', completed: false, current: false },
    { id: 4, title: 'Pickup Locations', description: 'Set sticker collection points', completed: false, current: false },
    { id: 5, title: 'Funding Source', description: 'Who pays for this campaign', completed: false, current: false },
    { id: 6, title: 'Review & Submit', description: 'Final review and submission', completed: false, current: false },
  ]);

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    campaign_type: 'brand_awareness',
    client_id: '',
    target_audience: '',
    marketing_objectives: '',
    status: 'draft', // New campaigns start as draft
    funding_source: 'agency',
    agency_contribution: 0,
    client_contribution: 0,
    sticker_image: null,
    regulatory_approval_document: null,
    verification_frequency: 3,
    tags: [],
    notes: '',
    geofences: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddGeofence, setShowAddGeofence] = useState(false);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [ppaStatus, setPpaStatus] = useState<any>(null);
  const [loadingPPA, setLoadingPPA] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Mock campaign data for editing
  const mockCampaignData = {
    id: '3',
    name: 'Dangote Cement Launch',
    description: 'Launch campaign for new cement product line targeting construction professionals.',
    campaign_type: 'product_launch',
    client_id: '3',
    target_audience: 'Construction professionals, contractors',
    marketing_objectives: 'Establish market presence for new product line',
    funding_source: 'client' as const,
    agency_contribution: 0,
    client_contribution: 750000,
    sticker_image: null,
    regulatory_approval_document: null,
    verification_frequency: 7,
    tags: ['construction', 'cement', 'building'],
    notes: 'Focus on construction sites and building material markets',
    geofences: [
      {
        name: 'Lagos Construction Zone',
        description: 'Major construction sites in Lagos',
        priority: 1,
        center_latitude: 6.5244,
        center_longitude: 3.3792,
        radius_meters: 5000,
        budget: 300000,
        rate_type: 'per_hour' as const,
        rate_per_hour: 500,
        max_riders: 25,
        min_riders: 20,
        target_coverage_hours: 8,
        is_high_priority: true,
        area_type: 'commercial',
        special_instructions: 'Focus on active construction sites',
        pickup_locations: []
      }
    ]
  };

  // Load PPA status
  useEffect(() => {
    const loadPPAStatus = async () => {
      try {
        setLoadingPPA(true);
        const { apiService } = await import('@/lib/api');
        
        if (apiService.isAuthenticated()) {
          const response = await apiService.get('/agencies/ppa/status/');
          if (response.success) {
            setPpaStatus(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to load PPA status:', error);
      } finally {
        setLoadingPPA(false);
      }
    };

    loadPPAStatus();
  }, []);

  // Load campaign data when in edit mode
  useEffect(() => {
    const loadCampaignForEdit = async () => {
      if (isEditMode && editCampaignId && profileComplete === true) {
        try {
          setIsLoading(true);
          const { apiService } = await import('@/lib/api');
          
          const response = await apiService.getCampaign(editCampaignId);
          
          if (response.success && response.campaign) {
            const campaign = response.campaign;
            
            // Check if campaign can be edited
            if (campaign.status !== 'draft' && campaign.status !== 'rejected') {
              alert(`This campaign cannot be edited because it is in "${campaign.status}" status. Only campaigns in "draft" or "rejected" status can be edited.`);
              router.push('/campaigns');
              return;
            }
            
            // Convert campaign data to form format
            const editFormData: CampaignFormData = {
              name: campaign.name || '',
              description: campaign.description || '',
              campaign_type: campaign.campaign_type || 'brand_awareness',
              client_id: campaign.client_id || '',
              target_audience: campaign.target_audience || '',
              marketing_objectives: campaign.marketing_objectives || '',
              status: campaign.status, // Track current status
              funding_source: 'agency', // Default for now
              agency_contribution: 0,
              client_contribution: 0,
              sticker_image: null, // Will need to handle existing files differently
              regulatory_approval_document: null,
              verification_frequency: campaign.verification_frequency || 3,
              tags: campaign.tags || [],
              notes: campaign.notes || '',
              geofences: campaign.geofences || [],
            };
            
            setFormData(editFormData);
            
            // Mark steps as completed based on available data
            setSteps(prevSteps => prevSteps.map(step => ({
              ...step,
              completed: step.id < 6 // Mark all steps except final as completed
            })));
          } else {
            alert('Failed to load campaign data: ' + (response.message || 'Unknown error'));
            router.push('/campaigns');
          }
        } catch (error: any) {
          console.error('Failed to load campaign for editing:', error);
          alert('Failed to load campaign data. Redirecting to campaigns list.');
          router.push('/campaigns');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCampaignForEdit();
  }, [isEditMode, editCampaignId, profileComplete, router]);

  // Check if agency profile is complete before allowing campaign creation
  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        setCheckingProfile(true);
        const { apiService } = await import('@/lib/api');
        
        // Check authentication
        if (!apiService.isAuthenticated()) {
          router.push('/auth/login');
          return;
        }
        
        const response = await apiService.checkProfileCompletion();
        
        if (response.success) {
          const isComplete = response.is_complete || false;
          setProfileComplete(isComplete);
          
          // If profile is not complete, redirect to settings
          if (!isComplete) {
            alert('Please complete your company information before creating campaigns. You will be redirected to the settings page.');
            router.push('/settings');
            return;
          }
        } else {
          console.error('Failed to check profile completion:', response.message);
          // On error, assume profile is not complete and redirect
          router.push('/settings');
        }
      } catch (error: any) {
        console.error('Profile completion check error:', error);
        // On error, redirect to login if auth issue, otherwise to settings
        if (error.message?.includes('auth') || error.message?.includes('token') || error.message?.includes('401')) {
          router.push('/auth/login');
        } else {
          router.push('/settings');
        }
      } finally {
        setCheckingProfile(false);
      }
    };

    // Only check profile completion if not in edit mode or if editing a new campaign
    if (!isEditMode) {
      checkProfileCompletion();
    } else {
      setCheckingProfile(false);
      setProfileComplete(true); // Assume profile is complete for editing
    }
  }, [isEditMode, router]);

  // Load clients and wallet data after profile check passes
  useEffect(() => {
    const loadCampaignData = async () => {
      if (profileComplete === true) {
        try {
          const { apiService } = await import('@/lib/api');
          
          // Load clients
          const clientsResponse = await apiService.getAgencyClients();
          if (clientsResponse.success) {
            setClients(clientsResponse.clients || []);
          }
          
          // Load wallet balance from agency profile
          try {
            const profileResponse = await apiService.getAgencyProfile();
            if (profileResponse.success && profileResponse.agency) {
              setWalletBalance(profileResponse.agency.current_balance || 0);
            }
          } catch (walletError) {
            // Fallback to default if profile fails
            console.warn('Failed to load wallet balance:', walletError);
            setWalletBalance(0);
          }
          
        } catch (error) {
          console.error('Failed to load campaign data:', error);
          // Use mock data as fallback
          setClients([
            { id: '1', name: 'Coca Cola Nigeria', client_type: 'corporate' },
            { id: '2', name: 'MTN Nigeria', client_type: 'corporate' },
            { id: '3', name: 'Green Foods', client_type: 'sme' },
          ]);
          setWalletBalance(85000);
        }
      }
    };

    loadCampaignData();
  }, [profileComplete]);

  // Template selection handlers
  const handleTemplateSelect = (template: CampaignTemplate) => {
    setFormData(prev => ({
      ...prev,
      name: template.basicInfo.name,
      description: template.basicInfo.description,
      campaign_duration_days: template.basicInfo.campaign_duration_days,
      geofences: template.geofences.map(geofence => ({
        ...geofence,
        start_date: '', // Will be filled by user
        end_date: '', // Will be filled by user
        max_riders: Math.ceil(template.basicInfo.total_required_riders / template.geofences.length),
        min_riders: Math.floor(template.basicInfo.total_required_riders / template.geofences.length),
        target_coverage_hours: 8, // Default 8 hours
        is_high_priority: false,
        area_type: '',
        special_instructions: '',
        pickup_locations: []
      }))
    }));
    
    setShowTemplateSelector(false);
    
    // Mark step 1 as partially completed since we have basic info
    setSteps(prev => prev.map(step => 
      step.id === 1 ? { ...step, completed: false, current: true } : 
      { ...step, completed: false, current: false }
    ));
  };

  const handleSkipTemplate = () => {
    setShowTemplateSelector(false);
  };

  const handleShowTemplateSelector = () => {
    setShowTemplateSelector(true);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
        if (!formData.client_id) newErrors.client_id = 'Client selection is required';
        if (!formData.description.trim()) newErrors.description = 'Campaign description is required';
        // Note: Dates are now set at geofence level, not campaign level
        break;
      case 2:
        if (!formData.sticker_image) {
          newErrors.sticker_image = 'Sticker image is required';
        }
        // Regulatory approval document is optional
        break;
      case 3:
        if (formData.geofences.length === 0) {
          newErrors.geofences = 'At least one geofence is required';
        }
        break;
      case 4:
        // Pickup locations are optional - no validation needed
        break;
      case 5:
        if (!formData.client_id) {
          newErrors.client_id = 'Client must be selected to configure funding';
        } else {
          const totalBudget = formData.geofences.reduce((sum, g) => sum + g.budget, 0);
          const totalContributions = formData.agency_contribution + formData.client_contribution;
          
          if (totalBudget > 0 && totalContributions !== totalBudget) {
            newErrors.funding_contributions = `Total contributions (₦${totalContributions.toLocaleString()}) must equal campaign budget (₦${totalBudget.toLocaleString()})`;
          }
          
          if (formData.funding_source === 'agency' && formData.agency_contribution <= 0) {
            newErrors.agency_contribution = 'Agency contribution is required for agency-funded campaigns';
          }
          
          if (formData.funding_source === 'client' && formData.client_contribution <= 0) {
            newErrors.client_contribution = 'Client contribution is required for client-funded campaigns';
          }
          
          if (formData.funding_source === 'shared') {
            if (formData.agency_contribution <= 0) {
              newErrors.agency_contribution = 'Agency contribution is required for shared funding';
            }
            if (formData.client_contribution <= 0) {
              newErrors.client_contribution = 'Client contribution is required for shared funding';
            }
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        const newSteps = steps.map(step => ({
          ...step,
          completed: step.id <= currentStep, // Mark all previous steps as completed
          current: step.id === currentStep + 1,
        }));
        setSteps(newSteps);
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const newSteps = steps.map(step => ({
        ...step,
        completed: step.id < currentStep - 1, // Mark all steps before the previous one as completed
        current: step.id === currentStep - 1,
      }));
      setSteps(newSteps);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (action: 'draft' | 'submit' = 'submit') => {
    if (!validateStep(currentStep)) {
      return;
    }

    // Additional validation for required files
    if (!formData.sticker_image) {
      setErrors({ sticker_image: 'Sticker image is required before submission' });
      alert('Please upload a sticker image before submitting the campaign.');
      return;
    }

    setIsLoading(true);
    try {
      const { apiService } = await import('@/lib/api');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add basic campaign data
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('campaign_type', formData.campaign_type);
      formDataToSend.append('client_id', formData.client_id);
      formDataToSend.append('target_audience', formData.target_audience || '');
      formDataToSend.append('marketing_objectives', formData.marketing_objectives || '');
      formDataToSend.append('verification_frequency', formData.verification_frequency.toString());
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('notes', formData.notes || '');
      formDataToSend.append('action', action); // Pass the action (draft or submit)
      
      // Add files
      if (formData.sticker_image) {
        formDataToSend.append('sticker_image', formData.sticker_image);
      }
      if (formData.regulatory_approval_document) {
        formDataToSend.append('regulatory_approval_document', formData.regulatory_approval_document);
      }
      
      // Add geofences as JSON
      const geofencesData = formData.geofences.map(geo => ({
        name: geo.name,
        description: geo.description || '',
        priority: geo.priority,
        center_latitude: geo.center_latitude,
        center_longitude: geo.center_longitude,
        radius_meters: geo.radius_meters,
        budget: geo.budget,
        rate_type: geo.rate_type,
        rate_per_km: geo.rate_per_km || 0,
        rate_per_hour: geo.rate_per_hour || 0,
        fixed_daily_rate: geo.fixed_daily_rate || 0,
        max_riders: geo.max_riders,
        min_riders: geo.min_riders || 1,
        start_date: geo.start_date,
        end_date: geo.end_date,
        target_coverage_hours: geo.target_coverage_hours,
        is_high_priority: geo.is_high_priority,
        area_type: geo.area_type || 'mixed',
        special_instructions: geo.special_instructions || '',
        pickup_locations: geo.pickup_locations || []
      }));
      
      formDataToSend.append('geofences', JSON.stringify(geofencesData));

      let response;
      if (isEditMode && editCampaignId) {
        // Additional check: ensure we're not trying to edit a non-editable campaign
        // This is a safety check in case the status changed since page load
        if (formData.status !== 'draft' && formData.status !== 'rejected') {
          alert('This campaign can no longer be edited. Please refresh the page.');
          return;
        }
        
        // Update existing campaign - for now use JSON until we implement file update handling
        const campaignData = {
          name: formData.name,
          description: formData.description,
          campaign_type: formData.campaign_type,
          client_id: formData.client_id,
          target_audience: formData.target_audience,
          marketing_objectives: formData.marketing_objectives,
          verification_frequency: formData.verification_frequency,
          tags: formData.tags,
          notes: formData.notes,
          action: action, // Pass the action (draft or submit)
          geofences: geofencesData
        };
        response = await apiService.updateCampaign(editCampaignId, campaignData);
      } else {
        // Create new campaign with FormData
        response = await apiService.createCampaignWithFiles(formDataToSend);
      }

      if (response.success) {
        const campaignId = response.campaign_id || editCampaignId;
        
        // Show success message
        const message = isEditMode 
          ? (action === 'submit' ? 'Campaign updated and submitted for review!' : 'Campaign updated successfully!')
          : action === 'draft' 
            ? 'Campaign saved as draft!' 
            : 'Campaign submitted for review!';
        
        alert(message);
        
        // Redirect based on action
        if (action === 'draft') {
          // Go back to campaigns list
          router.push('/campaigns');
        } else {
          // Go to campaign detail page or campaigns list
          router.push('/campaigns');
        }
      } else {
        // Handle API errors
        if (response.errors) {
          setErrors(response.errors);
          alert('Please fix the validation errors and try again.');
        } else {
          alert(response.message || 'Failed to save campaign. Please try again.');
        }
      }
    } catch (error: any) {
      console.error("Campaign creation failed:", error);
      alert(error.message || 'Failed to save campaign. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Show loading state while checking profile completion
  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking company profile...</p>
        </div>
      </div>
    );
  }

  // Show template selector for new campaigns
  if (showTemplateSelector && !isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CampaignTemplateSelector 
          onSelectTemplate={handleTemplateSelect}
          onSkipTemplate={handleSkipTemplate}
        />
      </div>
    );
  }

  // If profile is incomplete, don't render the form (should have redirected)
  if (profileComplete === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Profile Required</h2>
          <p className="text-gray-600 mb-4">
            Please complete your company information before creating campaigns.
          </p>
          <Button 
            onClick={() => router.push('/settings')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Complete Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AgencyLayout>
      <div className="px-4 py-8">
        {/* Step Progress Info */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {isEditMode ? `Edit Campaign${formData.status ? ` (${formData.status.charAt(0).toUpperCase() + formData.status.slice(1)})` : ''}` : 'Create Campaign'}
          </h2>
          <p className="text-gray-600">Step {currentStep} of 6 - {steps.find(s => s.current)?.description}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-start">
              {steps.map((step, index) => (
                <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1`}>
                  <div className="absolute left-4 top-4 flex items-center" aria-hidden="true">
                    {index !== steps.length - 1 && (
                      <div className={`h-0.5 w-full ${step.completed ? 'bg-purple-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white">
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                      ) : step.current ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <div className="text-center mt-2 min-w-0">
                      <span className={`text-xs font-medium block ${step.current ? 'text-purple-600' : step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.title}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* PPA Benefits Banner */}
        {ppaStatus?.has_ppa_status && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        Preferred Partner Benefits Active
                        <Badge className="ml-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          PPA
                        </Badge>
                      </h3>
                      <p className="text-gray-600">
                        This campaign will have <strong>0% platform fees</strong> thanks to your Preferred Partner status
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">₦0</div>
                    <div className="text-sm text-gray-500">Platform fees</div>
                  </div>
                </div>
                {ppaStatus.ppa_statuses?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Coverage: <strong>{ppaStatus.ppa_statuses[0].coverage_display}</strong>
                      </span>
                      <span className="text-gray-600">
                        Lifetime savings: <strong className="text-green-600">
                          ₦{ppaStatus.ppa_statuses.reduce((sum: number, status: any) => sum + status.platform_fee_savings, 0).toLocaleString()}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <FileText className="h-5 w-5" />}
              {currentStep === 2 && <Palette className="h-5 w-5" />}
              {currentStep === 3 && <MapPin className="h-5 w-5" />}
              {currentStep === 4 && <Package className="h-5 w-5" />}
              {currentStep === 5 && <DollarSign className="h-5 w-5" />}
              {currentStep === 6 && <CheckCircle className="h-5 w-5" />}
              {steps.find(s => s.id === currentStep)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <BasicDetailsStep 
                formData={formData} 
                clients={clients}
                errors={errors} 
                updateFormData={updateFormData}
                onShowTemplateSelector={!isEditMode ? handleShowTemplateSelector : undefined}
              />
            )}

            {/* Step 2: Creative & Brand */}
            {currentStep === 2 && (
              <CreativeBrandStep 
                formData={formData} 
                errors={errors} 
                updateFormData={updateFormData} 
              />
            )}

            {/* Step 3: Geofences & Areas */}
            {currentStep === 3 && (
              <GeofencesStep 
                formData={formData} 
                errors={errors} 
                updateFormData={updateFormData}
                showAddGeofence={showAddGeofence}
                setShowAddGeofence={setShowAddGeofence}
              />
            )}

            {/* Step 4: Pickup Locations Summary */}
            {currentStep === 4 && (
              <PickupLocationsStep formData={formData} updateFormData={updateFormData} />
            )}

            {/* Step 5: Funding Source */}
            {currentStep === 5 && (
              <FundingSourceStep 
                formData={formData} 
                errors={errors} 
                updateFormData={updateFormData}
                clients={clients}
                agencyWallet={{ balance: walletBalance, available_balance: walletBalance }}
              />
            )}

            {/* Step 6: Review & Submit */}
            {currentStep === 6 && (
              <ReviewSubmitStep formData={formData} clients={mockClients} />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? () => window.location.href = "/dashboard" : prevStep}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

{currentStep === 6 ? (
            <div className="flex gap-3">
              <Button 
                onClick={() => handleSubmit('draft')} 
                disabled={isLoading}
                variant="outline"
                className="min-w-[140px]"
              >
                {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save as Draft')}
              </Button>
              <Button 
                onClick={() => handleSubmit('submit')} 
                disabled={isLoading}
                className="min-w-[140px] bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? 'Submitting...' : (isEditMode ? 'Update & Submit' : 'Submit Campaign')}
              </Button>
            </div>
          ) : (
            <Button
              onClick={nextStep}
              disabled={isLoading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </AgencyLayout>
  );
}

// Step Components
interface StepProps {
  formData: CampaignFormData;
  errors: Record<string, string>;
  updateFormData: (updates: Partial<CampaignFormData>) => void;
}

function BasicDetailsStep({ 
  formData, 
  clients, 
  errors, 
  updateFormData, 
  onShowTemplateSelector 
}: StepProps & { clients: any[], onShowTemplateSelector?: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Template Button */}
      {onShowTemplateSelector && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-purple-900">Start with a Template</h3>
              <p className="text-sm text-purple-700 mt-1">
                Use pre-configured templates to quickly set up your campaign
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onShowTemplateSelector}
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              Use Template
            </Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Enter campaign name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="client">Client *</Label>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Select value={formData.client_id} onValueChange={(value) => updateFormData({ client_id: value })}>
              <SelectTrigger className={errors.client_id ? 'border-red-500' : ''}>
                {formData.client_id ? (
                  <div className="flex flex-col text-left w-full">
                    <span className="font-medium">
                      {clients.find(c => c.id === formData.client_id)?.name || 'Unknown Client'}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">
                      {clients.find(c => c.id === formData.client_id)?.client_type || ''}
                    </span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select client" />
                )}
              </SelectTrigger>
              <SelectContent>
                {filteredClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-sm text-gray-500 capitalize">
                        {client.client_type}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                {filteredClients.length === 0 && searchTerm && (
                  <div className="px-2 py-1 text-sm text-gray-500">No clients found</div>
                )}
              </SelectContent>
            </Select>
          </div>
          {errors.client_id && <p className="text-sm text-red-600 mt-1">{errors.client_id}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Campaign Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe the campaign objectives and key messages"
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="campaign_type">Campaign Type</Label>
          <Select
            value={formData.campaign_type}
            onValueChange={(value: any) => updateFormData({ campaign_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
              <SelectItem value="product_launch">Product Launch</SelectItem>
              <SelectItem value="promotional">Promotional</SelectItem>
              <SelectItem value="event">Event Marketing</SelectItem>
              <SelectItem value="seasonal">Seasonal Campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="target_audience">Target Audience</Label>
          <Textarea
            id="target_audience"
            value={formData.target_audience || ''}
            onChange={(e) => updateFormData({ target_audience: e.target.value })}
            placeholder="Describe your target audience demographics"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="marketing_objectives">Marketing Objectives</Label>
          <Textarea
            id="marketing_objectives"
            value={formData.marketing_objectives || ''}
            onChange={(e) => updateFormData({ marketing_objectives: e.target.value })}
            placeholder="What are the key marketing objectives?"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}

function FundingSourceStep({ 
  formData, 
  errors, 
  updateFormData, 
  clients, 
  agencyWallet 
}: StepProps & { 
  clients: any[], 
  agencyWallet: { balance: number, available_balance: number } 
}) {
  const selectedClient = clients.find(c => c.id === formData.client_id);
  const totalBudget = formData.geofences.reduce((sum, g) => sum + g.budget, 0);

  const handleFundingSourceChange = (source: 'agency' | 'client' | 'shared') => {
    if (source === 'agency') {
      updateFormData({
        funding_source: source,
        agency_contribution: totalBudget,
        client_contribution: 0
      });
    } else if (source === 'client') {
      updateFormData({
        funding_source: source,
        agency_contribution: 0,
        client_contribution: totalBudget
      });
    } else {
      updateFormData({
        funding_source: source,
        agency_contribution: totalBudget / 2,
        client_contribution: totalBudget / 2
      });
    }
  };

  const handleContributionChange = (type: 'agency' | 'client', value: number) => {
    // Prevent negative values
    value = Math.max(0, value);
    
    // For all funding types, just update the relevant field
    // Let validation handle whether totals are correct
    if (type === 'agency') {
      updateFormData({ agency_contribution: value });
    } else {
      updateFormData({ client_contribution: value });
    }
  };

  return (
    <div className="space-y-6">
      {!formData.client_id && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <p className="text-amber-800 font-medium">Please select a client first</p>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            Go back to Step 1 and select a client to configure funding options.
          </p>
        </div>
      )}

      {formData.client_id && (
        <>
          {/* Funding Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Agency Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Balance:</span>
                    <span className="font-semibold">₦{agencyWallet.available_balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Balance:</span>
                    <span className="font-semibold">₦{agencyWallet.balance.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Client Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client:</span>
                    <span className="font-semibold">{selectedClient?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wallet Balance:</span>
                    <span className="font-semibold">₦{selectedClient?.wallet_balance?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Funding Source Selection */}
          <div>
            <Label>Who will fund this campaign? *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <Card 
                className={`cursor-pointer border-2 ${formData.funding_source === 'agency' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                onClick={() => handleFundingSourceChange('agency')}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Agency Funded</h3>
                  <p className="text-sm text-gray-600">Agency pays for entire campaign</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer border-2 ${formData.funding_source === 'client' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => handleFundingSourceChange('client')}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Client Funded</h3>
                  <p className="text-sm text-gray-600">Client pays for entire campaign</p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer border-2 ${formData.funding_source === 'shared' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => handleFundingSourceChange('shared')}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Shared Funding</h3>
                  <p className="text-sm text-gray-600">Both agency and client contribute</p>
                </CardContent>
              </Card>
            </div>
            {errors.funding_source && <p className="text-sm text-red-600 mt-1">{errors.funding_source}</p>}
            {errors.funding_contributions && <p className="text-sm text-red-600 mt-2">{errors.funding_contributions}</p>}
          </div>

          {/* Contribution Details */}
          {formData.funding_source !== 'agency' && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Funding Breakdown</h3>
                <div className="text-sm text-gray-600">
                  Total Campaign Budget: <span className="font-semibold text-gray-900">₦{totalBudget.toLocaleString()}</span>
                </div>
              </div>
              {formData.funding_source === 'shared' && totalBudget > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Split funding equally?</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const halfBudget = totalBudget / 2;
                        updateFormData({
                          agency_contribution: halfBudget,
                          client_contribution: halfBudget
                        });
                      }}
                      className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      50/50 Split
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {((formData.funding_source as any) === 'shared' || (formData.funding_source as any) === 'agency') && (
                  <div>
                    <Label htmlFor="agencyContribution">Agency Contribution (NGN)</Label>
                    <Input
                      id="agencyContribution"
                      type="number"
                      min="0"
                      max={totalBudget}
                      value={formData.agency_contribution || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Remove leading zeros and handle empty string
                        const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+/, '') || '0');
                        handleContributionChange('agency', cleanValue);
                      }}
                      onBlur={(e) => {
                        // Format the display value on blur to remove leading zeros
                        const value = parseFloat(e.target.value) || 0;
                        updateFormData({ agency_contribution: value });
                      }}
                      className="mt-1"
                      placeholder="0"
                    />
                    {errors.agency_contribution && (
                      <p className="text-red-500 text-sm mt-1">{errors.agency_contribution}</p>
                    )}
                  </div>
                )}
                
                {(formData.funding_source === 'shared' || formData.funding_source === 'client') && (
                  <div>
                    <Label htmlFor="clientContribution">Client Contribution (NGN)</Label>
                    <Input
                      id="clientContribution"
                      type="number"
                      min="0"
                      max={totalBudget}
                      value={formData.client_contribution || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Remove leading zeros and handle empty string
                        const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+/, '') || '0');
                        handleContributionChange('client', cleanValue);
                      }}
                      onBlur={(e) => {
                        // Format the display value on blur to remove leading zeros
                        const value = parseFloat(e.target.value) || 0;
                        updateFormData({ client_contribution: value });
                      }}
                      className="mt-1"
                      placeholder="0"
                    />
                    {errors.client_contribution && (
                      <p className="text-red-500 text-sm mt-1">{errors.client_contribution}</p>
                    )}
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Budget:</span>
                    <span className="font-bold">₦{(formData.agency_contribution + formData.client_contribution).toLocaleString()}</span>
                  </div>
                  {totalBudget > 0 && (formData.agency_contribution + formData.client_contribution) !== totalBudget && (
                    <p className="text-sm text-red-600 mt-1">
                      Contributions must equal total campaign budget (₦{totalBudget.toLocaleString()})
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Funding Instructions */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Funding Instructions</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {formData.funding_source === 'agency' && (
                <>
                  <p>• Funds will be deducted from your agency wallet when campaign starts</p>
                  <p>• Ensure sufficient balance before campaign launch</p>
                </>
              )}
              {formData.funding_source === 'client' && (
                <>
                  <p>• Client will be notified to fund their wallet</p>
                  <p>• Campaign will start once client funding is confirmed</p>
                </>
              )}
              {formData.funding_source === 'shared' && (
                <>
                  <p>• Agency funds will be deducted from your wallet</p>
                  <p>• Client will be notified for their portion</p>
                  <p>• Campaign starts when both contributions are confirmed</p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CreativeBrandStep({ formData, errors, updateFormData }: StepProps) {
  const [stickerPreview, setStickerPreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);

  const handleStickerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return; // Could add error handling here
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return; // Could add error handling here
      }

      updateFormData({ sticker_image: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setStickerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegulatoryDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        return; // Could add error handling here
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return; // Could add error handling here
      }

      updateFormData({ regulatory_approval_document: file });
      setDocumentPreview(file.name);
    }
  };

  const removeStickerImage = () => {
    updateFormData({ sticker_image: null });
    setStickerPreview(null);
  };

  const removeRegulatoryDocument = () => {
    updateFormData({ regulatory_approval_document: null });
    setDocumentPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Sticker Image Upload */}
      <div>
        <Label htmlFor="stickerImage">Sticker Design Image *</Label>
        <p className="text-sm text-gray-500 mb-3">
          Upload the final design image that will be printed on stickers. Accepted formats: JPG, PNG, GIF (Max 5MB)
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          {!stickerPreview ? (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="stickerImage" className="cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Sticker Image
                  </span>
                </label>
                <input
                  id="stickerImage"
                  type="file"
                  accept="image/*"
                  onChange={handleStickerImageChange}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <img
                  src={stickerPreview}
                  alt="Sticker preview"
                  className="mx-auto max-h-48 rounded-lg border"
                />
              </div>
              <div className="flex justify-center gap-2">
                <label htmlFor="stickerImageReplace" className="cursor-pointer">
                  <span className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Replace
                  </span>
                </label>
                <input
                  id="stickerImageReplace"
                  type="file"
                  accept="image/*"
                  onChange={handleStickerImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeStickerImage}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>
        {errors.sticker_image && <p className="text-sm text-red-600 mt-1">{errors.sticker_image}</p>}
      </div>

      {/* Regulatory Approval Document Upload */}
      <div>
        <Label htmlFor="regulatoryDocument">Regulatory Approval Document (Optional)</Label>
        <p className="text-sm text-gray-500 mb-3">
          Upload official approval document from relevant regulatory authorities (LASAA, etc.) if available. Accepted formats: PDF, DOC, DOCX (Max 10MB)
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          {!documentPreview ? (
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="regulatoryDocument" className="cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Document
                  </span>
                </label>
                <input
                  id="regulatoryDocument"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleRegulatoryDocumentChange}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                PDF, DOC, DOCX up to 10MB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-blue-900">{documentPreview}</p>
                    <p className="text-sm text-blue-600">Document uploaded successfully</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <label htmlFor="regulatoryDocumentReplace" className="cursor-pointer">
                  <span className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Replace
                  </span>
                </label>
                <input
                  id="regulatoryDocumentReplace"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleRegulatoryDocumentChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeRegulatoryDocument}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>
        {errors.regulatory_approval_document && <p className="text-sm text-red-600 mt-1">{errors.regulatory_approval_document}</p>}
      </div>

      <div>
        <Label>Verification Frequency (per week)</Label>
        <Select
          value={formData.verification_frequency.toString()}
          onValueChange={(value) => updateFormData({ verification_frequency: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Once per week</SelectItem>
            <SelectItem value="2">Twice per week</SelectItem>
            <SelectItem value="3">Thrice per week</SelectItem>
            <SelectItem value="7">Every day</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500 mt-1">How often riders need to submit verification photos</p>
      </div>

      <div>
        <Label htmlFor="tags">Campaign Tags</Label>
        <Input
          id="tags"
          value={formData.tags.join(', ')}
          onChange={(e) => updateFormData({ 
            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
          })}
          placeholder="Enter tags separated by commas (e.g., food, restaurant, delivery)"
        />
        <p className="text-sm text-gray-500 mt-1">Tags help organize and filter campaigns</p>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          placeholder="Any additional notes or special instructions for the campaign"
          rows={3}
        />
      </div>
    </div>
  );
}

function GeofencesStep({ formData, errors, updateFormData, showAddGeofence, setShowAddGeofence }: StepProps & {
  showAddGeofence: boolean;
  setShowAddGeofence: (show: boolean) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const addGeofence = () => {
    setEditingIndex(null);
    setShowAddGeofence(true);
  };

  const editGeofence = (index: number) => {
    setEditingIndex(index);
    setShowAddGeofence(true);
  };

  const saveGeofence = (geofence: GeofenceData) => {
    if (editingIndex !== null) {
      // Update existing geofence
      const updatedGeofences = [...formData.geofences];
      updatedGeofences[editingIndex] = geofence;
      updateFormData({
        geofences: updatedGeofences
      });
    } else {
      // Add new geofence
      updateFormData({
        geofences: [...formData.geofences, geofence]
      });
    }
    setShowAddGeofence(false);
    setEditingIndex(null);
  };

  const removeGeofence = (index: number) => {
    updateFormData({
      geofences: formData.geofences.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Settings Notice */}
      <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="text-purple-600 mt-1">📍</div>
          <div>
            <h4 className="font-medium text-purple-900">Primary Campaign Settings</h4>
            <p className="text-sm text-purple-800 mt-1">
              Each geofence contains the core campaign settings: <strong>dates, budget, rates, and rider requirements</strong>. 
              Campaign totals are automatically calculated from all geofences.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Campaign Geofences</h3>
          <p className="text-sm text-gray-500">Define specific areas with individual budgets, dates, and rates</p>
        </div>
        <Button onClick={addGeofence}>
          <Plus className="h-4 w-4 mr-2" />
          Add Geofence
        </Button>
      </div>

      {errors.geofences && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-sm text-red-600">{errors.geofences}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {formData.geofences.map((geofence, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div 
                  className="flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors" 
                  onClick={() => editGeofence(index)}
                  title="Click to edit this geofence"
                >
                  <h4 className="font-medium">{geofence.name}</h4>
                  <p className="text-sm text-gray-500">{geofence.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>Budget: ₦{geofence.budget.toLocaleString()}</span>
                    <span>Riders: {geofence.min_riders}-{geofence.max_riders}</span>
                    <span>Rate: ₦{
                      geofence.rate_type === 'per_hour' ? geofence.rate_per_hour?.toLocaleString() :
                      geofence.rate_type === 'fixed_daily' ? geofence.fixed_daily_rate?.toLocaleString() :
                      geofence.rate_per_hour?.toLocaleString()
                    } {geofence.rate_type.replace('_', ' ')}</span>
                    {geofence.is_high_priority && (
                      <Badge variant="info" size="sm">High Priority</Badge>
                    )}
                  </div>
                  {(geofence as any).startDate && (geofence as any).endDate && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span>Duration: {new Date((geofence as any).startDate).toLocaleDateString()} - {new Date((geofence as any).endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      editGeofence(index);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGeofence(index);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAddGeofence && (
        <GeofenceForm
          initialData={editingIndex !== null ? formData.geofences[editingIndex] : undefined}
          onSave={saveGeofence}
          onCancel={() => {
            setShowAddGeofence(false);
            setEditingIndex(null);
          }}
          isEditing={editingIndex !== null}
        />
      )}

      {formData.geofences.length === 0 && !showAddGeofence && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No geofences defined yet</p>
          <p className="text-sm text-gray-500 mb-4">Add geofences to specify where your campaign will run</p>
          <Button onClick={addGeofence} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Geofence
          </Button>
        </div>
      )}
    </div>
  );
}

function PickupLocationsStep({ formData, updateFormData }: { formData: CampaignFormData; updateFormData: (data: Partial<CampaignFormData>) => void }) {
  const [selectedGeofenceIndex, setSelectedGeofenceIndex] = useState<number | null>(null);
  const [showAddPickup, setShowAddPickup] = useState(false);
  const [editingPickupIndex, setEditingPickupIndex] = useState<number | null>(null);

  const addPickupLocation = (geofenceIndex: number) => {
    setSelectedGeofenceIndex(geofenceIndex);
    setEditingPickupIndex(null);
    setShowAddPickup(true);
  };

  const editPickupLocation = (geofenceIndex: number, pickupIndex: number) => {
    setSelectedGeofenceIndex(geofenceIndex);
    setEditingPickupIndex(pickupIndex);
    setShowAddPickup(true);
  };

  const savePickupLocation = (pickupData: PickupLocationData) => {
    if (selectedGeofenceIndex === null) return;

    const updatedGeofences = [...formData.geofences];
    const geofence = updatedGeofences[selectedGeofenceIndex];

    if (editingPickupIndex !== null) {
      // Update existing pickup location
      geofence.pickup_locations[editingPickupIndex] = pickupData;
    } else {
      // Add new pickup location
      geofence.pickup_locations.push(pickupData);
    }

    updateFormData({ geofences: updatedGeofences });
    setShowAddPickup(false);
    setSelectedGeofenceIndex(null);
    setEditingPickupIndex(null);
  };

  const removePickupLocation = (geofenceIndex: number, pickupIndex: number) => {
    const updatedGeofences = [...formData.geofences];
    updatedGeofences[geofenceIndex].pickup_locations.splice(pickupIndex, 1);
    updateFormData({ geofences: updatedGeofences });
  };

  const getOperatingHoursDisplay = (hours: Record<string, string>) => {
    const days = Object.keys(hours);
    if (days.length === 0) return 'Not specified';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[today];
    return todayHours ? `Today: ${todayHours}` : 'Closed today';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Pickup Locations Management</h3>
        <p className="text-sm text-gray-500">
          Configure pickup locations for each geofence where riders can collect campaign stickers.
        </p>
      </div>

      <div className="space-y-4">
        {formData.geofences.map((geofence, geofenceIndex) => (
          <Card key={geofenceIndex}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{geofence.name}</CardTitle>
                <Button
                  onClick={() => addPickupLocation(geofenceIndex)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pickup Location
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {geofence.pickup_locations.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">No pickup locations configured for this geofence</p>
                  <Button
                    onClick={() => addPickupLocation(geofenceIndex)}
                    variant="outline"
                    size="sm"
                  >
                    Add First Pickup Location
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {geofence.pickup_locations.map((location, locationIndex) => (
                    <div key={locationIndex} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-sm">{location.contact_name}</h4>
                            {!location.is_active && (
                              <Badge variant="secondary" size="sm">Inactive</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                              <div>
                                <div>{location.address}</div>
                                {location.landmark && (
                                  <div className="text-gray-500">Near: {location.landmark}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <span>📞 {location.contact_phone}</span>
                              <span>🕐 {getOperatingHoursDisplay(location.operating_hours)}</span>
                            </div>
                            {location.pickup_instructions && (
                              <div className="text-gray-500 text-xs mt-1">
                                <strong>Instructions:</strong> {location.pickup_instructions}
                              </div>
                            )}
                            {location.notes && (
                              <div className="text-gray-500 text-xs">
                                <strong>Notes:</strong> {location.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editPickupLocation(geofenceIndex, locationIndex)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePickupLocation(geofenceIndex, locationIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {formData.geofences.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No geofences defined</p>
          <p className="text-sm text-gray-500">Please go back and add geofences before configuring pickup locations</p>
        </div>
      )}

      {showAddPickup && selectedGeofenceIndex !== null && (
        <PickupLocationForm
          initialData={editingPickupIndex !== null ? formData.geofences[selectedGeofenceIndex].pickup_locations[editingPickupIndex] : undefined}
          onSave={savePickupLocation}
          onCancel={() => {
            setShowAddPickup(false);
            setSelectedGeofenceIndex(null);
            setEditingPickupIndex(null);
          }}
          isEditing={editingPickupIndex !== null}
          geofenceName={formData.geofences[selectedGeofenceIndex].name}
        />
      )}
    </div>
  );
}

function ReviewSubmitStep({ formData, clients }: { formData: CampaignFormData; clients: any[] }) {
  const client = clients.find(c => c.id === formData.client_id);
  const totalBudget = formData.geofences.reduce((sum, g) => sum + g.budget, 0);
  const totalRiders = formData.geofences.reduce((sum, g) => sum + g.max_riders, 0);
  const totalPickupLocations = formData.geofences.reduce((sum, g) => sum + g.pickup_locations.length, 0);
  
  // Calculate verification fees
  const calculateVerificationFees = () => {
    let totalVerificationFee = 0;
    formData.geofences.forEach(geofence => {
      // Only calculate verification fees for fixed_daily rate type
      if (geofence.rate_type === 'fixed_daily') {
        const verificationFeePerRider = formData.verification_frequency * 50; // N50 per verification
        totalVerificationFee += geofence.max_riders * verificationFeePerRider;
      }
    });
    return totalVerificationFee;
  };
  
  const verificationFees = calculateVerificationFees();
  
  // Platform fees and VAT configuration
  const platformFeePercentage = 0; // 0% for now
  const vatPercentage = 0; // 0% for now
  
  // Calculate fees
  const platformFee = totalBudget * (platformFeePercentage / 100);
  const subtotalWithPlatformFee = totalBudget + platformFee + verificationFees;
  const vatAmount = subtotalWithPlatformFee * (vatPercentage / 100);
  const totalCampaignCost = subtotalWithPlatformFee + vatAmount;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Review Campaign Details</h3>
        <p className="text-sm text-gray-500">Please review all information before creating the campaign</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-medium">Name:</span> {formData.name}</div>
            <div><span className="font-medium">Client:</span> {client?.name}</div>
            <div><span className="font-medium">Type:</span> {formData.campaign_type.replace('_', ' ')}</div>
            <div><span className="font-medium">Verification:</span> {formData.verification_frequency} times/week</div>
          </CardContent>
        </Card>

        {/* Campaign Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Summary (Auto-Calculated)</CardTitle>
            <p className="text-sm text-gray-500">Totals calculated from geofence settings</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-medium">Campaign Budget:</span> ₦{totalBudget.toLocaleString()}</div>
            <div><span className="font-medium">Platform Fee ({platformFeePercentage}%):</span> ₦{platformFee.toLocaleString()}</div>
            <div>
              <span className="font-medium">Verification Fees:</span> ₦{verificationFees.toLocaleString()}
              {verificationFees > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  ₦50 × {formData.verification_frequency} verifications/week × {formData.geofences.filter(g => g.rate_type === 'fixed_daily').reduce((sum, g) => sum + g.max_riders, 0)} fixed-rate riders
                </p>
              )}
            </div>
            <div><span className="font-medium">VAT ({vatPercentage}%):</span> ₦{vatAmount.toLocaleString()}</div>
            <div className="border-t pt-2">
              <span className="font-semibold text-lg">Total Campaign Cost: ₦{totalCampaignCost.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-3">
              <div><span className="font-medium">Geofences:</span> {formData.geofences.length}</div>
              <div><span className="font-medium">Max Riders:</span> {totalRiders}</div>
              <div><span className="font-medium">Pickup Locations:</span> {totalPickupLocations}</div>
              <div><span className="font-medium">Sticker Image:</span> {formData.sticker_image ? '✓ Uploaded' : '✗ Missing'}</div>
              <div><span className="font-medium">Regulatory Document:</span> {formData.regulatory_approval_document ? '✓ Uploaded' : '(Optional - not uploaded)'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creative Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Creative Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2">Sticker Design</p>
              {formData.sticker_image ? (
                <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                  <p className="text-sm text-green-800">✓ {formData.sticker_image.name}</p>
                  <p className="text-xs text-green-600">{(formData.sticker_image.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="border rounded-lg p-3 bg-red-50 border-red-200">
                  <p className="text-sm text-red-800">✗ No sticker image uploaded</p>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium mb-2">Regulatory Approval (Optional)</p>
              {formData.regulatory_approval_document ? (
                <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                  <p className="text-sm text-green-800">✓ {formData.regulatory_approval_document.name}</p>
                  <p className="text-xs text-green-600">{(formData.regulatory_approval_document.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="border rounded-lg p-3 bg-gray-50 border-gray-200">
                  <p className="text-sm text-gray-600">No regulatory document uploaded (can be added later)</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding vs Cost Comparison */}
      <Card className={totalCampaignCost > (formData.agency_contribution + formData.client_contribution) ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Funding vs Total Cost
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Funding Committed:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Agency Contribution:</span>
                  <span className="font-medium">₦{formData.agency_contribution.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Client Contribution:</span>
                  <span className="font-medium">₦{formData.client_contribution.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Total Funding:</span>
                  <span>₦{(formData.agency_contribution + formData.client_contribution).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Total Campaign Cost:</p>
              <div className="text-2xl font-bold">
                ₦{totalCampaignCost.toLocaleString()}
              </div>
              {totalCampaignCost > (formData.agency_contribution + formData.client_contribution) ? (
                <p className="text-sm text-amber-700 mt-2">
                  ⚠️ Additional funding of ₦{(totalCampaignCost - formData.agency_contribution - formData.client_contribution).toLocaleString()} required
                </p>
              ) : (
                <p className="text-sm text-green-700 mt-2">
                  ✓ Funding covers total cost
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geofences Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Geofences Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formData.geofences.map((geofence, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{geofence.name}</div>
                    <div className="text-sm text-gray-600">{geofence.description}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>₦{geofence.budget.toLocaleString()}</div>
                    <div className="text-gray-500">{geofence.min_riders}-{geofence.max_riders} riders</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Geofence Form Component
function GeofenceForm({ initialData, onSave, onCancel, isEditing = false }: {
  initialData?: GeofenceData;
  onSave: (geofence: GeofenceData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}) {
  const [geofence, setGeofence] = useState<GeofenceData>(initialData || {
    name: '',
    description: '',
    priority: 1,
    center_latitude: 6.5244, // Lagos coordinates
    center_longitude: 3.3792,
    radius_meters: 5000,
    budget: 0,
    rate_type: 'per_hour',
    rate_per_km: 0,
    rate_per_hour: 0,
    fixed_daily_rate: 0,
    max_riders: 25,
    min_riders: 20,
    target_coverage_hours: 8,
    is_high_priority: false,
    area_type: '',
    special_instructions: '',
    pickup_locations: [],
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState((initialData as any)?.startDate || '');
  const [endDate, setEndDate] = useState((initialData as any)?.endDate || '');
  const [estimatedBudget, setEstimatedBudget] = useState<number>(0);

  // Calculate estimated budget
  const calculateEstimatedBudget = (): number => {
    if (geofence.rate_type === 'per_hour' && startDate && endDate && geofence.rate_per_hour && geofence.rate_per_hour > 0 && geofence.max_riders > 0) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (days > 0) {
        // Always use min_riders = 20 for calculation
        const minRiders = 20;
        const avgTricycles = Math.ceil((minRiders + geofence.max_riders) / 2);
        const workingHours = 10; // Fixed at 10 hours per day
        const estimate = days * geofence.rate_per_hour * avgTricycles * workingHours;
        return estimate;
      }
    }
    return 0;
  };

  // Update estimated budget when relevant fields change
  useEffect(() => {
    const estimated = calculateEstimatedBudget();
    setEstimatedBudget(estimated);
    
    // Always ensure min_riders is 20
    if (geofence.min_riders !== 20) {
      setGeofence(prev => ({ ...prev, min_riders: 20 }));
    }
  }, [geofence.rate_type, geofence.rate_per_hour, geofence.max_riders, startDate, endDate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!geofence.name.trim()) {
      errors.name = 'Geofence name is required';
    }
    
    if (!geofence.budget || geofence.budget <= 0) {
      errors.budget = 'Budget must be greater than 0';
    } else if (estimatedBudget > 0 && geofence.budget < estimatedBudget) {
      errors.budget = `Budget must be at least ₦${estimatedBudget.toLocaleString()} based on your settings`;
    }
    
    if (!geofence.max_riders || geofence.max_riders < 20) {
      errors.max_riders = 'Max riders must be at least 20';
    }
    
    // Min riders is always 20, so max_riders must be at least 20
    if (geofence.max_riders < 20) {
      errors.max_riders = 'Max riders must be at least 20';
    }
    
    // Validate rate based on type
    const getCurrentRate = () => {
      switch (geofence.rate_type) {
        case 'per_hour': return geofence.rate_per_hour;
        case 'fixed_daily': return geofence.fixed_daily_rate;
        default: return geofence.rate_per_hour;
      }
    };
    
    if (!getCurrentRate() || (getCurrentRate() || 0) <= 0) {
      errors.rate = 'Rate must be greater than 0';
    }
    
    if (!startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!endDate) {
      errors.endDate = 'End date is required';
    }
    
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      errors.endDate = 'End date must be after start date';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({ ...geofence, startDate, endDate } as any);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Geofence' : 'Add New Geofence'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Geofence Name *</Label>
          <Input
            value={geofence.name}
            onChange={(e) => setGeofence(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Lagos Island"
            className={validationErrors.name ? 'border-red-500' : ''}
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={geofence.description}
            onChange={(e) => setGeofence(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe this geofence area"
            rows={2}
          />
        </div>

        {/* Map Location Picker */}
        <div>
          <MapLocationPicker
            latitude={geofence.center_latitude}
            longitude={geofence.center_longitude}
            radius={geofence.radius_meters}
            onLocationChange={(lat, lng) => {
              setGeofence(prev => ({
                ...prev,
                center_latitude: lat,
                center_longitude: lng
              }));
            }}
            onRadiusChange={(radius) => {
              setGeofence(prev => ({
                ...prev,
                radius_meters: radius
              }));
            }}
          />
        </div>

        {/* Campaign Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Start Date *</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={validationErrors.startDate ? 'border-red-500' : ''}
            />
            {validationErrors.startDate && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.startDate}</p>
            )}
          </div>
          <div>
            <Label>End Date *</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={validationErrors.endDate ? 'border-red-500' : ''}
            />
            {validationErrors.endDate && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Budget (₦) *</Label>
            <Input
              type="number"
              value={geofence.budget || ''}
              onChange={(e) => {
                const value = e.target.value;
                const cleanValue = value === '' ? 0 : parseFloat(value.replace(/^0+/, '') || '0');
                setGeofence(prev => ({ ...prev, budget: cleanValue }));
              }}
              onBlur={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setGeofence(prev => ({ ...prev, budget: value }));
              }}
              placeholder="0"
              className={validationErrors.budget ? 'border-red-500' : ''}
            />
            {validationErrors.budget && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.budget}</p>
            )}
            {estimatedBudget > 0 && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-800">
                  Estimated Minimum: ₦{estimatedBudget.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24))} days × 
                  ₦{geofence.rate_per_hour}/hour × 
                  {Math.ceil((20 + geofence.max_riders) / 2)} tricycles × 
                  10 hours
                </p>
              </div>
            )}
          </div>
          <div>
            <Label>Max Riders *</Label>
            <Input
              type="number"
              value={geofence.max_riders}
              onChange={(e) => setGeofence(prev => ({ ...prev, max_riders: parseInt(e.target.value) || 25 }))}
              min="20"
              className={validationErrors.max_riders ? 'border-red-500' : ''}
            />
            {validationErrors.max_riders && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.max_riders}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              💡 Minimum riders automatically set to 20 for all geofences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Rate Type</Label>
            <Select
              value={geofence.rate_type}
              onValueChange={(value: any) => setGeofence(prev => ({ ...prev, rate_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_hour">Per Hour</SelectItem>
                <SelectItem value="fixed_daily">Fixed Daily Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>
              {geofence.rate_type === 'per_hour' ? 'Rate per Hour (₦)' :
               geofence.rate_type === 'fixed_daily' ? 'Daily Rate (₦)' :
               'Rate per Hour (₦)'}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={
                geofence.rate_type === 'per_hour' ? geofence.rate_per_hour :
                geofence.rate_type === 'fixed_daily' ? geofence.fixed_daily_rate :
                geofence.rate_per_hour
              }
              onChange={(e) => {
                const inputValue = e.target.value;
                const cleanValue = inputValue === '' ? 0 : parseFloat(inputValue.replace(/^0+/, '') || '0');
                if (geofence.rate_type === 'per_hour') {
                  setGeofence(prev => ({ ...prev, rate_per_hour: cleanValue }));
                } else if (geofence.rate_type === 'fixed_daily') {
                  setGeofence(prev => ({ ...prev, fixed_daily_rate: cleanValue }));
                }
              }}
              className={validationErrors.rate ? 'border-red-500' : ''}
            />
            {validationErrors.rate && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.rate}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="high_priority"
            checked={geofence.is_high_priority}
            onCheckedChange={(checked) => setGeofence(prev => ({ ...prev, is_high_priority: Boolean(checked) }))}
          />
          <Label htmlFor="high_priority">High Priority Area</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>{isEditing ? 'Update Geofence' : 'Save Geofence'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Pickup Location Form Component
function PickupLocationForm({ initialData, onSave, onCancel, isEditing = false, geofenceName }: {
  initialData?: PickupLocationData;
  onSave: (pickupData: PickupLocationData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  geofenceName: string;
}) {
  const [pickupData, setPickupData] = useState<PickupLocationData>(initialData || {
    contact_name: '',
    contact_phone: '',
    address: '',
    landmark: '',
    pickup_instructions: '',
    operating_hours: {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00',
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00',
      friday: '09:00-17:00',
      saturday: '10:00-14:00',
      sunday: 'Closed'
    },
    is_active: true,
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!pickupData.contact_name.trim()) {
      errors.contact_name = 'Contact name is required';
    }
    
    if (!pickupData.contact_phone.trim()) {
      errors.contact_phone = 'Contact phone is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(pickupData.contact_phone)) {
      errors.contact_phone = 'Please enter a valid phone number';
    }
    
    if (!pickupData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(pickupData);
    }
  };

  const updateOperatingHours = (day: string, hours: string) => {
    setPickupData(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: hours
      }
    }));
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Pickup Location' : 'Add Pickup Location'} - {geofenceName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Contact Name *</Label>
            <Input
              value={pickupData.contact_name}
              onChange={(e) => setPickupData(prev => ({ ...prev, contact_name: e.target.value }))}
              placeholder="Contact person at pickup location"
              className={validationErrors.contact_name ? 'border-red-500' : ''}
            />
            {validationErrors.contact_name && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.contact_name}</p>
            )}
          </div>
          <div>
            <Label>Contact Phone *</Label>
            <Input
              value={pickupData.contact_phone}
              onChange={(e) => setPickupData(prev => ({ ...prev, contact_phone: e.target.value }))}
              placeholder="+234-800-123-4567"
              className={validationErrors.contact_phone ? 'border-red-500' : ''}
            />
            {validationErrors.contact_phone && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.contact_phone}</p>
            )}
          </div>
        </div>

        {/* Location Details */}
        <div>
          <Label>Address *</Label>
          <Textarea
            value={pickupData.address}
            onChange={(e) => setPickupData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Full address of pickup location"
            rows={3}
            className={validationErrors.address ? 'border-red-500' : ''}
          />
          {validationErrors.address && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
          )}
        </div>

        <div>
          <Label>Landmark (Optional)</Label>
          <Input
            value={pickupData.landmark}
            onChange={(e) => setPickupData(prev => ({ ...prev, landmark: e.target.value }))}
            placeholder="Nearby landmark for easier location"
          />
        </div>

        {/* Instructions */}
        <div>
          <Label>Pickup Instructions (Optional)</Label>
          <Textarea
            value={pickupData.pickup_instructions}
            onChange={(e) => setPickupData(prev => ({ ...prev, pickup_instructions: e.target.value }))}
            placeholder="Special instructions for sticker collection"
            rows={3}
          />
        </div>

        {/* Operating Hours */}
        <div>
          <Label>Operating Hours</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
            {daysOfWeek.map(({ key, label }) => (
              <div key={key}>
                <Label className="text-xs font-medium">{label}</Label>
                <Select
                  value={pickupData.operating_hours[key] || 'Closed'}
                  onValueChange={(value) => updateOperatingHours(key, value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="24 Hours">24 Hours</SelectItem>
                    <SelectItem value="06:00-18:00">6 AM - 6 PM</SelectItem>
                    <SelectItem value="07:00-19:00">7 AM - 7 PM</SelectItem>
                    <SelectItem value="08:00-17:00">8 AM - 5 PM</SelectItem>
                    <SelectItem value="09:00-17:00">9 AM - 5 PM</SelectItem>
                    <SelectItem value="09:00-18:00">9 AM - 6 PM</SelectItem>
                    <SelectItem value="10:00-16:00">10 AM - 4 PM</SelectItem>
                    <SelectItem value="10:00-14:00">10 AM - 2 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={pickupData.is_active}
            onCheckedChange={(checked) => setPickupData(prev => ({ ...prev, is_active: Boolean(checked) }))}
          />
          <Label htmlFor="is_active">Active pickup location</Label>
        </div>

        {/* Notes */}
        <div>
          <Label>Additional Notes (Optional)</Label>
          <Textarea
            value={pickupData.notes}
            onChange={(e) => setPickupData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes about the pickup location"
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>
            {isEditing ? 'Update Pickup Location' : 'Save Pickup Location'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreateCampaignPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign builder...</p>
        </div>
      </div>
    }>
      <CreateCampaignContent />
    </Suspense>
  );
}