import { useState, useEffect } from 'react';
import { Mail, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../utils/auth/AuthContext';
import { emailAPI, calendarAPI } from '../../utils/api';

interface VolunteerInboxProps {
  onNavigate: (screen: string, date?: Date) => void;
}

export function VolunteerInbox({ onNavigate }: VolunteerInboxProps) {
  const { session } = useAuth();
  const [emails, setEmails] = useState<any[]>([]);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [session]);

  const loadData = async () => {
    if (!session?.access_token) return;

    try {
      const [emailData, calendarData] = await Promise.all([
        emailAPI.getForwarded(session.access_token),
        calendarAPI.getEvents(session.access_token),
      ]);

      setEmails(emailData.emails || []);
      setEvents(calendarData.events || []);
    } catch (error) {
      console.error('Error loading inbox:', error);
      toast.error('Failed to load inbox');
    }
  };

  const handleAddToCalendar = async (email: any) => {
    if (!session?.access_token) return;

    try {
      // Check if event already exists for this email
      const existingEvent = events.find(e => e.source_email_id === email.id);
      if (existingEvent) {
        toast('Event already exists in calendar');
        // Navigate to November 20, 2025
        const targetDate = new Date(2025, 10, 20, 12, 0, 0);
        onNavigate('calendar', targetDate);
        return;
      }

      // AI stubbed: extract date from email subject/body
      const dateMatch = email.subject.match(/(November|December)\s+(\d+)/i) || 
                       email.body.match(/(November|December)\s+(\d+)/i);
      
      let eventDate = new Date().toISOString().split('T')[0];
      let eventTime = '10:00';
      
      if (dateMatch) {
        const month = dateMatch[1];
        const day = parseInt(dateMatch[2]);
        const monthNum = month.toLowerCase() === 'november' ? 10 : 11;
        eventDate = `2024-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      
      // Try to extract time
      const timeMatch = email.body.match(/(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const period = timeMatch[2].toUpperCase();
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        eventTime = `${String(hour).padStart(2, '0')}:00`;
      }
      
      await calendarAPI.createFromEmail(
        {
          emailId: email.id,
          title: email.subject,
          date: eventDate,
          time: eventTime,
        },
        session.access_token
      );

      toast.success('Event added to your calendar');
      // Navigate to November 20, 2025 - using noon to avoid timezone issues
      const targetDate = new Date(2025, 10, 20, 12, 0, 0); // November 20, 2025 at noon
      onNavigate('calendar', targetDate);
    } catch (error: any) {
      console.error('Error adding to calendar:', error);
      toast.error(error.message || 'Failed to add to calendar');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF6]">
      {/* Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 flex justify-center">
        <div className="w-full max-w-md px-6 py-4">
          <h1 className="text-gray-900">My Inbox</h1>
          <p className="text-gray-500 mt-1">{emails.length} messages</p>
        </div>
      </div>

      {/* Emails List - Account for fixed header and bottom nav */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-24 mb-16 space-y-3">
        {emails.length > 0 ? (
          emails.map((email) => (
            <Card key={email.id} className="p-4">
              <div className="space-y-3">
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedEmail(expandedEmail === email.id ? null : email.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#F2FFB5] rounded-lg flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#A0C87B]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900">{email.subject}</h3>
                      <p className="text-gray-600 mt-1">From: {email.from}</p>
                      <p className="text-gray-500">{email.date}</p>
                    </div>
                  </div>

                  {expandedEmail === email.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-gray-700">{email.body}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <Button
                    onClick={() => handleAddToCalendar(email)}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to My Calendar
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet</p>
            <p className="text-gray-400 mt-2">Forwarded emails will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}