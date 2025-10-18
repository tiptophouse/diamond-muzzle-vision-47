import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  BarChart3, 
  Users, 
  CreditCard, 
  Share2, 
  Bell 
} from 'lucide-react';

export function DashboardQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Rocket,
      label: 'Launch Campaign',
      description: 'Create new campaign',
      tab: 'campaigns',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: BarChart3,
      label: 'View Analytics',
      description: 'Detailed insights',
      tab: 'analytics',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      label: 'Manage Users',
      description: 'User management',
      tab: 'users',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: CreditCard,
      label: 'Payments',
      description: 'Payment settings',
      tab: 'payments',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: Share2,
      label: 'Bulk Share',
      description: 'Share diamonds',
      tab: 'bulk-share',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Send notification',
      tab: 'notifications',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action) => (
            <Button
              key={action.tab}
              variant="outline"
              className="h-auto flex flex-col items-center gap-2 p-4 hover:shadow-lg transition-all"
              onClick={() => navigate(`/admin?tab=${action.tab}`)}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
