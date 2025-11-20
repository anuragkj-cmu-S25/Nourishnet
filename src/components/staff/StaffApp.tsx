import { useState } from 'react';
import { Home, Package, ListTodo, Mail, Calendar } from 'lucide-react';
import { StaffDashboard } from './StaffDashboard';
import { StaffInventory } from './StaffInventory';
import { StaffTasks } from './StaffTasks';
import { StaffInbox } from './StaffInbox';
import { StaffCalendar } from './StaffCalendar';
import { StaffSourcingMonitor } from './StaffSourcingMonitor';

type StaffScreen = 'dashboard' | 'inventory' | 'tasks' | 'inbox' | 'calendar' | 'sourcing-monitor';

export function StaffApp() {
  const [activeScreen, setActiveScreen] = useState<StaffScreen>('dashboard');
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);

  const handleNavigate = (screen: StaffScreen, date?: Date) => {
    setActiveScreen(screen);
    if (screen === 'calendar' && date) {
      setCalendarDate(date);
    } else if (screen !== 'calendar') {
      setCalendarDate(undefined);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <StaffDashboard onNavigate={handleNavigate} />;
      case 'inventory':
        return <StaffInventory onNavigate={handleNavigate} />;
      case 'tasks':
        return <StaffTasks />;
      case 'inbox':
        return <StaffInbox onNavigate={handleNavigate} />;
      case 'calendar':
        return <StaffCalendar initialDate={calendarDate} />;
      case 'sourcing-monitor':
        return <StaffSourcingMonitor onBack={() => setActiveScreen('inventory')} />;
      default:
        return <StaffDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      {activeScreen !== 'sourcing-monitor' && (
        <nav className="bg-white border-t border-gray-200 px-2 py-2 safe-area-bottom">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setActiveScreen('dashboard')}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                activeScreen === 'dashboard'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveScreen('inventory')}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                activeScreen === 'inventory'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600'
              }`}
            >
              <Package className="w-6 h-6" />
              <span className="text-xs mt-1">Inventory</span>
            </button>

            <button
              onClick={() => setActiveScreen('tasks')}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                activeScreen === 'tasks'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600'
              }`}
            >
              <ListTodo className="w-6 h-6" />
              <span className="text-xs mt-1">Tasks</span>
            </button>

            <button
              onClick={() => setActiveScreen('inbox')}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                activeScreen === 'inbox'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600'
              }`}
            >
              <Mail className="w-6 h-6" />
              <span className="text-xs mt-1">Inbox</span>
            </button>

            <button
              onClick={() => handleNavigate('calendar')}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                activeScreen === 'calendar'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600'
              }`}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-xs mt-1">Calendar</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
