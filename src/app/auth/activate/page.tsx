"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ActivateAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userType, setUserType] = useState<'agency' | 'client'>('agency');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid activation link. Please check your email for the correct link.');
      return;
    }

    const activateAccount = async () => {
      try {
        const { apiService } = await import('@/lib/api');
        const response = await apiService.activateAccount(token, email);

        if (response.success) {
          setStatus('success');
          setMessage('Account activated successfully! You can now log in.');
          setUserType(response.user_type || 'agency');
        } else {
          setStatus('error');
          setMessage(response.message || 'Account activation failed.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Account activation failed. Please try again.');
      }
    };

    activateAccount();
  }, [searchParams]);

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleResendActivation = async () => {
    const email = searchParams.get('email');
    if (!email) return;

    try {
      const { apiService } = await import('@/lib/api');
      await apiService.resendActivation(email);
      alert('Activation email sent! Please check your inbox.');
    } catch (error) {
      alert('Failed to send activation email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          className="mb-8 p-0 h-auto font-normal text-gray-600"
          asChild
        >
          <Link href="/auth/login" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </Button>

        <Card className="p-8 border-0 shadow-lg">
          <div className="text-center">
            <div className="mb-6">
              <img 
                src="/Stika.svg" 
                alt="Stika Logo" 
                className="w-24 h-auto mx-auto mb-4"
              />
            </div>

            {status === 'loading' && (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Activating Your Account</h1>
                <p className="text-gray-600">Please wait while we activate your account...</p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="space-y-3">
                  <Button onClick={handleLogin} className="w-full">
                    Continue to Login
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    You can now access your {userType === 'agency' ? 'Agency Dashboard' : 'Client Portal'}
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Activation Failed</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="space-y-3">
                  <Button onClick={handleResendActivation} variant="outline" className="w-full">
                    Resend Activation Email
                  </Button>
                  
                  <Button onClick={handleLogin} className="w-full">
                    Back to Login
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    If you continue to have issues, please contact our support team.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}