
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Phone, Mail, MessageCircle } from 'lucide-react';
import { format, addDays, addMinutes, isAfter, isBefore } from 'date-fns';

interface MeetingSlot {
  date: string;
  time: string;
  available: boolean;
  datetime: Date;
}

interface BookedMeeting {
  id: string;
  user_id: string;
  scheduled_time: string;
  user_data: any;
  notes: string;
  status: string;
}

export default function ScheduleMeetingPage() {
  const { user } = useTelegramAuth();
  const { hapticFeedback } = useTelegramWebApp();
  const { toast } = useToast();
  
  const [selectedSlot, setSelectedSlot] = useState<MeetingSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<MeetingSlot[]>([]);
  const [bookedMeetings, setBookedMeetings] = useState<BookedMeeting[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots: MeetingSlot[] = [];
    const today = new Date();
    
    // Generate slots for next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = addDays(today, dayOffset);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Business hours: 9 AM to 6 PM, excluding 12-1 PM lunch break
      const businessHours = [
        { start: 9, end: 12 },  // 9 AM - 12 PM
        { start: 13, end: 18 }  // 1 PM - 6 PM
      ];
      
      businessHours.forEach(({ start, end }) => {
        for (let hour = start; hour < end; hour++) {
          // 20-minute slots, 3 per hour
          for (let minute = 0; minute < 60; minute += 20) {
            const slotTime = new Date(currentDate);
            slotTime.setHours(hour, minute, 0, 0);
            
            // Skip past times for today
            if (dayOffset === 0 && isBefore(slotTime, new Date())) {
              continue;
            }
            
            slots.push({
              date: dateStr,
              time: format(slotTime, 'HH:mm'),
              available: true,
              datetime: slotTime
            });
          }
        }
      });
    }
    
    return slots;
  };

  // Load booked meetings from user_profiles notes field (temporary storage)
  const loadBookedMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .not('notes', 'is', null);
      
      if (error) throw error;
      
      const meetings: BookedMeeting[] = [];
      data?.forEach(profile => {
        if (profile.notes?.includes('MEETING:')) {
          try {
            const meetingData = JSON.parse(profile.notes.replace('MEETING:', ''));
            meetings.push({
              id: profile.id,
              user_id: profile.telegram_id?.toString() || '',
              scheduled_time: meetingData.scheduled_time,
              user_data: meetingData.user_data,
              notes: meetingData.notes || '',
              status: meetingData.status || 'scheduled'
            });
          } catch (e) {
            console.error('Error parsing meeting data:', e);
          }
        }
      });
      
      setBookedMeetings(meetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  // Check slot availability
  const checkSlotAvailability = (slots: MeetingSlot[]) => {
    return slots.map(slot => ({
      ...slot,
      available: !bookedMeetings.some(meeting => 
        format(new Date(meeting.scheduled_time), 'yyyy-MM-dd HH:mm') === 
        `${slot.date} ${slot.time}`
      )
    }));
  };

  useEffect(() => {
    const slots = generateTimeSlots();
    setAvailableSlots(slots);
    loadBookedMeetings();
  }, []);

  useEffect(() => {
    if (availableSlots.length > 0) {
      const updatedSlots = checkSlotAvailability(availableSlots);
      setAvailableSlots(updatedSlots);
    }
  }, [bookedMeetings]);

  // Auto-fill user data from Telegram
  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSlotSelect = (slot: MeetingSlot) => {
    if (!slot.available) return;
    
    hapticFeedback.impact('light');
    setSelectedSlot(slot);
  };

  const handleBookMeeting = async () => {
    if (!selectedSlot || !user) return;
    
    setLoading(true);
    hapticFeedback.impact('medium');
    
    try {
      const meetingData = {
        scheduled_time: `${selectedSlot.date} ${selectedSlot.time}`,
        user_data: {
          telegram_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          phone: phone,
          email: email
        },
        notes: notes,
        status: 'scheduled',
        booked_at: new Date().toISOString()
      };
      
      // Store meeting info in user's profile notes (temporary solution)
      const { error } = await supabase
        .from('user_profiles')
        .update({
          notes: `MEETING:${JSON.stringify(meetingData)}`,
          phone_number: phone,
          email: email,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      await loadBookedMeetings();
      
      toast({
        title: "✅ Meeting Scheduled!",
        description: `Your 20-minute meeting is confirmed for ${format(selectedSlot.datetime, 'MMMM d, yyyy')} at ${selectedSlot.time}`,
      });
      
      setSelectedSlot(null);
      setNotes('');
      hapticFeedback.notification('success');
      
    } catch (error) {
      console.error('Error booking meeting:', error);
      toast({
        title: "Booking Failed",
        description: "Unable to schedule meeting. Please try again.",
        variant: "destructive",
      });
      hapticFeedback.notification('error');
    } finally {
      setLoading(false);
    }
  };

  // Check if user already has a meeting booked
  const userHasMeeting = bookedMeetings.some(meeting => 
    meeting.user_id === user?.id?.toString()
  );

  const userMeeting = bookedMeetings.find(meeting => 
    meeting.user_id === user?.id?.toString()
  );

  if (!user) {
    return (
      <TelegramLayout>
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground">Please log in to schedule a meeting.</p>
            </CardContent>
          </Card>
        </div>
      </TelegramLayout>
    );
  }

  return (
    <TelegramLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Calendar className="h-6 w-6" />
              Schedule Meeting with Diamond Expert
            </CardTitle>
            <p className="text-muted-foreground">
              Book a 20-minute consultation to discuss your diamond needs
            </p>
          </CardHeader>
        </Card>

        {userHasMeeting && userMeeting ? (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Meeting Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {format(new Date(userMeeting.scheduled_time), 'MMMM d, yyyy')} at {format(new Date(userMeeting.scheduled_time), 'HH:mm')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span>{userMeeting.user_data.first_name} {userMeeting.user_data.last_name}</span>
                </div>
                {userMeeting.notes && (
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{userMeeting.notes}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Time Slots */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Available Time Slots
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select a 20-minute slot (Lunch break: 12:00-13:00)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Array.from(new Set(availableSlots.map(slot => slot.date)))
                      .map(date => (
                        <div key={date} className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            {format(new Date(date), 'EEEE, MMMM d')}
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots
                              .filter(slot => slot.date === date)
                              .map((slot, index) => (
                                <Button
                                  key={index}
                                  variant={selectedSlot?.datetime.getTime() === slot.datetime.getTime() ? "default" : "outline"}
                                  size="sm"
                                  className={`text-xs ${
                                    !slot.available 
                                      ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                      : slot.available 
                                        ? 'hover:bg-blue-50' 
                                        : ''
                                  }`}
                                  onClick={() => handleSlotSelect(slot)}
                                  disabled={!slot.available}
                                >
                                  {slot.time}
                                </Button>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={user.first_name || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={user.last_name || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="flex items-center gap-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What would you like to discuss?"
                      className="min-h-[80px]"
                    />
                  </div>

                  {selectedSlot && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Selected Time:</h4>
                      <p className="text-blue-800">
                        {format(selectedSlot.datetime, 'EEEE, MMMM d, yyyy')} at {selectedSlot.time}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        Duration: 20 minutes
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleBookMeeting}
                    disabled={!selectedSlot || loading}
                    className="w-full"
                  >
                    {loading ? 'Booking...' : 'Confirm Meeting'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </TelegramLayout>
  );
}
