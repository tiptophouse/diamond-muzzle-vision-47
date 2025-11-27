import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Diamond } from '@/components/inventory/InventoryTable';
import { Camera, TrendingDown, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface ActionAlertsSectionProps {
  allDiamonds: Diamond[];
}

export function ActionAlertsSection({ allDiamonds }: ActionAlertsSectionProps) {
  const navigate = useNavigate();
  const { impactOccurred } = useTelegramHapticFeedback();

  const diamondsWithoutPhotos = allDiamonds.filter(d => !d.imageUrl);
  const diamondsWithHighPrice = allDiamonds.filter(d => {
    if (!d.price || !d.carat) return false;
    const pricePerCarat = d.price / d.carat;
    return pricePerCarat > 10000;
  });

  const alerts = [
    {
      id: 'missing_photos',
      icon: Camera,
      color: 'orange',
      bgColor: 'from-orange-500/10 to-orange-500/5',
      borderColor: 'border-orange-500/30',
      title: `${diamondsWithoutPhotos.length} diamonds missing photos`,
      action: 'Add Photos',
      route: '/inventory',
      show: diamondsWithoutPhotos.length > 0,
    },
    {
      id: 'price_high',
      icon: TrendingDown,
      color: 'blue',
      bgColor: 'from-blue-500/10 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      title: `${diamondsWithHighPrice.length} diamonds above market`,
      action: 'Review Pricing',
      route: '/inventory',
      show: diamondsWithHighPrice.length > 0,
    },
  ].filter(alert => alert.show);

  const handleAlertClick = (route: string) => {
    impactOccurred('light');
    navigate(route);
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-foreground">⚠️ Action Required</h2>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <Card 
              key={alert.id}
              className={`p-4 bg-gradient-to-r ${alert.bgColor} border ${alert.borderColor} cursor-pointer hover:shadow-lg transition-all`}
              onClick={() => handleAlertClick(alert.route)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg bg-${alert.color}-500/20`}>
                    <Icon className={`w-5 h-5 text-${alert.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {alert.title}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
                  {alert.action}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
