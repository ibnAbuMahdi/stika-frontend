export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'nationwide' | 'city' | 'local';
  estimatedReach: string;
  duration: number; // in days
  basicInfo: {
    name: string;
    description: string;
    campaign_duration_days: number;
    budget: number;
    total_required_riders: number;
  };
  geofences: Array<{
    name: string;
    description: string;
    priority: number;
    center_latitude: number;
    center_longitude: number;
    radius_meters: number;
    budget: number;
    rate_type: 'per_km' | 'per_hour' | 'fixed_daily' | 'hybrid';
    rate_per_hour?: number;
    rate_per_km?: number;
    fixed_daily_rate?: number;
  }>;
}

export const campaignTemplates: CampaignTemplate[] = [
  {
    id: 'nationwide',
    name: 'Nationwide Campaign',
    description: 'Large-scale campaign covering major cities across Nigeria',
    icon: '🇳🇬',
    category: 'nationwide',
    estimatedReach: '10M+ people',
    duration: 30,
    basicInfo: {
      name: 'Nationwide Brand Campaign',
      description: 'A comprehensive nationwide campaign to maximize brand visibility across Nigeria\'s major cities and highways.',
      campaign_duration_days: 30,
      budget: 15000000, // ₦15M total budget
      total_required_riders: 10000,
    },
    geofences: [
      {
        name: 'Nigeria Nationwide',
        description: 'Nationwide coverage including Lagos, Abuja, Kano, Port Harcourt, and other major cities',
        priority: 1,
        center_latitude: 9.0765, // Center of Nigeria
        center_longitude: 7.3986,
        radius_meters: 1000000, // 1000km radius
        budget: 15000000, // ₦15M
        rate_type: 'per_hour',
        rate_per_hour: 50,
      }
    ]
  },
  {
    id: 'kaduna_city',
    name: 'Kaduna City-Wide',
    description: 'Complete coverage of Kaduna metropolitan area',
    icon: '🏙️',
    category: 'city',
    estimatedReach: '500K+ people',
    duration: 30,
    basicInfo: {
      name: 'Kaduna City Campaign',
      description: 'Comprehensive campaign covering all major areas within Kaduna city for maximum local impact.',
      campaign_duration_days: 30,
      budget: 750000, // ₦750K
      total_required_riders: 500,
    },
    geofences: [
      {
        name: 'Kaduna Metropolitan',
        description: 'Complete Kaduna city coverage including Kaduna North, South, and surrounding areas',
        priority: 1,
        center_latitude: 10.5261, // Kaduna city center
        center_longitude: 7.4380,
        radius_meters: 20000, // 20km radius
        budget: 750000, // ₦750K
        rate_type: 'per_hour',
        rate_per_hour: 50,
      }
    ]
  },
  {
    id: 'kaduna_local',
    name: 'Kaduna Local Area',
    description: 'Targeted campaign for specific area within Kaduna',
    icon: '📍',
    category: 'local',
    estimatedReach: '100K+ people',
    duration: 14,
    basicInfo: {
      name: 'Kaduna Local Area Campaign',
      description: 'Focused campaign targeting a specific high-traffic area in Kaduna for concentrated impact.',
      campaign_duration_days: 14,
      budget: 224000, // ₦224K (100 riders * 80/hour * 8 hours * 14 days)
      total_required_riders: 100,
    },
    geofences: [
      {
        name: 'Central Kaduna Business District',
        description: 'High-traffic commercial and business area in central Kaduna',
        priority: 1,
        center_latitude: 10.5230, // Central Kaduna business area
        center_longitude: 7.4383,
        radius_meters: 5000, // 5km radius
        budget: 224000, // ₦224K
        rate_type: 'per_hour',
        rate_per_hour: 80,
      }
    ]
  }
];

export function getCampaignTemplate(id: string): CampaignTemplate | undefined {
  return campaignTemplates.find(template => template.id === id);
}