
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, Phone, Star, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UserInfo {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  is_premium: boolean;
  created_at: string;
  last_active?: string;
  photo_url?: string;
  language_code?: string;
  status: string;
}

export function UserLookup() {
  const [telegramId, setTelegramId] = useState('1413647475');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const lookupUser = async () => {
    if (!telegramId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('telegram_id', parseInt(telegramId))
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "User Not Found",
            description: `No user found with Telegram ID: ${telegramId}`,
            variant: "destructive",
          });
          setUserInfo(null);
        } else {
          throw error;
        }
      } else {
        setUserInfo(data);
        toast({
          title: "User Found",
          description: `Found user: ${data.first_name} ${data.last_name || ''}`.trim(),
        });
      }
    } catch (error) {
      console.error('Error looking up user:', error);
      toast({
        title: "Error",
        description: "Failed to lookup user information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (user: UserInfo) => {
    if (user.first_name && user.first_name.trim()) {
      const lastName = user.last_name ? ` ${user.last_name.trim()}` : '';
      return `${user.first_name.trim()}${lastName}`;
    }
    if (user.username) {
      return `@${user.username}`;
    }
    return `User ${user.telegram_id}`;
  };

  const getInitials = (user: UserInfo) => {
    if (user.first_name && user.first_name.trim()) {
      const lastName = user.last_name || '';
      if (lastName) {
        return `${user.first_name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }
      return user.first_name.substring(0, 2).toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U?';
  };

  React.useEffect(() => {
    // Auto-lookup the specified user on component mount
    if (telegramId === '1413647475') {
      lookupUser();
    }
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Lookup
          </CardTitle>
          <CardDescription>
            Look up user information by Telegram ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Telegram ID"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              type="number"
            />
            <Button onClick={lookupUser} disabled={loading || !telegramId}>
              {loading ? 'Searching...' : 'Lookup'}
            </Button>
          </div>

          {userInfo && (
            <Card className="mt-4">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-gray-200">
                    <AvatarImage src={userInfo.photo_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                      {getInitials(userInfo)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{getDisplayName(userInfo)}</h3>
                      {userInfo.is_premium && <Star className="h-5 w-5 text-yellow-500" />}
                      {userInfo.phone_number && <Phone className="h-5 w-5 text-green-500" />}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <Badge variant="outline">ID: {userInfo.telegram_id}</Badge>
                      {userInfo.username && <span>@{userInfo.username}</span>}
                      {userInfo.language_code && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>{userInfo.language_code.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <div className="text-sm font-semibold">
                      {userInfo.first_name || 'Not provided'} {userInfo.last_name || ''}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Username</label>
                    <div className="text-sm font-semibold">
                      {userInfo.username ? `@${userInfo.username}` : 'Not set'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <div className="text-sm font-semibold">
                      {userInfo.phone_number || 'Not provided'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Account Status</label>
                    <div className="flex items-center gap-2">
                      <Badge variant={userInfo.status === 'active' ? 'default' : 'secondary'}>
                        {userInfo.status}
                      </Badge>
                      {userInfo.is_premium && (
                        <Badge className="bg-yellow-600 text-white">Premium</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Joined</label>
                    <div className="text-sm font-semibold">
                      {new Date(userInfo.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Active</label>
                    <div className="text-sm font-semibold">
                      {userInfo.last_active 
                        ? new Date(userInfo.last_active).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
