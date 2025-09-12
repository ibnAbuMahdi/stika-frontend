"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AgencyLayout from "@/components/AgencyLayout";
import { ArrowLeft, Save, Building2, Loader } from "lucide-react";

interface CompanyFormData {
  name: string;
  registration_number: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  website: string;
  description: string;
  agency_type: string;
  position_in_company: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    registration_number: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    website: "",
    description: "",
    agency_type: "",
    position_in_company: "",
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load existing agency profile data
  useEffect(() => {
    const loadAgencyProfile = async () => {
      try {
        const { apiService } = await import('@/lib/api');
        const response = await apiService.getAgencyProfile();
        
        if (response.success && response.agency) {
          const agency = response.agency;
          setFormData({
            name: agency.name || "",
            registration_number: agency.registration_number || "",
            email: agency.email || "",
            phone: agency.phone || "",
            address: agency.address || "",
            city: agency.city || "",
            state: agency.state || "",
            website: agency.website || "",
            description: agency.description || "",
            agency_type: agency.agency_type || "",
            position_in_company: agency.position_in_company || "",
          });
        }
      } catch (error) {
        console.error("Failed to load agency profile:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAgencyProfile();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Company address is required";
    }
    
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    // Email is now required
    if (!formData.email.trim()) {
      newErrors.email = "Company email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Registration number is now required
    if (!formData.registration_number.trim()) {
      newErrors.registration_number = "RC Number is required";
    } else if (formData.registration_number.length < 6) {
      newErrors.registration_number = "RC Number must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { apiService } = await import('@/lib/api');
      const response = await apiService.updateCompanyInfo(formData);
      
      if (response.success) {
        // Show success message
        alert("Company information updated successfully!");
        
        // Redirect back to dashboard
        router.push('/dashboard');
      } else {
        // Handle validation errors from backend
        if (response.errors) {
          setErrors(response.errors);
        } else {
          alert(response.message || "Failed to update company information");
        }
      }
    } catch (error: any) {
      console.error("Failed to update company info:", error);
      alert(error.message || "Failed to update company information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading company information...</p>
        </div>
      </div>
    );
  }

  return (
    <AgencyLayout>
      <div className="p-8">

        {/* Company Info Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Company Details</CardTitle>
            <p className="text-sm text-gray-600">
              Complete your company profile to start creating campaigns. Fields marked with * are required.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name and Contact Person */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your company name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="position_in_company">Position in Company</Label>
                  <Input
                    id="position_in_company"
                    type="text"
                    placeholder="e.g., CEO, Marketing Director, Account Manager"
                    value={formData.position_in_company}
                    onChange={(e) => handleInputChange('position_in_company', e.target.value)}
                  />
                </div>
              </div>

              {/* Registration and Agency Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="registration_number">RC Number *</Label>
                  <Input
                    id="registration_number"
                    type="text"
                    placeholder="Company registration number"
                    value={formData.registration_number}
                    onChange={(e) => handleInputChange('registration_number', e.target.value)}
                    className={errors.registration_number ? "border-red-500" : ""}
                  />
                  {errors.registration_number && (
                    <p className="text-red-500 text-sm mt-1">{errors.registration_number}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="agency_type">Agency Type</Label>
                  <Select 
                    value={formData.agency_type} 
                    onValueChange={(value) => handleInputChange('agency_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agency type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital">Digital Agency</SelectItem>
                      <SelectItem value="traditional">Traditional Agency</SelectItem>
                      <SelectItem value="full_service">Full Service Agency</SelectItem>
                      <SelectItem value="boutique">Boutique Agency</SelectItem>
                      <SelectItem value="in_house">In-House Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Company Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="company@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Website */}
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.yourcompany.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Company Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete company address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={errors.address ? "border-red-500" : ""}
                  rows={3}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Lagos"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={(value) => handleInputChange('state', value)}
                  >
                    <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Abia">Abia</SelectItem>
                      <SelectItem value="Adamawa">Adamawa</SelectItem>
                      <SelectItem value="Akwa Ibom">Akwa Ibom</SelectItem>
                      <SelectItem value="Anambra">Anambra</SelectItem>
                      <SelectItem value="Bauchi">Bauchi</SelectItem>
                      <SelectItem value="Bayelsa">Bayelsa</SelectItem>
                      <SelectItem value="Benue">Benue</SelectItem>
                      <SelectItem value="Borno">Borno</SelectItem>
                      <SelectItem value="Cross River">Cross River</SelectItem>
                      <SelectItem value="Delta">Delta</SelectItem>
                      <SelectItem value="Ebonyi">Ebonyi</SelectItem>
                      <SelectItem value="Edo">Edo</SelectItem>
                      <SelectItem value="Ekiti">Ekiti</SelectItem>
                      <SelectItem value="Enugu">Enugu</SelectItem>
                      <SelectItem value="FCT">FCT (Abuja)</SelectItem>
                      <SelectItem value="Gombe">Gombe</SelectItem>
                      <SelectItem value="Imo">Imo</SelectItem>
                      <SelectItem value="Jigawa">Jigawa</SelectItem>
                      <SelectItem value="Kaduna">Kaduna</SelectItem>
                      <SelectItem value="Kano">Kano</SelectItem>
                      <SelectItem value="Katsina">Katsina</SelectItem>
                      <SelectItem value="Kebbi">Kebbi</SelectItem>
                      <SelectItem value="Kogi">Kogi</SelectItem>
                      <SelectItem value="Kwara">Kwara</SelectItem>
                      <SelectItem value="Lagos">Lagos</SelectItem>
                      <SelectItem value="Nasarawa">Nasarawa</SelectItem>
                      <SelectItem value="Niger">Niger</SelectItem>
                      <SelectItem value="Ogun">Ogun</SelectItem>
                      <SelectItem value="Ondo">Ondo</SelectItem>
                      <SelectItem value="Osun">Osun</SelectItem>
                      <SelectItem value="Oyo">Oyo</SelectItem>
                      <SelectItem value="Plateau">Plateau</SelectItem>
                      <SelectItem value="Rivers">Rivers</SelectItem>
                      <SelectItem value="Sokoto">Sokoto</SelectItem>
                      <SelectItem value="Taraba">Taraba</SelectItem>
                      <SelectItem value="Yobe">Yobe</SelectItem>
                      <SelectItem value="Zamfara">Zamfara</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your company and services"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Company Info
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Why do we need this information?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Company details are required to create and manage advertising campaigns</li>
            <li>• Contact information ensures smooth communication and support</li>
            <li>• RC Number helps with business verification and compliance</li>
            <li>• Address information is needed for legal and administrative purposes</li>
          </ul>
        </div>
      </div>
    </AgencyLayout>
  );
}