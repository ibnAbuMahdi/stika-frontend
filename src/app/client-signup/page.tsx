"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Star, Users, TrendingUp, Award, MapPin, Building } from "lucide-react";

interface PPAInfo {
  has_ppa: boolean;
  agency?: {
    id: string;
    name: string;
    description: string;
    agency_type: string;
    email: string;
    phone: string;
    website: string;
    logo?: string;
    total_campaigns: number;
    active_campaigns: number;
    subscription_tier: string;
  };
  ppa_status?: {
    coverage_type: string;
    coverage_display: string;
    effective_date: string;
    total_clients_acquired: number;
    total_campaigns_routed: number;
    benefits: string[];
  };
}

const NIGERIAN_CITIES = [
  { name: "Lagos", state: "Lagos" },
  { name: "Abuja", state: "Federal Capital Territory" },
  { name: "Kano", state: "Kano" },
  { name: "Ibadan", state: "Oyo" },
  { name: "Port Harcourt", state: "Rivers" },
  { name: "Benin City", state: "Edo" },
  { name: "Maiduguri", state: "Borno" },
  { name: "Zaria", state: "Kaduna" },
  { name: "Aba", state: "Abia" },
  { name: "Jos", state: "Plateau" },
];

const INDUSTRIES = [
  "Technology",
  "Healthcare", 
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Food & Beverage",
  "Fashion",
  "Automotive",
  "Other"
];

export default function ClientSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ppaInfo, setPpaInfo] = useState<PPAInfo | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    industry: "",
    target_city: "",
    target_state: "",
    expected_budget: "",
    message: "",
  });
  const [errors, setErrors] = useState<any>({});
  
  // Store signup data passed from general signup
  const [signupData, setSignupData] = useState<any>(null);

  // Extract signup data from URL parameters
  useEffect(() => {
    const formDataParam = searchParams.get('formData');
    if (formDataParam) {
      try {
        const parsedData = JSON.parse(formDataParam);
        setSignupData(parsedData);
        
        // Pre-fill company name with username if not set
        if (parsedData.username && !formData.company_name) {
          setFormData(prev => ({
            ...prev,
            company_name: parsedData.username
          }));
        }
      } catch (error) {
        console.error('Error parsing signup data:', error);
      }
    }
  }, [searchParams, formData.company_name]);

  // Check for PPA when city is selected
  useEffect(() => {
    const checkPPA = async () => {
      if (formData.target_city && formData.target_state) {
        try {
          setLoading(true);
          const { apiService } = await import('@/lib/api');
          
          const response = await apiService.get('/agencies/ppa/location/', {
            params: {
              city: formData.target_city,
              state: formData.target_state
            }
          });
          
          if (response.success && response.data) {
            setPpaInfo(response.data);
            if (response.data.has_ppa) {
              setStep(2); // Show PPA overview
            } else {
              // No PPA found - auto-create account if signup data exists
              if (signupData) {
                await createClientAccount();
              } else {
                setPpaInfo({ has_ppa: false });
              }
            }
          } else {
            // API failed - auto-create account if signup data exists
            if (signupData) {
              await createClientAccount();
            } else {
              setPpaInfo({ has_ppa: false });
            }
          }
        } catch (error) {
          console.error('Error checking PPA:', error);
          // On network failure, auto-create account if signup data exists
          if (signupData) {
            await createClientAccount();
          } else {
            setPpaInfo({ has_ppa: false });
          }
        } finally {
          setLoading(false);
        }
      }
    };

    checkPPA();
  }, [formData.target_city, formData.target_state, signupData]);

  const createClientAccount = async () => {
    try {
      const { apiService } = await import('@/lib/api');
      
      const accountData = {
        fullName: signupData.fullName,
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.password, // Same as password for auto-signup
        userType: "client",
        agreeToTerms: signupData.agreeToTerms
      };
      
      const response = await apiService.signup(accountData);
      
      if (response.success) {
        // Show success message
        alert(`Account created successfully! Please check your email (${signupData.email}) to activate your account. You can then login and browse available agencies.`);
        
        // Redirect to login page
        router.push(`/auth/login?email=${encodeURIComponent(signupData.email)}&verification_sent=true`);
      } else {
        // Handle errors - show error and let user continue manually
        console.error('Account creation failed:', response.message);
        console.error('Validation errors:', response.errors);
        setPpaInfo({ has_ppa: false });
        setErrors({ general: response.message || 'Failed to create account. Please try again.' });
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      console.error('Account data sent:', accountData);
      setPpaInfo({ has_ppa: false });
      setErrors({ general: 'Failed to create account. Please try again.' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user types
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCitySelect = (cityName: string) => {
    const city = NIGERIAN_CITIES.find(c => c.name === cityName);
    if (city) {
      setFormData(prev => ({
        ...prev,
        target_city: city.name,
        target_state: city.state
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }
    
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }
    
    if (!formData.target_city) {
      newErrors.target_city = 'Target city is required';
    }
    
    if (formData.expected_budget && isNaN(Number(formData.expected_budget))) {
      newErrors.expected_budget = 'Budget must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const { apiService } = await import('@/lib/api');
      
      const submitData = {
        ...formData,
        expected_budget: formData.expected_budget ? Number(formData.expected_budget) : 0
      };
      
      const response = await apiService.post('/agencies/ppa/join-request/', submitData);
      
      if (response.success) {
        setStep(3); // Show success step
      } else {
        setErrors({ submit: response.message || 'Failed to submit request' });
      }
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to submit request' });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {signupData ? 'Complete your business profile' : 'Tell us about your business'}
        </CardTitle>
        <p className="text-center text-gray-600">
          {signupData 
            ? 'We\'ll check for preferred partner agencies in your area' 
            : 'We\'ll connect you with the best advertising agency for your needs'
          }
        </p>
        {signupData && (
          <div className="text-center">
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
              ✓ Account details received from signup: {signupData.fullName} ({signupData.email})
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            placeholder="Enter your company name"
            className={errors.company_name ? 'border-red-500' : ''}
          />
          {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
        </div>

        <div>
          <Label htmlFor="industry">Industry *</Label>
          <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
            <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
        </div>

        <div>
          <Label htmlFor="target_city">Primary Campaign City *</Label>
          <Select value={formData.target_city} onValueChange={handleCitySelect}>
            <SelectTrigger className={errors.target_city ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select target city" />
            </SelectTrigger>
            <SelectContent>
              {NIGERIAN_CITIES.map((city) => (
                <SelectItem key={`${city.name}-${city.state}`} value={city.name}>
                  {city.name}, {city.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.target_city && <p className="text-red-500 text-sm mt-1">{errors.target_city}</p>}
        </div>

        <div>
          <Label htmlFor="expected_budget">Expected Monthly Budget (₦)</Label>
          <Input
            id="expected_budget"
            type="number"
            value={formData.expected_budget}
            onChange={(e) => handleInputChange('expected_budget', e.target.value)}
            placeholder="e.g. 100000"
            className={errors.expected_budget ? 'border-red-500' : ''}
          />
          {errors.expected_budget && <p className="text-red-500 text-sm mt-1">{errors.expected_budget}</p>}
        </div>

        <div>
          <Label htmlFor="message">Tell us about your advertising goals</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Describe what you want to achieve with your advertising campaign..."
            rows={4}
          />
        </div>

        {loading && (
          <div className="text-center text-gray-600">
            {signupData ? 'Checking for preferred partner agencies...' : 'Checking for preferred partner agencies...'}
          </div>
        )}

        {/* Show errors if account creation failed */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm text-center">{errors.general}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => {
    if (!ppaInfo?.has_ppa || !ppaInfo.agency) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <p>No Preferred Partner Agency found for this location.</p>
            <Button onClick={() => setStep(1)} variant="outline" className="mt-4">
              Back
            </Button>
          </CardContent>
        </Card>
      );
    }

    const agency = ppaInfo.agency;
    const ppaStatus = ppaInfo.ppa_status;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* PPA Badge Header */}
        <div className="text-center space-y-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2">
            <Award className="w-4 h-4 mr-2" />
            Preferred Partner Agency
          </Badge>
          <h2 className="text-3xl font-bold">Meet your recommended agency</h2>
          <p className="text-gray-600">This agency has been certified as a Preferred Partner for {ppaStatus?.coverage_display}</p>
        </div>

        {/* Agency Overview Card */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              {agency.logo ? (
                <img src={agency.logo} alt={`${agency.name} logo`} className="w-20 h-20 rounded-lg object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Building className="w-8 h-8 text-purple-600" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-2xl font-bold">{agency.name}</h3>
                  <Badge variant="outline">{agency.agency_type}</Badge>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-4">{agency.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>{agency.total_campaigns}</strong> campaigns
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      <strong>{ppaStatus?.total_clients_acquired}</strong> clients served
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">{ppaStatus?.coverage_display}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PPA Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Preferred Partner Benefits</span>
            </CardTitle>
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

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button onClick={() => setStep(1)} variant="outline">
            Back
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? 'Submitting...' : `Connect with ${agency.name}`}
          </Button>
        </div>

        {errors.submit && (
          <div className="text-center text-red-500 text-sm">
            {errors.submit}
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-4">Request Sent Successfully!</h3>
        <p className="text-gray-600 mb-6">
          Your request has been sent to {ppaInfo?.agency?.name}. They'll review your details and get back to you soon.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            What happens next:
          </p>
          <div className="text-left space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Agency reviews your request</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">You'll receive an email with next steps</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Start planning your campaign together</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => router.push('/client-dashboard')}
          className="mt-6"
        >
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNum ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNum}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
}