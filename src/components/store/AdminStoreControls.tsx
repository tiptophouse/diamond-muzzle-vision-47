import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Settings, Users, ShoppingCart } from 'lucide-react';
import { Diamond } from '@/types/diamond';

interface AdminStoreControlsProps {
  diamonds: Diamond[];
  onToggleStoreVisibility: (diamond: Diamond) => void;
  onBulkToggleVisibility: (visible: boolean) => void;
  storeSettings: {
    isPublic: boolean;
    allowGuests: boolean;
    requireAuth: boolean;
  };
  onUpdateStoreSettings: (settings: any) => void;
}

export function AdminStoreControls({
  diamonds,
  onToggleStoreVisibility,
  onBulkToggleVisibility,
  storeSettings,
  onUpdateStoreSettings,
}: AdminStoreControlsProps) {
  const visibleDiamonds = diamonds.filter(d => d.store_visible);
  const hiddenDiamonds = diamonds.filter(d => !d.store_visible);

  return (
    <div className="space-y-6">
      {/* Store Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Store Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{visibleDiamonds.length}</div>
              <div className="text-sm text-muted-foreground">Visible Diamonds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{hiddenDiamonds.length}</div>
              <div className="text-sm text-muted-foreground">Hidden Diamonds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{diamonds.length}</div>
              <div className="text-sm text-muted-foreground">Total Inventory</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bulk Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => onBulkToggleVisibility(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Show All
            </Button>
            <Button
              variant="outline"
              onClick={() => onBulkToggleVisibility(false)}
              className="flex items-center gap-2"
            >
              <EyeOff className="h-4 w-4" />
              Hide All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Store Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Store Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-store">Public Store</Label>
              <div className="text-sm text-muted-foreground">
                Allow anyone to view your store
              </div>
            </div>
            <Switch
              id="public-store"
              checked={storeSettings.isPublic}
              onCheckedChange={(checked) =>
                onUpdateStoreSettings({ ...storeSettings, isPublic: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-guests">Allow Guests</Label>
              <div className="text-sm text-muted-foreground">
                Let visitors browse without signing in
              </div>
            </div>
            <Switch
              id="allow-guests"
              checked={storeSettings.allowGuests}
              onCheckedChange={(checked) =>
                onUpdateStoreSettings({ ...storeSettings, allowGuests: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-auth">Require Authentication</Label>
              <div className="text-sm text-muted-foreground">
                Only authenticated users can view prices
              </div>
            </div>
            <Switch
              id="require-auth"
              checked={storeSettings.requireAuth}
              onCheckedChange={(checked) =>
                onUpdateStoreSettings({ ...storeSettings, requireAuth: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Individual Diamond Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {diamonds.map((diamond) => (
              <div
                key={diamond.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {diamond.shape} {diamond.carat}ct
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {diamond.color} {diamond.clarity}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={diamond.store_visible ? "default" : "secondary"}>
                    {diamond.store_visible ? "Visible" : "Hidden"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStoreVisibility(diamond)}
                  >
                    {diamond.store_visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
