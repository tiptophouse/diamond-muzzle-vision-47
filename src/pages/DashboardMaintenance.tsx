import { Wrench, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardMaintenance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="text-center space-y-8 max-w-md">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-card border shadow-lg flex items-center justify-center">
          <Wrench className="w-10 h-10 text-primary animate-pulse" />
        </div>
        
        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Under Maintenance
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We're currently fixing the dashboard to provide you with a better experience. 
            It will be available soon!
          </p>
        </div>
        
        {/* Action Button */}
        <button 
          onClick={() => navigate('/store')}
          className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Visit Store Instead
        </button>
        
        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
          <span>Working on improvements...</span>
        </div>
      </div>
    </div>
  );
}