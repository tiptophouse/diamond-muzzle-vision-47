import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
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
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { User, Crown, TrendingUp, Users, Edit3, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useTelegramAuth();
  const { subscriptions } = useSubscriptions();
  const { leads } = useLeads();
  const { toast } = useToast();
  const { selectionChanged, notificationOccurred } = useTelegramHapticFeedback();
  
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
    selectionChanged();
    notificationOccurred('success');
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    selectionChanged();
    setIsEditing(!isEditing);
  };

  return (
    <TelegramMiniAppLayout>
      <div className="p-4 space-y-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Profile</h1>
          <Button 
            size="sm"
            variant={isEditing ? "default" : "outline"}
            onClick={() => isEditing ? handleSaveProfile() : handleEditToggle()}
            className="min-h-[44px] px-4"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>

        {/* Mobile-First Profile Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {user?.photo_url && (
                  <AvatarImage src={user.photo_url} alt={displayName} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight">{displayName}</CardTitle>
                {user?.username && (
                  <CardDescription className="text-sm">
                    @{user.username}
                  </CardDescription>
                )}
              </div>
            </div>
            {activeSubscription && (
              <Badge variant="secondary" className="w-fit">
                <Crown className="h-3 w-3 mr-1" />
                {activeSubscription.plan_name}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company" className="text-sm font-medium">Company</Label>
              {isEditing ? (
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-2 min-h-[44px]"
                />
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{company}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-2 min-h-[88px]"
                  rows={3}
                />
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{bio}</p>
              )}
            </div>

            {user?.username && (
              <div>
                <Label className="text-sm font-medium">Telegram</Label>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connected as @{user.username}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div className="text-2xl font-semibold">{activeLeads}</div>
                <div className="text-xs text-muted-foreground">Active Leads</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <div className="text-sm font-semibold">
                  {activeSubscription ? activeSubscription.plan_name : "Free"}
                </div>
                <div className="text-xs text-muted-foreground">Plan</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Details - Mobile Optimized */}
        {activeSubscription && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">{activeSubscription.plan_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={activeSubscription.status === 'active' ? 'default' : 'secondary'}>
                  {activeSubscription.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Started</span>
                <span className="text-sm">
                  {new Date(activeSubscription.start_date).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TelegramMiniAppLayout>
  );
}