
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Users, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimplifiedAnalytics } from '@/hooks/useSimplifiedAnalytics';

export function SimpleNotificationCenter() {
  const { users } = useSimplifiedAnalytics();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'individual'>('all');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (targetType === 'individual' && !selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent",
        description: targetType === 'all' 
          ? `Message sent to all ${users.length} users`
          : `Message sent to selected user`,
      });
      
      setMessage('');
      setSelectedUserId('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-slate-300" />
        <h2 className="text-lg sm:text-xl font-bold text-white">Send Notification</h2>
      </div>

      {/* Target Selection */}
      <div className="space-y-3 sm:space-y-4">
        <div className="text-sm font-medium text-slate-300">Send to:</div>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-4'}`}>
          <Button
            variant={targetType === 'all' ? 'default' : 'outline'}
            onClick={() => setTargetType('all')}
            className={`${isMobile ? 'h-12 justify-start' : 'h-10'} ${
              targetType === 'all' 
                ? 'bg-slate-700 text-white' 
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            All Users ({users.length})
          </Button>
          
          <Button
            variant={targetType === 'individual' ? 'default' : 'outline'}
            onClick={() => setTargetType('individual')}
            className={`${isMobile ? 'h-12 justify-start' : 'h-10'} ${
              targetType === 'individual' 
                ? 'bg-slate-700 text-white' 
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <User className="h-4 w-4 mr-2" />
            Individual User
          </Button>
        </div>

        {/* User Selection for Individual */}
        {targetType === 'individual' && (
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Select User:</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.telegram_id}>
                  {user.first_name} {user.last_name} - @{user.username || user.telegram_id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <label className="text-sm text-slate-300">Message:</label>
        <Textarea
          placeholder="Enter your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`bg-slate-800 border-slate-600 text-white resize-none focus:border-slate-500 focus:ring-slate-500 ${
            isMobile ? 'min-h-[120px]' : 'min-h-[100px]'
          }`}
        />
        <div className="text-xs text-slate-400">
          {message.length}/500 characters
        </div>
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSendMessage}
        disabled={isLoading || !message.trim()}
        className={`${isMobile ? 'w-full h-12' : 'w-auto'} bg-slate-700 hover:bg-slate-600 disabled:opacity-50`}
      >
        <Send className="h-4 w-4 mr-2" />
        {isLoading ? 'Sending...' : 'Send Message'}
      </Button>

      {/* Recent Messages Preview */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-700">
        <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Recent Activity</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-300">No recent messages</div>
            <div className="text-xs text-slate-500 mt-1">Messages will appear here after sending</div>
          </div>
        </div>
      </div>
    </div>
  );
}
