import { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Sparkles, Mail, Lightbulb } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  hasAISuggestion?: boolean;
  hasForwardingSuggestion?: boolean;
  eventData?: {
    title: string;
    date: string;
    items: string;
  };
}

interface InboxScreenProps {
  onNavigate?: (screen: string, date?: Date) => void;
}

export function InboxScreen({ onNavigate }: InboxScreenProps = {}) {
  const [emails] = useState<Email[]>([
    {
      id: '1',
      sender: 'Local Farm Co-op',
      subject: 'Donation Delivery on Oct 27',
      preview: 'Hi Mary, we have a donation ready for delivery on October 27th. The donation includes canned tuna...',
      date: 'Oct 24',
      isRead: false,
      hasAISuggestion: true,
      hasForwardingSuggestion: true,
      eventData: {
        title: 'Delivery from Local Farm Co-op',
        date: 'October 27, 2025',
        items: 'Canned Tuna, Fresh Vegetables',
      },
    },
    {
      id: '2',
      sender: 'Community Food Bank',
      subject: 'Weekly Update - October',
      preview: 'Here is your weekly summary for the community food bank operations...',
      date: 'Oct 23',
      isRead: false,
      hasForwardingSuggestion: true,
    },
    {
      id: '3',
      sender: 'Volunteer Coordinator',
      subject: 'Volunteer Schedule for Next Week',
      preview: 'Please review the volunteer assignments for the upcoming week...',
      date: 'Oct 22',
      isRead: true,
      hasForwardingSuggestion: true,
    },
    {
      id: '4',
      sender: 'Regional Distribution Center',
      subject: 'Monthly Inventory Report',
      preview: 'Attached is the monthly inventory report for your review...',
      date: 'Oct 20',
      isRead: true,
      hasForwardingSuggestion: true,
    },
    {
      id: '5',
      sender: 'Sarah Johnson',
      subject: 'Thanks for the support',
      preview: 'Thank you so much for your help with organizing the food drive...',
      date: 'Oct 18',
      isRead: true,
      hasForwardingSuggestion: true,
    },
  ]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const openEmail = (email: Email) => {
    setSelectedEmail(email);
  };

  const closeEmail = () => {
    setSelectedEmail(null);
  };

  const createCalendarEvent = () => {
    if (selectedEmail?.eventData) {
      toast.success('Calendar event created successfully!');
      setShowEventModal(false);
      closeEmail();
      // Navigate to calendar screen to show the new event
      if (onNavigate) {
        // Parse the event date from the email (October 27, 2025)
        const eventDate = new Date(2025, 9, 27); // October is month 9 (0-indexed)
        setTimeout(() => onNavigate('calendar', eventDate), 300);
      }
    }
  };

  const handleAISuggestion = () => {
    setShowEventModal(true);
  };

  const handleForwardEmail = () => {
    // Open default email client with pre-filled forward
    const emailAddress = 'deliveries@harvestsync.app';
    window.location.href = `mailto:${emailAddress}`;
    toast.success('Opening email client...');
  };

  if (selectedEmail) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Email Header */}
        <div className="bg-white px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={closeEmail}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-gray-900 flex-1 line-clamp-1">{selectedEmail.subject}</h2>
          </div>
          
          {/* AI Suggestion Banners */}
          {selectedEmail.hasAISuggestion && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 p-4 mb-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-blue-900">AI Detected Event Information</h3>
                  <p className="text-blue-800 mt-1">
                    This email contains delivery details that can be added to your calendar.
                  </p>
                  <Button
                    onClick={handleAISuggestion}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Create Calendar Event
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {selectedEmail.hasForwardingSuggestion && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 p-4 mb-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-purple-900">AI Suggestion</h3>
                  <p className="text-purple-800 mt-1">
                    To process this delivery, forward this email to{' '}
                    <span className="bg-purple-200 px-1.5 py-0.5 rounded text-purple-900">
                      deliveries@harvestsync.app
                    </span>
                  </p>
                  <Button
                    onClick={handleForwardEmail}
                    className="mt-3 bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    Forward Now
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-700">{selectedEmail.sender.charAt(0)}</span>
              </div>
              <div>
                <p className="text-gray-900">{selectedEmail.sender}</p>
                <p className="text-gray-500">{selectedEmail.date}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700">Hi Mary,</p>
            <p className="text-gray-700 mt-4">
              We have a donation ready for delivery on <strong>October 27th, 2025</strong>.
            </p>
            <p className="text-gray-700 mt-4">
              The donation includes:
            </p>
            <ul className="text-gray-700 mt-2">
              <li>Canned Tuna (24 cans)</li>
              <li>Fresh Vegetables (assorted)</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Our delivery truck will arrive between 10:00 AM and 12:00 PM. Please ensure someone is available to receive the donation.
            </p>
            <p className="text-gray-700 mt-4">
              If you have any questions or need to reschedule, please let us know.
            </p>
            <p className="text-gray-700 mt-6">Best regards,</p>
            <p className="text-gray-700">Local Farm Co-op Team</p>
          </div>
        </div>

        {/* Event Creation Modal */}
        <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Create Calendar Event
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div>
                <p className="text-gray-600">Event Title</p>
                <p className="text-gray-900">{selectedEmail.eventData?.title}</p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="text-gray-900">{selectedEmail.eventData?.date}</p>
              </div>
              <div>
                <p className="text-gray-600">Items</p>
                <p className="text-gray-900">{selectedEmail.eventData?.items}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                AI Extracted
              </Badge>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEventModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={createCalendarEvent}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-gray-900">Inbox</h1>
        <p className="text-gray-500 mt-1">
          {emails.filter(e => !e.isRead).length} unread messages
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mt-2">
        {emails.map((email) => (
          <Card
            key={email.id}
            className={`border-0 border-b rounded-none cursor-pointer hover:bg-gray-50 transition-colors ${
              !email.isRead ? 'bg-blue-50' : 'bg-white'
            }`}
            onClick={() => openEmail(email)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <p className={`${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                    {email.sender}
                  </p>
                  {email.hasAISuggestion && (
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <span className="text-gray-500">{email.date}</span>
              </div>
              <h3 className={`mb-2 ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                {email.subject}
              </h3>
              <p className="text-gray-600 line-clamp-2">{email.preview}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
