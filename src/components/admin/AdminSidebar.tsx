import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  const currentPath = location.pathname + location.search;
  
  const isCollapsed = state === 'collapsed';
  
  const isActive = (url: string) => {
    if (url.includes('?tab=')) {
      const tabParam = url.split('?tab=')[1];
      return location.search.includes(`tab=${tabParam}`);
    }
    return currentPath === url;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/50 bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-r from-sidebar-accent/10 to-sidebar-accent/5">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Crown className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-sidebar-foreground">Admin Portal</h2>
              <p className="text-xs text-sidebar-foreground/60">{user?.first_name || 'Administrator'}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {adminMenuItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 px-2 mb-1">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`
                        group relative w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200
                        hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                        ${isActive(item.url) 
                          ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90' 
                          : 'text-sidebar-foreground/80'
                        }
                        ${isCollapsed ? 'px-2 justify-center' : ''}
                      `}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <div className="flex flex-col items-start">
                            <span className="truncate">{item.title}</span>
                            <span className="text-xs opacity-60 truncate">{item.description}</span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 bg-sidebar-accent/10">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          {!isCollapsed && (
            <span className="text-xs text-sidebar-foreground/60">System Online</span>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}