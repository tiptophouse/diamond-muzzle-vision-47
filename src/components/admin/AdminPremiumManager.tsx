
import React from 'react';
import { Crown, Users, TrendingUp, Gift, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumPromotionSender } from './PremiumPromotionSender';
import { LegacyUserManager } from './LegacyUserManager';
import { PremiumUserStatus } from './PremiumUserStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminPremiumManager() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Crown className="h-10 w-10 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-900">Premium Management</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage premium users, promotions, and benefits across your diamond trading platform
          </p>
        </div>

        {/* Premium Status Overview */}
        <PremiumUserStatus />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Premium Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">8+</div>
              <p className="text-yellow-700 text-sm mt-1">Exclusive benefits</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Target Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">100+</div>
              <p className="text-blue-700 text-sm mt-1">Selected diamond groups</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Value Proposition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">Premium</div>
              <p className="text-green-700 text-sm mt-1">Enhanced experience</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="status" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Status Check
            </TabsTrigger>
            <TabsTrigger value="legacy" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <Crown className="h-4 w-4 mr-2" />
              Legacy Assignment
            </TabsTrigger>
            <TabsTrigger value="promotion" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <Gift className="h-4 w-4 mr-2" />
              User Promotion
            </TabsTrigger>
            <TabsTrigger value="benefits" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Premium Benefits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="mt-6">
            <PremiumUserStatus />
          </TabsContent>

          <TabsContent value="legacy" className="mt-6">
            <LegacyUserManager />
          </TabsContent>
          
          <TabsContent value="promotion" className="mt-6">
            <PremiumPromotionSender />
          </TabsContent>

          <TabsContent value="benefits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-600" />
                  Premium Benefits Overview
                </CardTitle>
                <CardDescription>
                  Complete list of benefits that premium users receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      🔥 Core Benefits
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <strong>100+ Premium Groups:</strong> Access to carefully selected diamond trading groups
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <strong>Higher Limits:</strong> Increased upload and search limitations
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <strong>Early Access:</strong> Get new features before everyone else
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      ✨ Advanced Features
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <strong>VIP Groups:</strong> Exclusive access to rare diamond communities
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <strong>Instant Alerts:</strong> Real-time notifications for hot opportunities
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <strong>Advanced Analytics:</strong> Detailed market analysis tools
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Notification Message Preview
                  </h3>
                  <div className="text-sm text-yellow-700 bg-white p-3 rounded border border-yellow-300 font-mono">
                    🎉 ברוך הבא למועדון הפרימיום!<br/>
                    שלום [שם], אנחנו נרגשים להודיע לך שהחשבון שלך שודרג לפרימיום! 🌟<br/>
                    🔥 הטבות הפרימיום החדשות שלך: גישה ל-100+ קבוצות יהלומים נבחרות...
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
