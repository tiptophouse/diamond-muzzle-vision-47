import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  CheckCircle, 
  Users, 
  Sparkles, 
  Package, 
  Store, 
  BarChart3, 
  MessageCircle,
  Share,
  Edit,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

type EmptyStateType = 'no_matches' | 'all_read' | 'no_buyers' | 'first_time';

interface EmptyStateVariationsProps {
  type: EmptyStateType;
  onAction?: (action: string) => void;
}

export function EmptyStateVariations({ type, onAction }: EmptyStateVariationsProps) {
  const states = {
    no_matches: {
      icon: <Search className="h-16 w-16 text-blue-500" />,
      title: "אין התאמות עדיין",
      description: "היהלומים שלך עדיין לא התאימו לחיפושים של קונים. נסה להוסיף עוד מלאי או חזור מאוחר יותר!",
      actions: [
        { 
          label: "הוסף יהלומים", 
          href: "/inventory", 
          icon: Package,
          variant: "default" as const
        },
        { 
          label: "צפה בחנות", 
          href: "/store", 
          icon: Store,
          variant: "outline" as const
        }
      ]
    },
    all_read: {
      icon: <CheckCircle className="h-16 w-16 text-green-500" />,
      title: "הכל מעודכן! 🎉",
      description: "עברת על כל ההתראות. התאמות חדשות יופיעו כאן.",
      actions: [
        { 
          label: "צפה בניתוח", 
          href: "/insights", 
          icon: BarChart3,
          variant: "outline" as const
        },
        { 
          label: "צ'אט עם AI", 
          href: "/chat", 
          icon: MessageCircle,
          variant: "outline" as const
        }
      ]
    },
    no_buyers: {
      icon: <Users className="h-16 w-16 text-orange-500" />,
      title: "ממתינים לקונים...",
      description: "עדיין אין קונים שחיפשו יהלומים כמו שלך. שתף את החנות שלך כדי למשוך קונים!",
      actions: [
        { 
          label: "שתף חנות", 
          action: "share_store", 
          icon: Share,
          variant: "default" as const
        },
        { 
          label: "ערוך מלאי", 
          href: "/inventory", 
          icon: Edit,
          variant: "outline" as const
        }
      ]
    },
    first_time: {
      icon: <Sparkles className="h-16 w-16 text-purple-500" />,
      title: "ברוכים הבאים להתראות!",
      description: "כשקונים יחפשו יהלומים והיהלומים שלך יתאימו, תראה התראות כאן. תוכל ליצור איתם קשר ישירות!",
      actions: [
        { 
          label: "סיור מודרך", 
          action: "start_tour", 
          icon: HelpCircle,
          variant: "default" as const
        },
        { 
          label: "הוסף יהלומים", 
          href: "/inventory", 
          icon: Package,
          variant: "outline" as const
        }
      ]
    }
  };

  const state = states[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4">
        {state.icon}
      </div>
      
      <h3 className="text-xl font-bold mb-2">{state.title}</h3>
      
      <p className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
        {state.description}
      </p>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {state.actions.map((action) => (
          action.href ? (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              asChild
              className="gap-2"
            >
              <Link to={action.href}>
                <action.icon className="h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              onClick={() => onAction?.(action.action || '')}
              className="gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          )
        ))}
      </div>
    </div>
  );
}
