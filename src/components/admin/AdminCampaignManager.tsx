
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, BarChart3, Settings } from 'lucide-react';
import { CampaignSender } from './CampaignSender';
import { CampaignAnalytics } from './CampaignAnalytics';

export function AdminCampaignManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          מנהל קמפיינים מתקדם
        </CardTitle>
        <CardDescription>
          נהל ושלח קמפיינים מותאמים לקידום מכירות והרשמות
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sender" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sender" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              שליחת קמפיינים
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              ניתוח וביצועים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sender">
            <CampaignSender />
          </TabsContent>

          <TabsContent value="analytics">
            <CampaignAnalytics />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
