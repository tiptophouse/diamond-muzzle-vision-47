import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface UserPresence {
  user_id: string;
  first_name: string;
  online_at: string;
}

export function useRealTimeUserCount() {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [userCount, setUserCount] = useState(0);
  const { user } = useTelegramAuth();

  useEffect(() => {
    if (!user) return;

    // Create a unique channel for real-time presence
    const channel = supabase.channel('user_presence', {
      config: {
        presence: {
          key: user.id.toString(),
        },
      },
    });

    // Track user presence
    const userStatus = {
      user_id: user.id.toString(),
      first_name: user.first_name,
      online_at: new Date().toISOString(),
    };

    // Listen to presence events
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users: UserPresence[] = [];
        
        Object.values(presenceState).forEach((presences) => {
          presences.forEach((presence: any) => {
            if (presence.user_id && presence.first_name) {
              users.push(presence as UserPresence);
            }
          });
        });
        
        setOnlineUsers(users);
        setUserCount(users.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          await channel.track(userStatus);
        }
      });

    // Update presence every 30 seconds to keep user active
    const interval = setInterval(async () => {
      await channel.track({
        ...userStatus,
        online_at: new Date().toISOString(),
      });
    }, 30000);

    // Cleanup
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    userCount,
    onlineUsers,
  };
}
