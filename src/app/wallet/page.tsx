"use client";

import { useState } from "react";
import { ArrowLeft, Plus, CreditCard, History, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AgencyLayout from "@/components/AgencyLayout";

export default function WalletPage() {
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock wallet data - will come from API
  const walletData = {
    balance: 2000.00,
    totalSpent: 210000.00,
    pendingCharges: 5000.00,
    transactions: [
      {
        id: 1,
        type: "debit",
        description: "Lagos Traffic Campaign",
        amount: 25000,
        date: "2025-01-08",
        status: "completed"
      },
      {
        id: 2,
        type: "credit",
        description: "Wallet Top-up",
        amount: 50000,
        date: "2025-01-05",
        status: "completed"
      },
      {
        id: 3,
        type: "debit",
        description: "Victoria Island Campaign",
        amount: 35000,
        date: "2025-01-03",
        status: "completed"
      },
      {
        id: 4,
        type: "credit",
        description: "Wallet Top-up",
        amount: 100000,
        date: "2025-01-01",
        status: "completed"
      }
    ]
  };

  const handleFundWallet = async () => {
    if (!fundAmount || parseFloat(fundAmount) < 1000) {
      alert("Minimum funding amount is ₦1,000");
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Integrate with payment gateway
      console.log("Fund wallet:", fundAmount);
      
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Close modal and refresh page
      setShowFundModal(false);
      setFundAmount("");
      window.location.reload();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AgencyLayout>
      <div className="p-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Available Balance</p>
                      <p className="text-2xl font-bold">₦{walletData.balance.toLocaleString()}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">₦{walletData.totalSpent.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Pending Charges</p>
                      <p className="text-2xl font-bold text-orange-600">₦{walletData.pendingCharges.toLocaleString()}</p>
                    </div>
                    <History className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletData.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'credit' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowFundModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Fund Wallet
                </Button>
                
                <Button variant="outline" className="w-full">
                  <History className="h-4 w-4 mr-2" />
                  Download Statement
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = "/wallet/payment-methods"}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Button>
              </CardContent>
            </Card>

            {/* Wallet Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Wallet Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <p>Keep a buffer of 20% above your campaign budget for optimal performance</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <p>Funds are charged daily as campaigns run</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <p>
                      <a href="/wallet/auto-reload" className="text-purple-600 underline hover:text-purple-700">
                        Auto-reload available
                      </a> to maintain continuous campaigns
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Fund Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="fundAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (NGN) *
                </label>
                <Input
                  id="fundAmount"
                  type="number"
                  min="1000"
                  placeholder="10000"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: ₦1,000</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[5000, 10000, 25000].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setFundAmount(amount.toString())}
                  >
                    ₦{amount.toLocaleString()}
                  </Button>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Payment Method</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Paystack Gateway (Card/Bank Transfer)</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowFundModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleFundWallet}
                  disabled={isLoading || !fundAmount}
                >
                  {isLoading ? "Processing..." : "Fund Wallet"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AgencyLayout>
  );
}