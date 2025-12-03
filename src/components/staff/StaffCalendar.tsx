import { useState, useEffect } from 'react';
import { Calendar } from '../ui/calendar';
import { Card } from '../ui/card';
import { X, Info } from 'lucide-react';
import { useAuth } from '../../utils/auth/AuthContext';
import { calendarAPI } from '../../utils/api';
import { DayContentProps } from 'react-day-picker';
import { toast } from 'sonner@2.0.3';

interface StaffCalendarProps {
  initialDate?: Date;
}

export function StaffCalendar({ initialDate }: StaffCalendarProps) {
  const { session } = useAuth();
  const [date, setDate] = useState<Date | undefined>(initialDate || new Date());
  const [month, setMonth] = useState<Date>(initialDate || new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [session]);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
      setMonth(initialDate);
    }
  }, [initialDate]);

  const loadEvents = async () => {
    if (!session?.access_token) return;

    try {
      const data = await calendarAPI.getEvents(session.access_token);
      console.log('Calendar events loaded:', data);
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error loading calendar:', error);
      toast.error('Failed to load calendar events');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!session?.access_token) return;

    try {
      await calendarAPI.deleteEvent(eventId, session.access_token);
      toast.success('Event removed from calendar');
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Helper to format date as YYYY-MM-DD in local timezone (not UTC)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateEvents = events.filter(
    event => event.date === (date ? formatDateLocal(date) : '')
  );

  // Get dates that have events
  const eventDates = new Set(events.map(event => event.date));

  // Custom day content to show sage green dots
  const DayContent = (props: DayContentProps) => {
    const dayString = props.date.toISOString().split('T')[0];
    const hasEvent = eventDates.has(dayString);
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{props.date.getDate()}</span>
        {hasEvent && (
          <div className="absolute bottom-1 w-1 h-1 bg-[#A0C87B] rounded-full"></div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF6]">
      {/* Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 flex justify-center">
        <div className="w-full max-w-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-gray-900">Shared Calendar</h1>
              <p className="text-gray-500 mt-1">Food bank schedule</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Info"
              >
                <Info className="w-5 h-5 text-gray-600" />
              </button>
              {showInfo && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setShowInfo(false)}
                  />
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-30">
                    <p className="text-sm text-gray-700">
                      View team events and schedules. Tap a date to see details. Click X to remove events. Shared with all staff.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content - Account for fixed header and bottom nav */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-24 mb-16 space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={month}
          onMonthChange={setMonth}
          className="rounded-md border bg-white shadow-sm w-full"
          classNames={{
            head_row: "flex justify-between",
            row: "flex w-full mt-2 justify-between"
          }}
          components={{
            DayContent
          }}
        />

        {/* Events for Selected Date */}
        {date && (
          <div>
            <h3 className="text-gray-900 mb-3">
              Tasks for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h3>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <Card key={event.id} className="p-4 bg-[#F2FFB5] border-none relative">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#A0C87B] rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <h3 className="text-gray-900">{event.title}</h3>
                        <p className="text-gray-600 mt-1">{event.time}</p>
                      </div>
                      <button
                        className="text-gray-500 hover:text-gray-700 p-1"
                        onClick={() => handleDeleteEvent(event.id)}
                        aria-label="Delete event"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border-t-2 border-b-2 border-dashed border-gray-300 py-4">
                <p className="text-gray-500 text-center">No events scheduled for this date</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}