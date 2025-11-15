import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { WeeklyKPIDashboard } from '@/components/analytics/WeeklyKPIDashboard';

export default function WeeklyKPIPage() {
  return (
    <TelegramLayout>
      <div className="container mx-auto py-6 px-4">
        <WeeklyKPIDashboard />
      </div>
    </TelegramLayout>
  );
}
