
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfDay, addMinutes, isAfter, isBefore } from 'date-fns';

interface TimeSlot {
  id: string;
  date: Date;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
}

interface MeetingData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientMessage: string;
  selectedSlot: TimeSlot | null;
}

const ScheduleMeetingPage = () => {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meetingData, setMeetingData] = useState<MeetingData>({
    clientName: user ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    clientPhone: '',
    clientEmail: '',
    clientMessage: '',
    selectedSlot: null
  });

  // Generate time slots for the selected date
  useEffect(() => {
    generateTimeSlots(selectedDate);
  }, [selectedDate]);

  // Auto-fill user data from Telegram
  useEffect(() => {
    if (user) {
      setMeetingData(prev => ({
        ...prev,
        clientName: `${user.first_name} ${user.last_name || ''}`.trim()
      }));
    }
  }, [user]);

  const generateTimeSlots = async (date: Date) => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9:00 AM
    const endHour = 18; // 6:00 PM
    const slotDuration = 20; // 20 minutes
    const breakStart = 12; // 12:00 PM
    const breakEnd = 13; // 1:00 PM

    // Fetch existing bookings for the date
    const { data: bookings } = await supabase
      .from('meeting_bookings')
      .select('scheduled_time')
      .eq('meeting_date', format(date, 'yyyy-MM-dd'));

    const bookedTimes = bookings?.map(b => b.scheduled_time) || [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        // Skip lunch break
        if (hour >= breakStart && hour < breakEnd) continue;
        
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        
        // Only show future slots
        if (isBefore(slotTime, new Date())) continue;
        
        const timeString = format(slotTime, 'HH:mm');
        const isBooked = bookedTimes.includes(timeString);
        
        slots.push({
          id: `${format(date, 'yyyy-MM-dd')}-${timeString}`,
          date: slotTime,
          time: timeString,
          isAvailable: !isBooked,
          isBooked
        });
      }
    }

    setTimeSlots(slots);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
      setMeetingData(prev => ({ ...prev, selectedSlot: slot }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !meetingData.clientName) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('meeting_bookings')
        .insert({
          telegram_id: user?.id || 0,
          client_name: meetingData.clientName,
          client_phone: meetingData.clientPhone,
          client_email: meetingData.clientEmail,
          client_message: meetingData.clientMessage,
          meeting_date: format(selectedSlot.date, 'yyyy-MM-dd'),
          scheduled_time: selectedSlot.time,
          status: 'scheduled',
          telegram_username: user?.username,
          telegram_first_name: user?.first_name,
          telegram_last_name: user?.last_name
        });

      if (error) throw error;

      toast({
        title: "Meeting Scheduled! 🎉",
        description: `Your meeting is confirmed for ${format(selectedSlot.date, 'MMM dd, yyyy')} at ${selectedSlot.time}`,
      });

      // Reset form
      setSelectedSlot(null);
      setMeetingData(prev => ({ ...prev, selectedSlot: null, clientMessage: '' }));
      generateTimeSlots(selectedDate);

    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Scheduling Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startOfDay(new Date()), i));
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Schedule a Meeting with Me
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Book a 20-minute consultation to discuss your diamond business needs. 
            I'm here to help you grow your business with our platform.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Calendar & Time Selection */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Date Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Choose a Date
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {getNextSevenDays().map((date) => (
                      <Button
                        key={date.toISOString()}
                        variant={selectedDate.toDateString() === date.toDateString() ? "default" : "outline"}
                        className={`flex-col h-16 ${
                          selectedDate.toDateString() === date.toDateString()
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "hover:bg-blue-50"
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="text-xs font-medium">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-sm">
                          {format(date, 'MMM dd')}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Available Times (20 min each)
                  </Label>
                  <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        disabled={!slot.isAvailable}
                        className={`h-12 ${
                          selectedSlot?.id === slot.id
                            ? "bg-blue-600 hover:bg-blue-700"
                            : slot.isAvailable
                            ? "hover:bg-blue-50"
                            : "bg-gray-100 text-gray-400"
                        }`}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        {slot.time}
                        {slot.isBooked && (
                          <Badge variant="destructive" className="ml-1 text-xs">
                            Booked
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Client Information */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="clientName" className="text-sm font-medium text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="clientName"
                      type="text"
                      value={meetingData.clientName}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, clientName: e.target.value }))}
                      required
                      className="mt-1"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientPhone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={meetingData.clientPhone}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, clientPhone: e.target.value }))}
                      className="mt-1"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientEmail" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={meetingData.clientEmail}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      className="mt-1"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientMessage" className="text-sm font-medium text-gray-700">
                      What would you like to discuss?
                    </Label>
                    <Textarea
                      id="clientMessage"
                      value={meetingData.clientMessage}
                      onChange={(e) => setMeetingData(prev => ({ ...prev, clientMessage: e.target.value }))}
                      className="mt-1 h-24"
                      placeholder="Tell me about your business needs, challenges, or questions..."
                    />
                  </div>

                  {/* Selected Meeting Summary */}
                  {selectedSlot && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Meeting Summary</h4>
                        <div className="space-y-1 text-sm text-blue-800">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(selectedSlot.date, 'EEEE, MMMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {selectedSlot.time} (20 minutes)
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    type="submit"
                    disabled={!selectedSlot || !meetingData.clientName || isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingPage;
