"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, MessageCircle, HelpCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AgencyLayout from "@/components/AgencyLayout";

export default function HelpPage() {
  const router = useRouter();

  const handleContactClick = (type: string, value: string) => {
    switch (type) {
      case 'phone':
        window.open(`tel:${value}`);
        break;
      case 'email':
        window.open(`mailto:${value}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${value.replace(/[^0-9]/g, '')}`);
        break;
      default:
        break;
    }
  };

  return (
    <AgencyLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-600 mt-1">
            Get help and support for your Stika account
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-purple-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phone */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone Support</p>
                      <p className="text-sm text-gray-600">09011153654</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleContactClick('phone', '09011153654')}
                  >
                    Call Now
                  </Button>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Support</p>
                      <p className="text-sm text-gray-600">support@stika.ng</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleContactClick('email', 'support@stika.ng')}
                  >
                    Send Email
                  </Button>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp Support</p>
                      <p className="text-sm text-gray-600">09011153654</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleContactClick('whatsapp', '09011153654')}
                  >
                    Chat Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Support Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  All times are in West Africa Time (WAT)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ and Resources */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => window.open('/faq.html', '_blank')}
                >
                  <span>Frequently Asked Questions</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => window.open('/getting-started.html', '_blank')}
                >
                  <span>Getting Started Guide</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => window.open('/campaign-guide.html', '_blank')}
                >
                  <span>Campaign Creation Guide</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => window.open('/pricing-information.html', '_blank')}
                >
                  <span>Pricing Information</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Common Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Common Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Campaign Not Launching?</h4>
                    <p className="text-sm text-gray-600">
                      Ensure your account is verified and has sufficient wallet balance.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Payment Issues?</h4>
                    <p className="text-sm text-gray-600">
                      Check your payment method and try again. Contact support if issues persist.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Account Verification?</h4>
                    <p className="text-sm text-gray-600">
                      Complete your profile and upload required documents for verification.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Emergency Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 mb-3">
                  For urgent issues affecting active campaigns or payment problems:
                </p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleContactClick('phone', '+2348031234567')}
                >
                  Emergency Hotline: +234 803 123 4567
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AgencyLayout>
  );
}