
import React from 'react';
import { useSecureInventory } from '@/hooks/useSecureInventory';
import { useSecureFastAPIAuthContext } from '@/context/SecureFastAPIAuthContext';
import { Gem, Plus, Edit, Trash2, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SecureInventoryDashboard = () => {
  const { user, jwtUserId } = useSecureFastAPIAuthContext();
  const { diamonds, loading, error, fetchDiamonds, deleteDiamond } = useSecureInventory();

  const handleDelete = async (diamondId: number) => {
    if (window.confirm('Are you sure you want to delete this diamond?')) {
      const success = await deleteDiamond(diamondId);
      if (success) {
        console.log('✅ Diamond deleted and UI updated');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Gem className="h-8 w-8 text-blue-600" />
                Secure Diamond Inventory
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome {user?.first_name} (JWT User: {jwtUserId}) - Your diamonds are completely isolated and secure
              </p>
            </div>
            <Button 
              onClick={fetchDiamonds}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Refresh Inventory
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Diamonds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{diamonds.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${diamonds.reduce((sum, d) => sum + (d.price_per_carat || 0) * d.weight, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Carats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {diamonds.reduce((sum, d) => sum + d.weight, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading your secure diamond inventory...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p className="font-medium">Error loading inventory</p>
                <p className="text-sm mt-1">{error}</p>
                <Button 
                  onClick={fetchDiamonds}
                  variant="outline"
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : diamonds.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Gem className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No diamonds in your inventory yet</p>
                <p className="text-gray-500 text-sm mt-1">Add your first diamond to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diamonds.map((diamond) => (
              <Card key={diamond.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{diamond.stock}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="p-1">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(diamond.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Shape:</span>
                      <span className="ml-1 font-medium">{diamond.shape}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Weight:</span>
                      <span className="ml-1 font-medium">{diamond.weight}ct</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Color:</span>
                      <span className="ml-1 font-medium">{diamond.color}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Clarity:</span>
                      <span className="ml-1 font-medium">{diamond.clarity}</span>
                    </div>
                  </div>
                  
                  {diamond.price_per_carat && (
                    <div className="pt-2 border-t">
                      <div className="text-sm text-gray-600">
                        ${diamond.price_per_carat}/ct
                      </div>
                      <div className="font-semibold text-green-600">
                        Total: ${(diamond.price_per_carat * diamond.weight).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {diamond.picture && (
                    <div className="pt-2">
                      <img 
                        src={diamond.picture} 
                        alt={diamond.stock}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Security Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Security Active:</span>
            <span>JWT authenticated • User isolated • Industry-grade encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureInventoryDashboard;
