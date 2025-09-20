"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, MapPin, Banknote } from "lucide-react";
import { campaignTemplates, CampaignTemplate } from "@/utils/campaignTemplates";

interface CampaignTemplateSelectorProps {
  onSelectTemplate: (template: CampaignTemplate) => void;
  onSkipTemplate: () => void;
}

export default function CampaignTemplateSelector({ 
  onSelectTemplate, 
  onSkipTemplate 
}: CampaignTemplateSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleSelectTemplate = () => {
    if (selectedTemplateId) {
      const template = campaignTemplates.find(t => t.id === selectedTemplateId);
      if (template) {
        onSelectTemplate(template);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 1000).toFixed(0)}K`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nationwide': return 'bg-purple-100 text-purple-800';
      case 'city': return 'bg-blue-100 text-blue-800';
      case 'local': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Choose a Campaign Template</h1>
        <p className="text-gray-600">
          Start with a pre-configured template or create from scratch
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {campaignTemplates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplateId === template.id 
                ? 'ring-2 ring-purple-500 border-purple-200' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTemplateId(template.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="text-3xl mb-2">{template.icon}</div>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{template.basicInfo.total_required_riders.toLocaleString()} riders</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{template.estimatedReach}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{template.duration} days</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Banknote className="w-4 h-4 text-gray-500" />
                  <span>{formatCurrency(template.basicInfo.budget)}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-gray-500 mb-1">Rate & Coverage:</div>
                <div className="text-sm">
                  {template.geofences[0].rate_per_hour 
                    ? `₦${template.geofences[0].rate_per_hour}/hour`
                    : 'Variable rates'
                  } • {(template.geofences[0].radius_meters / 1000).toFixed(0)}km radius
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={onSkipTemplate}
          className="px-8"
        >
          Start from Scratch
        </Button>
        
        <Button 
          onClick={handleSelectTemplate}
          disabled={!selectedTemplateId}
          className="px-8"
        >
          Use Selected Template
        </Button>
      </div>
    </div>
  );
}