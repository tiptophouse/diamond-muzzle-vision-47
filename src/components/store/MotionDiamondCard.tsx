import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Diamond } from '@/types/diamond';

interface MotionDiamondCardProps {
  diamond: Diamond;
}

export function MotionDiamondCard({ diamond }: MotionDiamondCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">
              {diamond.shape} {diamond.carat}ct
            </h3>
            {diamond.price && (
              <p className="font-bold text-lg text-primary">
                ${diamond.price.toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>{diamond.color}</span>
            <span>•</span>
            <span>{diamond.clarity}</span>
            {diamond.cut && (
              <>
                <span>•</span>
                <span>{diamond.cut}</span>
              </>
            )}
          </div>

          {diamond.certificateNumber && (
            <p className="text-xs text-muted-foreground">
              Cert: {diamond.certificateNumber}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
