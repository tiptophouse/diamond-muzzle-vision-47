
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Diamond } from 'lucide-react';

interface QueriedDiamondsSectionProps {
  requestDetails: {
    shape?: string;
    carat_min?: number;
    carat_max?: number;
    color?: string;
    clarity?: string;
    price_max?: number;
  };
  originalMessage: string;
}

export function QueriedDiamondsSection({ requestDetails, originalMessage }: QueriedDiamondsSectionProps) {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Search className="h-5 w-5" />
          Queried Diamonds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Original message */}
        <div className="bg-white p-3 rounded border">
          <p className="text-sm font-medium text-gray-700 mb-1">Original Request:</p>
          <p className="text-gray-800 text-sm">{originalMessage}</p>
        </div>

        {/* Parsed criteria */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {requestDetails.shape && (
            <div className="text-center p-2 bg-white rounded border">
              <p className="text-xs text-gray-600">Shape</p>
              <p className="font-medium text-sm">{requestDetails.shape}</p>
            </div>
          )}
          {(requestDetails.carat_min || requestDetails.carat_max) && (
            <div className="text-center p-2 bg-white rounded border">
              <p className="text-xs text-gray-600">Carat Range</p>
              <p className="font-medium text-sm">
                {requestDetails.carat_min?.toFixed(1)}-{requestDetails.carat_max?.toFixed(1)}
              </p>
            </div>
          )}
          {requestDetails.color && (
            <div className="text-center p-2 bg-white rounded border">
              <p className="text-xs text-gray-600">Color</p>
              <p className="font-medium text-sm">{requestDetails.color.toUpperCase()}</p>
            </div>
          )}
          {requestDetails.clarity && (
            <div className="text-center p-2 bg-white rounded border">
              <p className="text-xs text-gray-600">Clarity</p>
              <p className="font-medium text-sm">{requestDetails.clarity.toUpperCase()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
