"use client";

import { useState } from "react";
import { ArrowLeft, Plus, CreditCard, History, TrendingUp, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClientWalletPageProps {
  params: { id: string };
}

export default function ClientWalletPage({ params }: ClientWalletPageProps) {
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock client data - will come from API
  const clientData = {
    id: params.id,
    name: "Coca Cola Nigeria",
    client_type: "corporate",
    wallet: {
      balance: 50000.00,
      available_balance: 45000.00,
      reserved_balance: 5000.00,
      total_funded: 150000.00,
      total_spent: 100000.00,
    },
    transactions: [
      {
        id: 1,
        type: "spend",
        description: "Lagos Traffic Campaign - Reserved",
        amount: 5000,
        date: "2025-01-08",
        status: "completed",
        campaign_name: "Lagos Traffic Campaign"
      },
      {
        id: 2,
        type: "fund",
        description: "Wallet Top-up via Bank Transfer",
        amount: 50000,
        date: "2025-01-05",
        status: "completed"
      },
      {
        id: 3,
        type: "spend",
        description: "Victoria Island Campaign",
        amount: 35000,
        date: "2025-01-03",
        status: "completed",
        campaign_name: "Victoria Island Campaign"
      },
      {
        id: 4,
        type: "fund",
        description: "Initial Wallet Funding",
        amount: 100000,
        date: "2025-01-01",
        status: "completed"
      }
    ],
    campaigns: [
      { id: 1, name: "Lagos Traffic Campaign", status: "pending_funding", required_amount: 25000 },
      { id: 2, name: "Victoria Island Campaign", status: "active", funded_amount: 35000 },
    ]
  };

  const handleFundWallet = async () => {
    if (!fundAmount || parseFloat(fundAmount) < 1000) {
      alert("Minimum funding amount is ₦1,000");
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Integrate with payment gateway for client payments
      console.log("Fund client wallet:", fundAmount);
      
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.href = "/clients"}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clientData.name} - Wallet</h1>
            <p className="text-gray-600">Manage client campaign funding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Available Balance</p>
                      <p className="text-2xl font-bold">₦{clientData.wallet.available_balance.toLocaleString()}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Reserved Funds</p>
                      <p className="text-2xl font-bold text-orange-600">₦{clientData.wallet.reserved_balance.toLocaleString()}</p>
                    </div>
                    <History className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Spent</p>
                      <p className="text-2xl font-bold text-green-600">₦{clientData.wallet.total_spent.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Campaigns */}
            {clientData.campaigns.filter(c => c.status === 'pending_funding').length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-5 w-5" />
                    Campaigns Awaiting Funding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientData.campaigns.filter(c => c.status === 'pending_funding').map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <p className="font-medium text-gray-900">{campaign.name}</p>
                          <p className="text-sm text-gray-600">Requires funding to start</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-amber-700">₦{campaign.required_amount.toLocaleString()}</p>
                          <Badge variant="warning" size="sm">Pending</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientData.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'fund' 
                            ? 'bg-green-100 text-green-600' 
                            : transaction.type === 'spend'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-orange-100 text-orange-600'
                        }`}>
                          {transaction.type === 'fund' ? '+' : transaction.type === 'spend' ? '-' : '◐'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">{transaction.date}</p>
                            {transaction.campaign_name && (
                              <Badge variant="secondary" size="sm">{transaction.campaign_name}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'fund' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'fund' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowFundModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Fund Wallet
                </Button>
                
                <Button variant="outline" className="w-full">
                  <History className="h-4 w-4 mr-2" />
                  Download Statement
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  View Campaigns
                </Button>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client Type:</span>
                  <Badge variant="info">{clientData.client_type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Funded:</span>
                  <span className="font-semibold">₦{clientData.wallet.total_funded.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Balance:</span>
                  <span className="font-semibold">₦{clientData.wallet.balance.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Funding Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p>Fund campaigns before they start to ensure immediate activation</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p>Reserved funds are automatically held for approved campaigns</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p>Unused funds remain in your wallet for future campaigns</p>
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
              <CardTitle>Fund Client Wallet</CardTitle>
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
                {[10000, 25000, 50000].map((amount) => (
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
                  <span>Client Direct Payment (Card/Bank Transfer)</span>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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
    </div>
  );
}