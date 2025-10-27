import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  table: 'store_item_analytics' | 'diamond_detail_views' | 'diamond_share_analytics';
  data: any;
}

class AnalyticsQueue {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private readonly STORAGE_KEY = 'analytics_queue';
  private isFlushing = false;

  constructor() {
    // Load any pending events from localStorage
    this.loadFromStorage();
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flushSync());
    
    // Flush on visibility change (mobile/tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushSync();
      }
    });
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to load analytics from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      if (this.queue.length > 0) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
      }
    } catch (error) {
      console.error('Failed to save analytics to storage:', error);
    }
  }

  track(table: AnalyticsEvent['table'], data: any) {
    this.queue.push({ table, data });
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimer) return;
    
    this.flushTimer = setTimeout(() => {
      this.flush();
      this.flushTimer = null;
    }, this.FLUSH_INTERVAL);
  }

  private async flush() {
    if (this.isFlushing || this.queue.length === 0) return;
    
    this.isFlushing = true;
    const events = [...this.queue];
    this.queue = [];

    try {
      // Group events by table
      const grouped = events.reduce((acc, event) => {
        if (!acc[event.table]) acc[event.table] = [];
        acc[event.table].push(event.data);
        return acc;
      }, {} as Record<string, any[]>);

      // Insert each group with proper typing
      for (const [table, data] of Object.entries(grouped)) {
        if (table === 'store_item_analytics') {
          await supabase.from('store_item_analytics').insert(data);
        } else if (table === 'diamond_detail_views') {
          await supabase.from('diamond_detail_views').insert(data);
        } else if (table === 'diamond_share_analytics') {
          await supabase.from('diamond_share_analytics').insert(data);
        }
      }
    } catch (error) {
      console.error('Failed to flush analytics:', error);
      // Re-add failed events back to queue
      this.queue.unshift(...events);
      this.saveToStorage();
    } finally {
      this.isFlushing = false;
    }
  }

  private flushSync() {
    // Save to localStorage for next session if flush fails
    this.saveToStorage();
    
    // Try to flush immediately (may not complete before page unload)
    if (this.queue.length > 0) {
      this.flush();
    }
  }
}

export const analyticsQueue = new AnalyticsQueue();
