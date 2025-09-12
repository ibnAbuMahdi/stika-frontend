"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, Building, MapPin, Calendar, Edit, Shield, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AgencyLayout from "@/components/AgencyLayout";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const { apiService } = await import('@/lib/api');
      
      if (apiService.isAuthenticated()) {
        // Get fresh user data from API
        const response = await apiService.getUserProfile();
        if (response.success && response.user) {
          setUserData(response.user);
        }
      } else {
        // Fallback to localStorage
        const localUserData = localStorage.getItem('user');
        if (localUserData) {
          setUserData(JSON.parse(localUserData));
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Fallback to localStorage on error
      const localUserData = localStorage.getItem('user');
      if (localUserData) {
        setUserData(JSON.parse(localUserData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserTypeDisplay = (userType: string) => {
    switch (userType) {
      case 'agency': return 'Agency User';
      case 'agency_admin': return 'Agency Administrator';
      case 'client': return 'Client';
      case 'rider': return 'Rider';
      default: return 'User';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile data</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AgencyLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-gray-600 mt-1">
              View and manage your account information
            </p>
          </div>
          <Button
            onClick={() => router.push('/settings')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Update Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-purple-500 rounded-full mx-auto mb-4 overflow-hidden">
                    <img
                      src="/api/placeholder/96/96"
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const initials = userData?.full_name?.split(' ').map((n: string) => n[0]).join('') || 
                                        userData?.username?.[0]?.toUpperCase() || 'U';
                        target.parentElement!.innerHTML = `<div class="w-full h-full bg-purple-500 flex items-center justify-center text-white text-2xl font-bold">${initials}</div>`;
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {userData.full_name || userData.username}
                  </h3>
                  <p className="text-gray-600">{getUserTypeDisplay(userData.user_type)}</p>
                  <div className="flex justify-center mt-2">
                    {userData.is_verified ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Stats for Agency Users */}
                {userData.agency && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Wallet Balance</span>
                      <span className="font-medium text-purple-600">
                        ₦{userData.agency.current_balance?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Campaigns</span>
                      <span className="font-medium">
                        {userData.agency.total_campaigns || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Campaigns</span>
                      <span className="font-medium">
                        {userData.agency.active_campaigns || 0}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900 mt-1">{userData.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <p className="text-gray-900 mt-1">{userData.username || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{userData.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Type</label>
                    <p className="text-gray-900 mt-1">{getUserTypeDisplay(userData.user_type)}</p>
                  </div>
                  {userData.position && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Position</label>
                      <p className="text-gray-900 mt-1">{userData.position}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Login</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{formatDate(userData.last_login)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agency Information (for agency users) */}
            {userData.agency && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-600" />
                    Agency Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Agency Name</label>
                      <p className="text-gray-900 mt-1">{userData.agency.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{userData.agency.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">City</label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{userData.agency.city || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">State</label>
                      <p className="text-gray-900 mt-1">{userData.agency.state || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <p className="text-gray-900 mt-1">{userData.agency.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Agency Status</label>
                      <div className="mt-1">
                        {userData.agency.is_verified ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified Agency
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Pending Verification
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Spending</label>
                      <p className="text-gray-900 mt-1">₦{userData.agency.total_spend?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Verification</label>
                    <div className="flex items-center gap-2 mt-1">
                      {userData.is_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      {userData.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/auth/change-password')}
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AgencyLayout>
  );
}