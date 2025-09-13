"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      const { apiService } = await import('@/lib/api');
      const response = await apiService.forgotPassword(email);

      if (response.success) {
        setEmailSent(true);
      } else {
        setError(response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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

              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                If an account with this email exists, we've sent you a password reset link.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Didn't receive the email?</strong><br />
                  Check your spam folder or try again in a few minutes.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Try Different Email
                </Button>
                
                <Button asChild className="w-full">
                  <Link href="/auth/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
          <div className="text-center mb-8">
            <img 
              src="/Stika.svg" 
              alt="Stika Logo" 
              className="w-24 h-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="mt-1"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/auth/login" className="font-medium text-purple-600 hover:text-purple-500">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}