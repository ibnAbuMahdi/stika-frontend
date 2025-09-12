"use client";

import { useState } from "react";
import { ArrowLeft, Plus, CreditCard, Trash2, Edit, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  bank_name?: string;
  account_name?: string;
  is_default: boolean;
  expires?: string;
}

export default function PaymentMethodsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'card' | 'bank_account'>('card');
  const [isLoading, setIsLoading] = useState(false);

  // Mock payment methods - will come from API
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      is_default: true,
      expires: '12/26'
    },
    {
      id: '2',
      type: 'bank_account',
      last4: '0123',
      bank_name: 'Access Bank',
      account_name: 'John Doe',
      is_default: false
    }
  ]);

  const handleAddPaymentMethod = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Integrate with payment gateway API
      console.log("Add payment method:", paymentType);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add payment method:", error);
      alert("Failed to add payment method. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        is_default: method.id === methodId
      }))
    );
  };

  const handleDeleteMethod = (methodId: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      setPaymentMethods(methods => methods.filter(method => method.id !== methodId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.href = "/wallet"}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
            <p className="text-gray-600">Manage your payment methods for wallet funding</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Add Payment Method Button */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Add New Payment Method</h3>
                  <p className="text-sm text-gray-600">Add a card or bank account for wallet funding</p>
                </div>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No payment methods</h3>
                  <p className="text-gray-600 mb-4">Add a payment method to fund your wallet</p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Payment Method
                  </Button>
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {method.type === 'card' 
                              ? `${method.brand} •••• ${method.last4}`
                              : `${method.bank_name} •••• ${method.last4}`
                            }
                          </p>
                          {method.is_default && (
                            <Badge variant="success" size="sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {method.type === 'card' 
                            ? `Expires ${method.expires}`
                            : method.account_name
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteMethod(method.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Security & Privacy</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• All payment information is encrypted and secured</li>
                    <li>• We use Paystack's secure payment infrastructure</li>
                    <li>• Card details are never stored on our servers</li>
                    <li>• Bank account information is tokenized for security</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Add Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Type Selection */}
              <div>
                <Label>Payment Method Type</Label>
                <Select value={paymentType} onValueChange={(value: 'card' | 'bank_account') => setPaymentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Debit/Credit Card</SelectItem>
                    <SelectItem value="bank_account">Bank Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentType === 'card' ? (
                <>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="access">Access Bank</SelectItem>
                        <SelectItem value="gtbank">GTBank</SelectItem>
                        <SelectItem value="firstbank">First Bank</SelectItem>
                        <SelectItem value="zenith">Zenith Bank</SelectItem>
                        <SelectItem value="uba">UBA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="0123456789"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      placeholder="John Doe"
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Account name will be verified automatically
                    </p>
                  </div>
                </>
              )}

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Adding a payment method will verify it with a small charge 
                  (₦50) which will be refunded immediately.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleAddPaymentMethod}
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Payment Method"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}