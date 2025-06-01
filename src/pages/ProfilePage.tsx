
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useLeads } from '@/hooks/useLeads';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { User, Crown, TrendingUp, Users } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useTelegramAuth();
  const { subscriptions } = useSubscriptions();
  const { leads } = useLeads();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('Diamond dealer passionate about connecting customers with perfect stones.');
  const [company, setCompany] = useState('Diamond Muzzle Co.');

  const activeSubscription = subscriptions.find(sub => sub.status === 'active');
  const activeLeads = leads.filter(lead => lead.status === 'active').length;
  
  const userInitials = user ? 
    `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase() : 
    'DM';
    
  const displayName = user ? 
    `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : 
    'Diamond Muzzle User';

  const handleSaveProfile = () => {
    // In a real app, you'd save this to a user profile table
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <Button 
            variant={isEditing ? "default" : "outline"}
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {user?.photo_url && (
                    <AvatarImage src={user.photo_url} alt={displayName} />
                  )}
                  <AvatarFallback className="bg-diamond-100 text-diamond-700 text-xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{displayName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    {user?.username && (
                      <>
                        @{user.username}
                        {activeSubscription && (
                          <Badge variant="secondary" className="bg-diamond-100 text-diamond-700">
                            <Crown className="h-3 w-3 mr-1" />
                            {activeSubscription.plan_name}
                          </Badge>
                        )}
                      </>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company">Company</Label>
                {isEditing ? (
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">{company}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">{bio}</p>
                )}
              </div>

              {user?.username && (
                <div>
                  <Label>Telegram</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Connected as @{user.username}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Active Leads</span>
                </div>
                <Badge variant="secondary">{activeLeads}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Subscription</span>
                </div>
                <Badge variant={activeSubscription ? "default" : "secondary"}>
                  {activeSubscription ? activeSubscription.plan_name : "Free"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Member Since</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Details */}
        {activeSubscription && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                Manage your current subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Plan</Label>
                  <p className="mt-1 font-medium">{activeSubscription.plan_name}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className="mt-1" variant={activeSubscription.status === 'active' ? 'default' : 'secondary'}>
                    {activeSubscription.status}
                  </Badge>
                </div>
                <div>
                  <Label>Started</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(activeSubscription.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
