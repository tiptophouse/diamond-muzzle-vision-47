
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, CreditCard, Users, DollarSign } from 'lucide-react';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function PaymentManagement() {
  const { 
    isLoading, 
    stats, 
    removeUserPayments, 
    removeAllPayments, 
    removeMyselfFromPayments, 
    getPaymentStats 
  } = usePaymentManagement();
  const { user } = useTelegramAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    getPaymentStats();
  }, []);

  const handleRemoveUserPayments = async () => {
    const userId = parseInt(selectedUserId);
    if (!userId || isNaN(userId)) {
      return;
    }

    if (window.confirm(`Are you sure you want to remove all payment data for user ${userId}? This action cannot be undone.`)) {
      await removeUserPayments(userId);
      setSelectedUserId('');
    }
  };

  const handleRemoveAllPayments = async () => {
    if (window.confirm('Are you sure you want to remove ALL payment data from the system? This will affect all users and cannot be undone.')) {
      if (window.confirm('This is a destructive action. Type "DELETE ALL" to confirm you want to proceed.')) {
        await removeAllPayments();
      }
    }
  };

  const handleRemoveMyPayments = async () => {
    if (window.confirm('Are you sure you want to remove your own payment data? This action cannot be undone.')) {
      await removeMyselfFromPayments();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Statistics
          </CardTitle>
          <CardDescription>
            Overview of payment data in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-xl font-semibold">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Users with Payments</p>
                  <p className="text-xl font-semibold">{stats.usersWithPayments}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-xl font-semibold">{stats.totalPayments}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading payment statistics...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-orange-600" />
              Remove User Payments
            </CardTitle>
            <CardDescription>
              Remove payment data for a specific user by their Telegram ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="userId" className="text-sm font-medium">
                User Telegram ID
              </label>
              <input
                id="userId"
                type="number"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="Enter Telegram ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <Button
              onClick={handleRemoveUserPayments}
              disabled={!selectedUserId || isLoading}
              variant="outline"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove User Payments
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-blue-600" />
              Remove My Payments
            </CardTitle>
            <CardDescription>
              Remove your own payment data from the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Your ID:</strong> {user?.id}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                This will remove all your payment and subscription data
              </p>
            </div>
            <Button
              onClick={handleRemoveMyPayments}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove My Payments
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Dangerous Operations
          </CardTitle>
          <CardDescription className="text-red-600">
            These actions will permanently delete data and cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Remove All Payment Data</h4>
            <p className="text-sm text-red-700 mb-3">
              This will remove ALL payment and subscription data for ALL users in the system. 
              This action is irreversible and will affect every user.
            </p>
            <Button
              onClick={handleRemoveAllPayments}
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Remove All Payments
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Processing payment operation...
          </div>
        </div>
      )}
    </div>
  );
}
