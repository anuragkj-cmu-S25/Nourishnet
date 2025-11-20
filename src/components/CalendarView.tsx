import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'delivery' | 'task' | 'meeting';
}

interface CalendarViewProps {
  initialDate?: Date;
}

export function CalendarView({ initialDate }: CalendarViewProps = {}) {
  const [currentMonth, setCurrentMonth] = useState(initialDate ? initialDate.getMonth() : 9); // October (0-indexed)
  const [currentYear] = useState(initialDate ? initialDate.getFullYear() : 2025);
  const [selectedDate, setSelectedDate] = useState(initialDate ? initialDate.getDate() : 27);

  const [events] = useState<CalendarEvent[]>([
    // October events
    {
      id: '1',
      title: 'Delivery from Local Farm Co-op',
      date: '2025-10-27',
      time: '10:00 AM - 12:00 PM',
      type: 'delivery',
    },
    {
      id: '2',
      title: 'Volunteer Training Session',
      date: '2025-10-27',
      time: '2:00 PM - 4:00 PM',
      type: 'meeting',
    },
    {
      id: '3',
      title: 'Sort and organize donations',
      date: '2025-10-27',
      time: 'All day',
      type: 'task',
    },
    {
      id: '4',
      title: 'Monthly inventory check',
      date: '2025-10-28',
      time: '9:00 AM',
      type: 'task',
    },
    {
      id: '5',
      title: 'Delivery from Community Pantry',
      date: '2025-10-30',
      time: '11:00 AM',
      type: 'delivery',
    },
    // November events
    {
      id: '6',
      title: 'Thanksgiving Food Drive',
      date: '2025-11-15',
      time: '9:00 AM - 5:00 PM',
      type: 'meeting',
    },
    {
      id: '7',
      title: 'Delivery from Regional Food Bank',
      date: '2025-11-18',
      time: '10:30 AM - 1:00 PM',
      type: 'delivery',
    },
    {
      id: '8',
      title: 'Volunteer coordination meeting',
      date: '2025-11-20',
      time: '2:00 PM - 3:30 PM',
      type: 'meeting',
    },
    {
      id: '9',
      title: 'Thanksgiving preparation tasks',
      date: '2025-11-24',
      time: 'All day',
      type: 'task',
    },
    {
      id: '10',
      title: 'Turkey and fixings distribution',
      date: '2025-11-25',
      time: '8:00 AM - 4:00 PM',
      type: 'delivery',
    },
    {
      id: '11',
      title: 'Post-holiday inventory update',
      date: '2025-11-29',
      time: '10:00 AM',
      type: 'task',
    },
    // December events
    {
      id: '12',
      title: 'Holiday toy drive kickoff',
      date: '2025-12-01',
      time: '9:00 AM - 12:00 PM',
      type: 'meeting',
    },
    {
      id: '13',
      title: 'Winter supplies delivery',
      date: '2025-12-05',
      time: '11:00 AM - 2:00 PM',
      type: 'delivery',
    },
    {
      id: '14',
      title: 'Volunteer appreciation lunch',
      date: '2025-12-10',
      time: '12:00 PM - 2:00 PM',
      type: 'meeting',
    },
    {
      id: '15',
      title: 'Monthly inventory reconciliation',
      date: '2025-12-12',
      time: '9:00 AM',
      type: 'task',
    },
    {
      id: '16',
      title: 'Holiday meal box assembly',
      date: '2025-12-18',
      time: 'All day',
      type: 'task',
    },
    {
      id: '17',
      title: 'Delivery from Community Partners',
      date: '2025-12-19',
      time: '10:00 AM - 1:00 PM',
      type: 'delivery',
    },
    {
      id: '18',
      title: 'Holiday distribution event',
      date: '2025-12-22',
      time: '8:00 AM - 6:00 PM',
      type: 'meeting',
    },
    {
      id: '19',
      title: 'Year-end reports preparation',
      date: '2025-12-30',
      time: '9:00 AM - 12:00 PM',
      type: 'task',
    },
  ]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const previousMonth = () => {
    setCurrentMonth(currentMonth === 0 ? 11 : currentMonth - 1);
  };

  const nextMonth = () => {
    setCurrentMonth(currentMonth === 11 ? 0 : currentMonth + 1);
  };

  const hasEvent = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.some(event => event.date === dateStr);
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'delivery':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'task':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'meeting':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      <button
        key={day}
        onClick={() => setSelectedDate(day)}
        className={`aspect-square md:aspect-auto md:py-1.5 flex flex-col items-center justify-center rounded-lg transition-colors relative ${
          selectedDate === day
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-100 text-gray-900'
        }`}
      >
        <span className="md:text-sm">{day}</span>
        {hasEvent(day) && (
          <div className={`w-1 h-1 rounded-full mt-1 md:mt-0.5 ${
            selectedDate === day ? 'bg-white' : 'bg-blue-600'
          }`} />
        )}
      </button>
    );
  }

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-gray-900">Calendar</h1>
      </div>

      <div className="bg-white px-4 py-4 border-b border-gray-200 md:pb-3">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 md:mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousMonth}
            className="p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="p-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="mb-4 md:mb-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 md:mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={index}
                className="text-center text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2 md:gap-1.5">
            {calendarDays}
          </div>
        </div>
      </div>

      {/* Events for Selected Date */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-2">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-gray-900">
            Tasks for {monthNames[currentMonth]} {selectedDate}
          </h2>
        </div>

        {selectedDateEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No events scheduled for this date</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {selectedDateEvents.map((event) => (
              <Card key={event.id} className={`p-4 border ${getEventColor(event.type)}`}>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-current mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="mb-1">{event.title}</h3>
                    <p className="opacity-80">{event.time}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
