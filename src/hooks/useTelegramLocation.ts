import { useCallback, useEffect, useState } from 'react';
import { useAdvancedTelegramSDK } from './useAdvancedTelegramSDK';
import { toast } from 'sonner';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

interface LocationHook {
  isSupported: boolean;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  currentLocation: LocationData | null;
  
  // Permission management
  requestPermission: () => Promise<boolean>;
  
  // Location services
  getCurrentLocation: () => Promise<LocationData | null>;
  watchLocation: (callback: (location: LocationData) => void) => () => void;
  
  // Diamond-related location features
  getNearbyDealers: (radius?: number) => Promise<any[]>;
  getLocationInsights: () => Promise<{
    market: string;
    priceIndex: number;
    demand: string;
    suggestions: string[];
  } | null>;
  
  // Distance calculations
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  findNearestLocation: (locations: Array<{ lat: number; lon: number; [key: string]: any }>) => any | null;
}

// Mock data for demonstration - in real app, this would come from your API
const MOCK_DEALERS = [
  { id: 1, name: 'Diamond Exchange NYC', lat: 40.7580, lon: -73.9855, distance: 0 },
  { id: 2, name: 'Jewelry District LA', lat: 34.0522, lon: -118.2437, distance: 0 },
  { id: 3, name: 'Antwerp Diamond Center', lat: 51.2194, lon: 4.4025, distance: 0 }
];

const MARKET_DATA = {
  'US': { market: 'North American Market', priceIndex: 1.05, demand: 'High' },
  'EU': { market: 'European Market', priceIndex: 0.98, demand: 'Medium' },
  'AS': { market: 'Asian Market', priceIndex: 1.12, demand: 'Very High' },
  'default': { market: 'Global Market', priceIndex: 1.00, demand: 'Medium' }
};

export function useTelegramLocation(): LocationHook {
  const { location: telegramLocation, isInitialized } = useAdvancedTelegramSDK();
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (isInitialized) {
      checkPermissionStatus();
    }
  }, [isInitialized]);

  const checkPermissionStatus = useCallback(async () => {
    if (telegramLocation.isSupported) {
      // Try to get location to check if permission is already granted
      try {
        const location = await telegramLocation.getCurrentLocation();
        setHasPermission(!!location);
      } catch (error) {
        setHasPermission(false);
      }
    } else if ('geolocation' in navigator) {
      // Fallback to browser geolocation
      navigator.permissions?.query({ name: 'geolocation' }).then(result => {
        setHasPermission(result.state === 'granted');
      }).catch(() => {
        setHasPermission(false);
      });
    }
  }, [telegramLocation]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      let hasAccess = false;

      if (telegramLocation.isSupported) {
        hasAccess = await telegramLocation.requestAccess();
      } else if ('geolocation' in navigator) {
        // Fallback to browser geolocation
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setHasPermission(true);
              resolve(true);
            },
            (error) => {
              console.error('Geolocation error:', error);
              setError('Location access denied');
              toast.error('Location access is required for location-based features');
              resolve(false);
            }
          );
        });
      }

      if (hasAccess) {
        setHasPermission(true);
        toast.success('Location access granted');
      } else {
        setError('Location access denied');
        toast.error('Location access is required for location-based features');
      }

      return hasAccess;
    } catch (error: any) {
      console.error('Location permission error:', error);
      setError(error.message || 'Failed to request location permission');
      toast.error('Location permission error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [telegramLocation]);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    try {
      setError(null);
      setIsLoading(true);

      let locationData: LocationData | null = null;

      if (telegramLocation.isSupported) {
        const tgLocation = await telegramLocation.getCurrentLocation();
        if (tgLocation) {
          locationData = {
            latitude: tgLocation.latitude,
            longitude: tgLocation.longitude,
            timestamp: Date.now()
          };
        }
      } else if ('geolocation' in navigator) {
        // Fallback to browser geolocation
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const data: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: Date.now()
              };
              setCurrentLocation(data);
              resolve(data);
            },
            (error) => {
              console.error('Geolocation error:', error);
              setError('Failed to get current location');
              resolve(null);
            }
          );
        });
      }

      if (locationData) {
        setCurrentLocation(locationData);
        console.log('📍 Location obtained:', locationData);
      }

      return locationData;
    } catch (error: any) {
      console.error('Get location error:', error);
      setError(error.message || 'Failed to get location');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, requestPermission, telegramLocation]);

  const watchLocation = useCallback((callback: (location: LocationData) => void) => {
    let watchId: number;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          setCurrentLocation(locationData);
          callback(locationData);
        },
        (error) => {
          console.error('Watch location error:', error);
          setError('Failed to watch location');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }

    // Return cleanup function
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const findNearestLocation = useCallback((locations: Array<{ lat: number; lon: number; [key: string]: any }>) => {
    if (!currentLocation || !locations.length) return null;

    let nearest = locations[0];
    let minDistance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      locations[0].lat,
      locations[0].lon
    );

    for (let i = 1; i < locations.length; i++) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        locations[i].lat,
        locations[i].lon
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = locations[i];
      }
    }

    return { ...nearest, distance: minDistance };
  }, [currentLocation, calculateDistance]);

  const getNearbyDealers = useCallback(async (radius = 50): Promise<any[]> => {
    const location = currentLocation || await getCurrentLocation();
    
    if (!location) {
      return [];
    }

    // Calculate distances and filter by radius
    const dealersWithDistance = MOCK_DEALERS.map(dealer => ({
      ...dealer,
      distance: calculateDistance(
        location.latitude,
        location.longitude,
        dealer.lat,
        dealer.lon
      )
    })).filter(dealer => dealer.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return dealersWithDistance;
  }, [currentLocation, getCurrentLocation, calculateDistance]);

  const getLocationInsights = useCallback(async () => {
    const location = currentLocation || await getCurrentLocation();
    
    if (!location) {
      return null;
    }

    // Determine market region based on location (simplified)
    let region = 'default';
    if (location.latitude >= 25 && location.latitude <= 49 && 
        location.longitude >= -125 && location.longitude <= -66) {
      region = 'US'; // North America
    } else if (location.latitude >= 36 && location.latitude <= 71 && 
               location.longitude >= -10 && location.longitude <= 40) {
      region = 'EU'; // Europe
    } else if (location.latitude >= -10 && location.latitude <= 55 && 
               location.longitude >= 68 && location.longitude <= 180) {
      region = 'AS'; // Asia
    }

    const marketInfo = MARKET_DATA[region];
    
    return {
      ...marketInfo,
      suggestions: [
        'Consider local market preferences for cut and clarity',
        'Check regional certification preferences',
        'Analyze local competition and pricing',
        'Consider seasonal demand patterns'
      ]
    };
  }, [currentLocation, getCurrentLocation]);

  return {
    isSupported: telegramLocation.isSupported || 'geolocation' in navigator,
    hasPermission,
    isLoading,
    error,
    currentLocation,
    
    requestPermission,
    getCurrentLocation,
    watchLocation,
    
    // Diamond-related features
    getNearbyDealers,
    getLocationInsights,
    
    // Utility functions
    calculateDistance,
    findNearestLocation
  };
}