import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Shield, 
  Diamond, 
  MessageSquare, 
  CreditCard, 
  Upload, 
  Settings, 
  Bell,
  Send,
  TrendingUp,
  Activity,
  Crown
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

const adminMenuItems = [
  {
    title: 'Overview',
    items: [
      { title: 'Monitor', url: '/admin?tab=monitor', icon: Activity, description: 'Real-time system monitoring' },
      { title: 'Analytics', url: '/admin?tab=analytics', icon: BarChart3, description: 'Usage statistics & insights' },
    ]
  },
  {
    title: 'User Management',
    items: [
      { title: 'Users', url: '/admin?tab=users', icon: Users, description: 'Manage user accounts' },
      { title: 'Blocked Users', url: '/admin?tab=blocked-users', icon: Shield, description: 'User restrictions' },
      { title: 'Sessions', url: '/admin?tab=sessions', icon: Activity, description: 'Active user sessions' },
    ]
  },
  {
    title: 'Content & Assets',
    items: [
      { title: 'Diamonds', url: '/admin?tab=diamond-counts', icon: Diamond, description: 'Diamond inventory overview' },
      { title: 'Upload Analysis', url: '/admin?tab=upload-analysis', icon: Upload, description: 'File upload statistics' },
    ]
  },
  {
    title: 'Communications',
    items: [
      { title: 'Campaigns', url: '/admin?tab=campaigns', icon: Send, description: 'Marketing campaigns' },
      { title: 'Notifications', url: '/admin?tab=notifications', icon: Bell, description: 'System notifications' },
      { title: 'Bulk Share', url: '/admin?tab=bulk-share', icon: MessageSquare, description: 'Mass messaging tools' },
      { title: 'Group CTA', url: '/admin?tab=group-cta', icon: TrendingUp, description: 'Call-to-action management' },
    ]
  },
  {
    title: 'Financial',
    items: [
      { title: 'Payments', url: '/admin?tab=payments', icon: CreditCard, description: 'Payment processing' },
    ]
  },
  {
    title: 'System',
    items: [
      { title: 'Diagnostics', url: '/admin?tab=diagnostics', icon: Settings, description: 'System health checks' },
      { title: 'Webhook Test', url: '/admin?tab=webhook-test', icon: Activity, description: 'API endpoint testing' },
    ]
  }
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { user } = useTelegramAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isCollapsed = state === 'collapsed';
  
  const isActive = (url: string) => {
    if (url.includes('?tab=')) {
      const tabParam = url.split('?tab=')[1];
      return location.search.includes(`tab=${tabParam}`);
    }
    return location.pathname + location.search === url;
  };

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/50 bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-r from-sidebar-accent/10 to-sidebar-accent/5 py-2">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Crown className="h-3.5 w-3.5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-xs font-semibold text-sidebar-foreground">Admin</h2>
              <p className="text-[10px] text-sidebar-foreground/60">{user?.first_name || 'Admin'}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1.5 py-2">
        {adminMenuItems.map((section) => (
          <SidebarGroup key={section.title} className="mb-3">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/50 px-2 mb-1 uppercase tracking-wide">
                {section.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <button
                      onClick={() => handleNavigation(item.url)}
                      className={`
                        w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200
                        ${isActive(item.url) 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }
                        ${isCollapsed ? 'justify-center' : 'justify-start'}
                      `}
                      title={isCollapsed ? item.title : item.description}
                    >
                      <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate text-left">{item.title}</span>
                      )}
                    </button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 bg-sidebar-accent/5 py-2">
        <div className="flex items-center gap-1.5 px-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          {!isCollapsed && (
            <span className="text-[10px] text-sidebar-foreground/60">Online</span>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}