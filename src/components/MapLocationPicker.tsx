"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Target, Plus, Minus, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Extend Window interface to include Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface MapLocationPickerProps {
  latitude: number;
  longitude: number;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange: (radius: number) => void;
}

export default function MapLocationPicker({
  latitude,
  longitude,
  radius,
  onLocationChange,
  onRadiusChange
}: MapLocationPickerProps) {
  const [mapCenter, setMapCenter] = useState({ lat: latitude, lng: longitude });
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadingLeaflet, setLoadingLeaflet] = useState(false);

  // Popular Lagos locations for quick selection
  const popularLocations = [
    { name: 'Victoria Island', lat: 6.4281, lng: 3.4219 },
    { name: 'Lagos Island', lat: 6.4550, lng: 3.3841 },
    { name: 'Ikeja', lat: 6.6018, lng: 3.3515 },
    { name: 'Surulere', lat: 6.5027, lng: 3.3618 },
    { name: 'Lekki', lat: 6.4698, lng: 3.5852 },
    { name: 'Ikoyi', lat: 6.4563, lng: 3.4383 },
    { name: 'Yaba', lat: 6.5158, lng: 3.3707 },
    { name: 'Apapa', lat: 6.4469, lng: 3.3598 }
  ];

  // Function to dynamically load Leaflet CSS and JS
  const loadLeaflet = () => {
    return new Promise<void>((resolve, reject) => {
      // Check if Leaflet is already loaded
      if (typeof window !== 'undefined' && window.L) {
        setLeafletLoaded(true);
        resolve();
        return;
      }

      setLoadingLeaflet(true);

      // Load CSS first
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.async = true;

      script.onload = () => {
        // Verify Leaflet is actually available
        if (typeof window !== 'undefined' && window.L) {
          setLeafletLoaded(true);
          setLoadingLeaflet(false);
          resolve();
        } else {
          setLoadingLeaflet(false);
          reject(new Error('Leaflet failed to load properly'));
        }
      };

      script.onerror = () => {
        setLoadingLeaflet(false);
        reject(new Error('Failed to load Leaflet script'));
      };

      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (showInteractiveMap && !leafletLoaded && !loadingLeaflet) {
      loadLeaflet()
        .then(() => {
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            if (mapRef.current && !mapInstance.current) {
              initializeMap();
            }
          }, 100);
        })
        .catch((error) => {
          console.error('Failed to load Leaflet:', error);
        });
    } else if (showInteractiveMap && leafletLoaded && mapRef.current && !mapInstance.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initializeMap();
      }, 100);
    }

    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        } finally {
          mapInstance.current = null;
          markerRef.current = null;
          circleRef.current = null;
        }
      }
    };
  }, [showInteractiveMap, leafletLoaded]);

  useEffect(() => {
    if (mapInstance.current && markerRef.current) {
      // Update map center, marker, and circle when coordinates change
      const newLatLng = [latitude, longitude];
      mapInstance.current.setView(newLatLng, mapInstance.current.getZoom());
      markerRef.current.setLatLng(newLatLng);
      if (circleRef.current) {
        circleRef.current.setLatLng(newLatLng);
        circleRef.current.setRadius(radius);
      }
    }
  }, [latitude, longitude, radius]);

  const initializeMap = () => {
    if (typeof window === 'undefined' || !window.L || !mapRef.current) {
      console.error('Cannot initialize map: Leaflet not loaded or map container not available');
      return;
    }

    // Check if map is already initialized
    if (mapInstance.current) {
      console.warn('Map container is already initialized');
      return;
    }

    try {
      // Initialize the map
      mapInstance.current = window.L.map(mapRef.current).setView([latitude, longitude], 13);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      // Add marker for the center point
      markerRef.current = window.L.marker([latitude, longitude], {
        draggable: true
      }).addTo(mapInstance.current);

      // Add circle for the geofence radius
      circleRef.current = window.L.circle([latitude, longitude], {
        radius: radius,
        color: '#8b5cf6',
        fillColor: '#8b5cf6',
        fillOpacity: 0.2
      }).addTo(mapInstance.current);

      // Handle marker drag
      markerRef.current.on('dragend', (e: any) => {
        const newPosition = e.target.getLatLng();
        onLocationChange(newPosition.lat, newPosition.lng);
        circleRef.current.setLatLng(newPosition);
      });

      // Handle map clicks
      mapInstance.current.on('click', (e: any) => {
        const newPosition = e.latlng;
        onLocationChange(newPosition.lat, newPosition.lng);
        markerRef.current.setLatLng(newPosition);
        circleRef.current.setLatLng(newPosition);
      });

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setMapCenter(location);
    onLocationChange(location.lat, location.lng);
    setIsPickingLocation(false);
    
    if (mapInstance.current) {
      mapInstance.current.setView([location.lat, location.lng], 14);
    }
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLocationChange(mapCenter.lat, mapCenter.lng);
    setIsPickingLocation(false);
  };

  const adjustRadius = (increment: number) => {
    const newRadius = Math.max(2000, Math.min(1000000, radius + increment));
    onRadiusChange(newRadius);
  };

  const toggleInteractiveMap = () => {
    setShowInteractiveMap(!showInteractiveMap);
    setIsPickingLocation(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Geofence Location</Label>
        <p className="text-sm text-gray-500 mb-3">
          Select the center point of your geofence area. Click on the map to set location or choose from popular areas.
        </p>

        {/* Map Container */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          {showInteractiveMap ? (
            <div>
              {loadingLeaflet ? (
                <div className="h-80 w-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading map...</p>
                  </div>
                </div>
              ) : (
                <div ref={mapRef} className="h-80 w-full"></div>
              )}
              <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">Current Location:</span>
                  <span className="font-mono ml-2">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleInteractiveMap}
                  disabled={loadingLeaflet}
                >
                  Hide Map
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
              {!isPickingLocation ? (
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Current Location:</p>
                  <p className="font-mono text-sm bg-white px-3 py-1 rounded border">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Radius: {radius >= 1000 ? `${(radius/1000).toFixed(1)}km` : `${radius}m`}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPickingLocation(true)}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Quick Select
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={toggleInteractiveMap}
                    >
                      <Map className="h-4 w-4 mr-2" />
                      Open Map
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-white p-4 overflow-y-auto">
                  <div className="max-w-md mx-auto">
                    <h3 className="font-semibold mb-4">Quick Location Select</h3>
                    
                    {/* Popular Locations */}
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Popular Lagos Locations</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {popularLocations.map((location) => (
                          <Button
                            key={location.name}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleLocationSelect(location)}
                            className="text-xs h-8"
                          >
                            {location.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Coordinates */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Or Enter Coordinates</Label>
                      <form onSubmit={handleManualLocationSubmit} className="space-y-3">
                        <div>
                          <Label htmlFor="lat" className="text-xs">Latitude</Label>
                          <Input
                            id="lat"
                            type="number"
                            step="0.000001"
                            value={mapCenter.lat}
                            onChange={(e) => setMapCenter(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                            className="text-sm"
                            placeholder="6.5244"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lng" className="text-xs">Longitude</Label>
                          <Input
                            id="lng"
                            type="number"
                            step="0.000001"
                            value={mapCenter.lng}
                            onChange={(e) => setMapCenter(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                            className="text-sm"
                            placeholder="3.3792"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="flex-1">
                            Set Location
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsPickingLocation(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Radius Control */}
      <div>
        <Label>Geofence Radius (meters)</Label>
        <div className="flex items-center gap-3 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => adjustRadius(-100)}
            disabled={radius <= 2000}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              type="number"
              min="2000"
              max="1000000"
              step="500"
              value={radius}
              onChange={(e) => onRadiusChange(parseInt(e.target.value) || 2000)}
              className="text-center"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => adjustRadius(100)}
            disabled={radius >= 1000000}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Min: 2km</span>
          <span>Current: {radius >= 1000 ? `${(radius/1000).toFixed(1)}km` : `${radius}m`}</span>
          <span>Max: 1000km</span>
        </div>
      </div>

      {/* Map Instructions */}
      {showInteractiveMap && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Interactive Map:</strong> Click anywhere on the map to set the geofence center, or drag the marker to reposition. 
            The circle shows your geofence radius area.
          </p>
        </div>
      )}
    </div>
  );
}