"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Users, Clock, CheckCircle, XCircle, Link, Copy, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AgencyLayout from "@/components/AgencyLayout";

export default function ClientsPage() {
  const router = useRouter();
  
  // State management
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCode, setIsCreatingCode] = useState(false);
  const [showCreateInviteModal, setShowCreateInviteModal] = useState(false);
  const [showJoinRequestDetails, setShowJoinRequestDetails] = useState<any>(null);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    max_uses: 1,
    expires_hours: 24
  });

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setIsLoading(true);
      const { apiService } = await import('@/lib/api');
      const [requestsResponse, codesResponse] = await Promise.all([
        apiService.getAgencyJoinRequests(),
        apiService.getAgencyInviteCodes()
      ]);
      
      if (requestsResponse.success) {
        setJoinRequests(requestsResponse.join_requests || []);
      }
      
      if (codesResponse.success) {
        setInviteCodes(codesResponse.invite_codes || []);
      }
    } catch (error) {
      console.error('Failed to load client data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, action: 'approve' | 'reject', message?: string) => {
    try {
      const { apiService } = await import('@/lib/api');
      const response = await apiService.respondToJoinRequest(requestId, action, message);
      
      if (response.success) {
        alert(`Request ${action}d successfully!`);
        loadClientData(); // Reload the data
        setShowJoinRequestDetails(null); // Close modal
      } else {
        alert(response.message || `Failed to ${action} request`);
      }
    } catch (error: any) {
      console.error(`Failed to ${action} request:`, error);
      alert(error.message || `Failed to ${action} request`);
    }
  };

  const handleCreateInviteCode = async () => {
    if (!inviteForm.name.trim()) return;
    
    try {
      setIsCreatingCode(true);
      const { apiService } = await import('@/lib/api');
      const response = await apiService.createInviteCode({
        name: inviteForm.name,
        max_uses: inviteForm.max_uses,
        expires_hours: inviteForm.expires_hours
      });
      
      if (response.success) {
        alert('Invite code created successfully!');
        setShowCreateInviteModal(false);
        setInviteForm({ name: '', max_uses: 1, expires_hours: 24 });
        loadClientData(); // Reload to show new code
      } else {
        alert(response.message || 'Failed to create invite code');
      }
    } catch (error: any) {
      console.error('Failed to create invite code:', error);
      alert(error.message || 'Failed to create invite code');
    } finally {
      setIsCreatingCode(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Check if navigator.clipboard is available
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
      } else {
        // Fallback method for older browsers or insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            alert('Copied to clipboard!');
          } else {
            throw new Error('Copy command failed');
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard. Please copy the text manually.');
    }
  };

  const pendingRequests = joinRequests.filter(req => req.status === 'pending');
  const activeInviteCodes = inviteCodes.filter(code => code.is_valid);

  return (
    <AgencyLayout>
      <div className="p-8">
        {/* Create Invite Code Button */}
        <div className="mb-8 flex justify-end">
          <Button
            onClick={() => setShowCreateInviteModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invite Code
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {joinRequests.filter(req => req.status === 'approved').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingRequests.length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Invite Codes</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeInviteCodes.length}
                  </p>
                </div>
                <Link className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {joinRequests.length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading client data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Join Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Join Requests
                  {pendingRequests.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingRequests.length} pending
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {joinRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No join requests yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Share invite codes to get clients to join your agency
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-lg">{request.company_name}</p>
                            <p className="text-sm text-gray-600">{request.industry}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(request.created_at).toLocaleDateString()} • {request.client.email}
                            </p>
                          </div>
                          <Badge 
                            className={
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        
                        {request.expected_budget && (
                          <p className="text-sm text-gray-600 mb-3">
                            Expected budget: ₦{request.expected_budget.toLocaleString()}/month
                          </p>
                        )}
                        
                        {request.message && (
                          <p className="text-sm bg-gray-50 p-2 rounded mb-3 line-clamp-2">
                            "{request.message}"
                          </p>
                        )}
                        
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleRespondToRequest(request.id, 'approve')}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleRespondToRequest(request.id, 'reject')}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setShowJoinRequestDetails(request)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invite Codes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Invite Codes
                  <Badge variant="secondary" className="ml-2">
                    {inviteCodes.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inviteCodes.length === 0 ? (
                  <div className="text-center py-8">
                    <Link className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No invite codes created</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Create invite codes to easily onboard new clients
                    </p>
                    <Button 
                      className="mt-4 bg-green-600 hover:bg-green-700"
                      onClick={() => setShowCreateInviteModal(true)}
                    >
                      Create First Code
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inviteCodes.map((code) => (
                      <div key={code.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-mono font-bold text-xl text-purple-600">{code.code}</p>
                            <p className="text-sm font-medium text-gray-900">{code.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {code.current_uses}/{code.max_uses} uses • Created {new Date(code.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={code.is_valid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            >
                              {code.is_valid ? 'Active' : 'Inactive'}
                            </Badge>
                            {code.expires_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                Expires {new Date(code.expires_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => copyToClipboard(code.code)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Code
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => copyToClipboard(code.share_url)}
                          >
                            <Link className="w-3 h-3 mr-1" />
                            Copy URL
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Invite Code Modal */}
      {showCreateInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create Invite Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code Name *
                </label>
                <Input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                  placeholder="e.g., Social Media Campaign"
                  disabled={isCreatingCode}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Uses
                </label>
                <Input
                  type="number"
                  value={inviteForm.max_uses}
                  onChange={(e) => setInviteForm({...inviteForm, max_uses: parseInt(e.target.value) || 1})}
                  min="1"
                  disabled={isCreatingCode}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires In (Hours)
                </label>
                <Input
                  type="number"
                  value={inviteForm.expires_hours}
                  onChange={(e) => setInviteForm({...inviteForm, expires_hours: parseInt(e.target.value) || 24})}
                  min="1"
                  disabled={isCreatingCode}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave as 24 for 1 day, 168 for 1 week, 0 for no expiry
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateInviteModal(false)}
                  disabled={isCreatingCode}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleCreateInviteCode}
                  disabled={!inviteForm.name.trim() || isCreatingCode}
                >
                  {isCreatingCode ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Code
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Join Request Details Modal */}
      {showJoinRequestDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Join Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-xl">{showJoinRequestDetails.company_name}</p>
                <p className="text-gray-600 capitalize">{showJoinRequestDetails.industry}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Contact Person</p>
                <p className="font-medium">{showJoinRequestDetails.client.full_name}</p>
                <p className="text-sm text-gray-600">{showJoinRequestDetails.client.email}</p>
              </div>
              
              {showJoinRequestDetails.expected_budget && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Expected Monthly Budget</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₦{showJoinRequestDetails.expected_budget.toLocaleString()}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-700">Source</p>
                <p className="text-sm capitalize">{showJoinRequestDetails.source.replace('_', ' ')}</p>
              </div>
              
              {showJoinRequestDetails.message && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Message</p>
                  <p className="text-sm bg-gray-50 p-3 rounded border">{showJoinRequestDetails.message}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowJoinRequestDetails(null)}
                >
                  Close
                </Button>
                {showJoinRequestDetails.status === 'pending' && (
                  <>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleRespondToRequest(showJoinRequestDetails.id, 'reject')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleRespondToRequest(showJoinRequestDetails.id, 'approve')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AgencyLayout>
  );
}