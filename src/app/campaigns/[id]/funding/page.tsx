"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, DollarSign, Users, AlertTriangle, CheckCircle, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function CampaignFundingPage() {
  const params = useParams();
  const id = params.id as string;
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingType, setFundingType] = useState<'agency_wallet' | 'client_payment'>('agency_wallet');
  const [isLoading, setIsLoading] = useState(false);

  // Mock campaign data with funding details - will come from API
  const campaignData = {
    id: id,
    name: "Lagos Traffic Campaign",
    client: { id: '1', name: 'Coca Cola Nigeria', wallet_balance: 50000 },
    total_budget: 75000,
    funding_source: 'shared' as const,
    agency_contribution: 30000,
    client_contribution: 45000,
    funding_status: 'partial' as 'pending' | 'partial' | 'funded',
    funded_amount: 30000,
    remaining_amount: 45000,
    status: 'pending_funding',
    
    // Funding transactions
    funding_transactions: [
      {
        id: 1,
        amount: 30000,
        funding_type: 'agency_wallet',
        funded_by: 'Your Agency',
        payment_status: 'completed',
        processed_at: '2025-01-08T10:00:00Z',
        description: 'Agency wallet funding'
      }
    ],
    
    // Agency wallet info
    agency_wallet: {
      balance: 25000,
      available_balance: 20000
    }
  };

  const handleProvideFunding = async () => {
    if (!fundingAmount || parseFloat(fundingAmount) < 1000) {
      alert("Minimum funding amount is ₦1,000");
      return;
    }

    const amount = parseFloat(fundingAmount);
    if (amount > campaignData.remaining_amount) {
      alert(`Amount cannot exceed remaining funding needed: ₦${campaignData.remaining_amount.toLocaleString()}`);
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Process funding based on type
      console.log("Provide funding:", { amount, fundingType, campaignId: id });
      
      // Simulate funding process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowFundModal(false);
      setFundingAmount("");
      window.location.reload();
    } catch (error) {
      console.error("Funding failed:", error);
      alert("Funding failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestClientFunding = async () => {
    try {
      // TODO: Send funding request to client
      console.log("Request client funding for campaign:", params.id);
      alert("Funding request sent to client. They will be notified via email.");
    } catch (error) {
      console.error("Failed to request funding:", error);
      alert("Failed to send funding request.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFundingStatusInfo = () => {
    const percentage = (campaignData.funded_amount / campaignData.total_budget) * 100;
    
    switch (campaignData.funding_status) {
      case 'pending':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: Clock };
      case 'partial':
        return { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: DollarSign };
      case 'funded':
        return { color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: CheckCircle };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: AlertTriangle };
    }
  };

  const statusInfo = getFundingStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.location.href = `/campaigns/${params.id}`}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaign Funding</h1>
            <p className="text-gray-600">{campaignData.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Funding Overview */}
            <Card className={`${statusInfo.bg} border`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
                  <div>
                    <h3 className={`font-semibold ${statusInfo.color}`}>
                      {campaignData.funding_status === 'partial' ? 'Partially Funded' : 
                       campaignData.funding_status === 'funded' ? 'Fully Funded' : 'Funding Pending'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ₦{campaignData.funded_amount.toLocaleString()} of ₦{campaignData.total_budget.toLocaleString()} funded
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${(campaignData.funded_amount / campaignData.total_budget) * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Funded Amount:</span>
                    <span className="font-semibold ml-2">₦{campaignData.funded_amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-semibold ml-2">₦{campaignData.remaining_amount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funding Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Agency Contribution</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        ₦{campaignData.agency_contribution.toLocaleString()}
                      </p>
                      <Badge variant="success" className="mt-2">Funded</Badge>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Client Contribution</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        ₦{campaignData.client_contribution.toLocaleString()}
                      </p>
                      <Badge variant="warning" className="mt-2">Pending</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funding Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Funding History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignData.funding_transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            by {transaction.funded_by} • {new Date(transaction.processed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₦{transaction.amount.toLocaleString()}</p>
                        <Badge className={getStatusColor(transaction.payment_status)} size="sm">
                          {transaction.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {campaignData.funding_transactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No funding transactions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {campaignData.remaining_amount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Funding Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowFundModal(true)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Provide Funding
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleRequestClientFunding}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Request Client Funding
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Campaign Info */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-semibold">{campaignData.client.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Budget:</span>
                  <span className="font-semibold">₦{campaignData.total_budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Funding Source:</span>
                  <Badge variant="info">{campaignData.funding_source}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="warning">{campaignData.status.replace('_', ' ')}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Balances */}
            <Card>
              <CardHeader>
                <CardTitle>Available Balances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-700 font-medium">Agency Wallet</span>
                    <span className="font-semibold">₦{campaignData.agency_wallet.available_balance.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Client Wallet</span>
                    <span className="font-semibold">₦{campaignData.client.wallet_balance.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Provide Campaign Funding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Funding Source</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={fundingType === 'agency_wallet' ? 'default' : 'outline'}
                    onClick={() => setFundingType('agency_wallet')}
                    className="justify-start"
                  >
                    Agency Wallet
                  </Button>
                  <Button
                    variant={fundingType === 'client_payment' ? 'default' : 'outline'}
                    onClick={() => setFundingType('client_payment')}
                    className="justify-start"
                  >
                    Direct Payment
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="fundingAmount">Amount (NGN) *</Label>
                <Input
                  id="fundingAmount"
                  type="number"
                  min="1000"
                  max={campaignData.remaining_amount}
                  placeholder={campaignData.remaining_amount.toString()}
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Remaining needed: ₦{campaignData.remaining_amount.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFundingAmount((campaignData.remaining_amount / 2).toString())}
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFundingAmount(campaignData.remaining_amount.toString())}
                >
                  Full Amount
                </Button>
              </div>

              {fundingType === 'agency_wallet' && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-800">Agency Wallet (₦{campaignData.agency_wallet.available_balance.toLocaleString()} available)</span>
                  </div>
                </div>
              )}

              {fundingType === 'client_payment' && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">Direct payment gateway</span>
                  </div>
                </div>
              )}

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
                  onClick={handleProvideFunding}
                  disabled={isLoading || !fundingAmount}
                >
                  {isLoading ? "Processing..." : "Fund Campaign"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}