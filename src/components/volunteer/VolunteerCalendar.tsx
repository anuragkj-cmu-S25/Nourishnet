import { useState, useEffect } from 'react';
import { Calendar } from '../ui/calendar';
import { Card } from '../ui/card';
import { useAuth } from '../../utils/auth/AuthContext';
import { calendarAPI } from '../../utils/api';
import { DayContentProps } from 'react-day-picker';

export function VolunteerCalendar() {
  const { session } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    loadEvents();
  }, [session]);

  const loadEvents = async () => {
    if (!session?.access_token) return;

    try {
      const data = await calendarAPI.getEvents(session.access_token);
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  };

  const selectedDateEvents = events.filter(
    event => event.date === date?.toISOString().split('T')[0]
  );

  // Get dates that have events
  const eventDates = new Set(events.map(event => event.date));

  // Custom day content to show blue dots
  const DayContent = (props: DayContentProps) => {
    const dayString = props.date.toISOString().split('T')[0];
    const hasEvent = eventDates.has(dayString);
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{props.date.getDate()}</span>
        {hasEvent && (
          <div className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full"></div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white px-6 py-4 border-b border-gray-200 z-10">
        <h1 className="text-gray-900">My Calendar</h1>
        <p className="text-gray-500 mt-1">Your personal schedule</p>
      </div>

      {/* Content - Account for fixed header and bottom nav */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-24 mb-16 space-y-4">
        <div className="mx-auto" style={{ maxWidth: '400px' }}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border bg-white shadow-sm"
            components={{
              DayContent
            }}
          />
        </div>

        {/* Events for Selected Date */}
        {date && (
          <div>
            <h2 className="text-gray-700 mb-3">
              Events for {date.toLocaleDateString()}
            </h2>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <Card key={event.id} className="p-4">
                    <h3 className="text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 mt-1">Time: {event.time}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4">
                <p className="text-gray-500 text-center">No events scheduled</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
