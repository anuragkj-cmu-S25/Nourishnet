import { useState, useEffect } from 'react';
import { Mail, Forward, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../utils/auth/AuthContext';
import { emailAPI, volunteersAPI, calendarAPI } from '../../utils/api';

interface StaffInboxProps {
  onNavigate: (screen: string, date?: Date) => void;
}

export function StaffInbox({ onNavigate }: StaffInboxProps) {
  const { session } = useAuth();
  const [emails, setEmails] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [session]);

  const loadData = async () => {
    if (!session?.access_token) return;

    try {
      const [emailData, volunteerData] = await Promise.all([
        emailAPI.getAll(session.access_token),
        volunteersAPI.getAll(session.access_token),
      ]);

      setEmails(emailData.emails || []);
      setVolunteers(volunteerData.volunteers || []);
    } catch (error) {
      console.error('Error loading inbox:', error);
      toast.error('Failed to load inbox');
    }
  };

  const handleForward = (email: any) => {
    setSelectedEmail(email);
    // AI suggestion: randomly suggest a volunteer
    if (volunteers.length > 0) {
      const randomIndex = Math.floor(Math.random() * volunteers.length);
      setSelectedVolunteer(volunteers[randomIndex].id);
    }
    setIsForwardModalOpen(true);
  };

  const confirmForward = async () => {
    if (!selectedEmail || !selectedVolunteer || !session?.access_token) return;

    try {
      await emailAPI.forward(selectedEmail.id, selectedVolunteer, session.access_token);
      
      const volunteer = volunteers.find(v => v.id === selectedVolunteer);
      toast.success(`Email forwarded to ${volunteer?.full_name}`);
      
      setIsForwardModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error forwarding email:', error);
      toast.error(error.message || 'Failed to forward email');
    }
  };

  const handleAddToCalendar = async (email: any) => {
    if (!session?.access_token) return;

    try {
      // AI stubbed: extract date from email
      const today = new Date();
      const eventDate = today.toISOString().split('T')[0];
      
      await calendarAPI.createFromEmail(
        {
          emailId: email.id,
          title: email.subject,
          date: eventDate,
          time: '10:00',
        },
        session.access_token
      );

      toast.success('Event added to shared calendar');
      onNavigate('calendar', new Date(eventDate));
    } catch (error: any) {
      console.error('Error adding to calendar:', error);
      toast.error(error.message || 'Failed to add to calendar');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-gray-900">Staff Inbox</h1>
        <p className="text-gray-500 mt-1">{emails.length} messages</p>
      </div>

      {/* Emails List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {emails.length > 0 ? (
          emails.map((email) => (
            <Card key={email.id} className="p-4">
              <div className="space-y-3">
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedEmail(expandedEmail === email.id ? null : email.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
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

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    onClick={() => handleForward(email)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Forward className="w-4 h-4 mr-2" />
                    Forward to Volunteer
                  </Button>
                  <Button
                    onClick={() => handleAddToCalendar(email)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No emails in inbox</p>
          </div>
        )}
      </div>

      {/* Forward Modal */}
      <Dialog open={isForwardModalOpen} onOpenChange={setIsForwardModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Forward Email to Volunteer</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-gray-900">{selectedEmail?.subject}</p>
              <p className="text-gray-600 mt-1">From: {selectedEmail?.from}</p>
            </div>
            <div>
              <Label htmlFor="volunteer-select">Select Volunteer</Label>
              <Select value={selectedVolunteer} onValueChange={setSelectedVolunteer}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose volunteer" />
                </SelectTrigger>
                <SelectContent>
                  {volunteers.map((volunteer) => (
                    <SelectItem key={volunteer.id} value={volunteer.id}>
                      {volunteer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedVolunteer && (
                <p className="text-blue-600 mt-2">✨ AI Suggestion: This volunteer is a good match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForwardModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmForward}
              disabled={!selectedVolunteer}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Forward Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
