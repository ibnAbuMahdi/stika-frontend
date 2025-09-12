"use client";

import { useState } from "react";
import { ArrowLeft, RotateCcw, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface AutoReloadSettings {
  enabled: boolean;
  trigger_amount: number;
  reload_amount: number;
  max_daily_reloads: number;
  payment_method_id: string;
}

export default function AutoReloadPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock auto-reload settings - will come from API
  const [settings, setSettings] = useState<AutoReloadSettings>({
    enabled: false,
    trigger_amount: 5000,
    reload_amount: 25000,
    max_daily_reloads: 3,
    payment_method_id: '1'
  });

  // Mock payment methods for selection
  const paymentMethods = [
    { id: '1', name: 'Visa •••• 4242', type: 'card' },
    { id: '2', name: 'Access Bank •••• 0123', type: 'bank' },
  ];

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Save auto-reload settings via API
      console.log("Save auto-reload settings:", settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert("Auto-reload settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Auto-Reload Settings</h1>
            <p className="text-gray-600">Automatically fund your wallet when balance gets low</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Auto-Reload Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Auto-Reload Status</h3>
                    <p className="text-sm text-gray-600">
                      {settings.enabled ? 'Enabled - Your wallet will auto-reload when needed' : 'Disabled - Manual funding required'}
                    </p>
                  </div>
                </div>
                <Badge variant={settings.enabled ? 'success' : 'secondary'}>
                  {settings.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Settings Form */}
          <Card>
            <CardHeader>
              <CardTitle>Auto-Reload Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enableAutoReload"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked as boolean }))}
                />
                <Label htmlFor="enableAutoReload" className="font-medium">
                  Enable Auto-Reload
                </Label>
              </div>

              {settings.enabled && (
                <>
                  {/* Trigger Amount */}
                  <div>
                    <Label htmlFor="triggerAmount">Trigger Amount (NGN)</Label>
                    <Input
                      id="triggerAmount"
                      type="number"
                      min="1000"
                      step="500"
                      value={settings.trigger_amount}
                      onChange={(e) => setSettings(prev => ({ ...prev, trigger_amount: parseFloat(e.target.value) || 0 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-reload when wallet balance drops below this amount
                    </p>
                  </div>

                  {/* Reload Amount */}
                  <div>
                    <Label htmlFor="reloadAmount">Reload Amount (NGN)</Label>
                    <Input
                      id="reloadAmount"
                      type="number"
                      min="5000"
                      step="1000"
                      value={settings.reload_amount}
                      onChange={(e) => setSettings(prev => ({ ...prev, reload_amount: parseFloat(e.target.value) || 0 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Amount to add to wallet each time auto-reload triggers
                    </p>
                  </div>

                  {/* Max Daily Reloads */}
                  <div>
                    <Label htmlFor="maxReloads">Maximum Daily Reloads</Label>
                    <Select 
                      value={settings.max_daily_reloads.toString()} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, max_daily_reloads: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 reload per day</SelectItem>
                        <SelectItem value="2">2 reloads per day</SelectItem>
                        <SelectItem value="3">3 reloads per day</SelectItem>
                        <SelectItem value="5">5 reloads per day</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Safety limit to prevent excessive charges
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select 
                      value={settings.payment_method_id} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, payment_method_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Payment method to use for auto-reload. <a href="/wallet/payment-methods" className="text-purple-600 underline">Manage payment methods</a>
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Auto-Reload Preview</h4>
                    <div className="text-sm text-purple-800 space-y-1">
                      <p>• When balance drops below <strong>₦{settings.trigger_amount.toLocaleString()}</strong></p>
                      <p>• Add <strong>₦{settings.reload_amount.toLocaleString()}</strong> to wallet</p>
                      <p>• Maximum <strong>{settings.max_daily_reloads} times per day</strong></p>
                      <p>• Using: <strong>{paymentMethods.find(m => m.id === settings.payment_method_id)?.name}</strong></p>
                    </div>
                  </div>
                </>
              )}

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleSaveSettings}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Important Information</h3>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Auto-reload triggers are checked every 5 minutes</li>
                    <li>• You'll receive email notifications for each auto-reload</li>
                    <li>• Daily limits reset at midnight (WAT)</li>
                    <li>• Failed auto-reloads will pause the feature until manually re-enabled</li>
                    <li>• You can disable auto-reload at any time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}