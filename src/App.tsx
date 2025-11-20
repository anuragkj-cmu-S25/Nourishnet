import { useState } from 'react';
import { Home, Package, ListTodo, Mail, Calendar } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { InventoryScreen } from './components/InventoryScreen';
import { TasksScreen } from './components/TasksScreen';
import { InboxScreen } from './components/InboxScreen';
import { CalendarView } from './components/CalendarView';
import { SourcingListScreen } from './components/SourcingListScreen';
import { CameraScannerScreen } from './components/CameraScannerScreen';
import { ScannedItemDetailsScreen } from './components/ScannedItemDetailsScreen';
import { Toaster } from './components/ui/sonner';

type Screen = 'dashboard' | 'inventory' | 'tasks' | 'inbox' | 'calendar' | 'sourcing-list' | 'camera-scanner' | 'scanned-item';

interface SourcingItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  targetQuantity: number;
  assignedVolunteer?: string;
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [sourcingListItems, setSourcingListItems] = useState<SourcingItem[]>([]);

  const handleNavigate = (screen: Screen, date?: Date) => {
    setActiveScreen(screen);
    if (screen === 'calendar' && date) {
      setCalendarDate(date);
    } else if (screen !== 'calendar') {
      setCalendarDate(undefined);
    }
  };

  const handleOpenSourcingList = (items: SourcingItem[]) => {
    setSourcingListItems(items);
    setActiveScreen('sourcing-list');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'inventory':
        return (
          <InventoryScreen
            onOpenScanner={() => setActiveScreen('camera-scanner')}
            onOpenSourcingList={handleOpenSourcingList}
          />
        );
      case 'tasks':
        return <TasksScreen />;
      case 'inbox':
        return <InboxScreen onNavigate={handleNavigate} />;
      case 'calendar':
        return <CalendarView initialDate={calendarDate} />;
      case 'sourcing-list':
        return (
          <SourcingListScreen
            items={sourcingListItems}
            onBack={() => setActiveScreen('inventory')}
          />
        );
      case 'camera-scanner':
        return (
          <CameraScannerScreen
            onClose={() => setActiveScreen('inventory')}
            onCapture={() => setActiveScreen('scanned-item')}
          />
        );
      case 'scanned-item':
        return <ScannedItemDetailsScreen onClose={() => setActiveScreen('inventory')} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto">
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderScreen()}
        </div>

      {/* Bottom Navigation */}
      {activeScreen !== 'sourcing-list' && activeScreen !== 'camera-scanner' && activeScreen !== 'scanned-item' && (
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
    </>
  );
}