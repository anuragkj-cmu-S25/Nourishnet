import { useState } from 'react';
import { List, Mail, Calendar, User } from 'lucide-react';
import { VolunteerSourcingList } from './VolunteerSourcingList';
import { VolunteerInbox } from './VolunteerInbox';
import { VolunteerCalendar } from './VolunteerCalendar';
import { VolunteerProfile } from './VolunteerProfile';

type VolunteerScreen = 'sourcing-list' | 'inbox' | 'calendar' | 'profile';

export function VolunteerApp() {
  const [activeScreen, setActiveScreen] = useState<VolunteerScreen>('sourcing-list');
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);

  const handleNavigate = (screen: VolunteerScreen, date?: Date) => {
    setActiveScreen(screen);
    if (screen === 'calendar' && date) {
      setCalendarDate(date);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'sourcing-list':
        return <VolunteerSourcingList />;
      case 'inbox':
        return <VolunteerInbox onNavigate={handleNavigate} />;
      case 'calendar':
        return <VolunteerCalendar initialDate={calendarDate} />;
      case 'profile':
        return <VolunteerProfile />;
      default:
        return <VolunteerSourcingList />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFFDF6] max-w-md mx-auto">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-2 py-2 safe-area-bottom">
        <div className="flex justify-around items-center">
          <button
            onClick={() => setActiveScreen('sourcing-list')}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              activeScreen === 'sourcing-list'
                ? 'text-[#A0C87B] bg-[#F2FFB5]'
                : 'text-gray-600'
            }`}
          >
            <List className="w-6 h-6" />
            <span className="text-xs mt-1">Sourcing</span>
          </button>

          <button
            onClick={() => setActiveScreen('inbox')}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              activeScreen === 'inbox'
                ? 'text-[#A0C87B] bg-[#F2FFB5]'
                : 'text-gray-600'
            }`}
          >
            <Mail className="w-6 h-6" />
            <span className="text-xs mt-1">Inbox</span>
          </button>

          <button
            onClick={() => setActiveScreen('calendar')}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              activeScreen === 'calendar'
                ? 'text-[#A0C87B] bg-[#F2FFB5]'
                : 'text-gray-600'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs mt-1">Calendar</span>
          </button>

          <button
            onClick={() => setActiveScreen('profile')}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              activeScreen === 'profile'
                ? 'text-[#A0C87B] bg-[#F2FFB5]'
                : 'text-gray-600'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}