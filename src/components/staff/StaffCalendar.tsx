import { useState, useEffect } from 'react';
import { Calendar } from '../ui/calendar';
import { Card } from '../ui/card';
import { useAuth } from '../../utils/auth/AuthContext';
import { calendarAPI } from '../../utils/api';

interface StaffCalendarProps {
  initialDate?: Date;
}

export function StaffCalendar({ initialDate }: StaffCalendarProps) {
  const { session } = useAuth();
  const [date, setDate] = useState<Date | undefined>(initialDate || new Date());
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-gray-900">Shared Calendar</h1>
        <p className="text-gray-500 mt-1">Food bank schedule</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
          />
        </Card>

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
