import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Users, Calendar, Info, LogOut, Mail, Apple } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { useAuth } from '../../utils/auth/AuthContext';
import { inventoryAPI, sourcingAPI, emailAPI, calendarAPI, tasksAPI } from '../../utils/api';
import { toast } from 'sonner';

interface StaffDashboardProps {
  onNavigate: (screen: string, date?: Date) => void;
}

export function StaffDashboard({ onNavigate }: StaffDashboardProps) {
  const { user, session, signOut } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, [session]);

  const loadData = async () => {
    if (!session?.access_token) {
      console.log('StaffDashboard: No access token available, skipping data load');
      return;
    }

    console.log('StaffDashboard: Loading data with access token');
    try {
      const [inventoryData, emailData, taskData] = await Promise.all([
        inventoryAPI.getAll(session.access_token),
        emailAPI.getAll(session.access_token),
        tasksAPI.getAll(session.access_token),
      ]);

      setInventory(inventoryData.items || []);
      setEmails(emailData.emails || []);
      setTasks(taskData.tasks || []);
      console.log('StaffDashboard: Data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = inventory.filter(
    item => item.stock <= item.low_stock_threshold
  );

  const topRestockItems = lowStockItems
    .slice(0, 4)
    .map(item => item.name)
    .join(', ');

  const priorityTasks = tasks.filter(t => !t.completed).slice(0, 3);

  return (
    <div className="flex flex-col h-full bg-[#FFFDF6]">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Hi, {user?.full_name || 'Staff Member'}</p>
          </div>
          <div className="flex items-center gap-2 relative">
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
                    Your overview hub. Tap cards to navigate. AI alerts show predicted low stock items.
                  </p>
                </div>
              </>
            )}
            <Button
              onClick={() => setShowLogoutConfirm(true)}
              variant="ghost"
              size="sm"
              className="text-gray-600"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-2 space-y-4">
        {/* AI Alert Banner */}
        {lowStockItems.length > 0 && (
          <Card className="bg-white border-blue-500 border-2 p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-500 text-xs font-bold">i</span>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900">AI Alert: Low Stock Predicted</h3>
                <p className="text-gray-700 mt-1">
                  {lowStockItems.length} items are predicted to run low this week. Review inventory now.
                </p>
                <Button
                  onClick={() => onNavigate('inventory')}
                  className="mt-3 bg-orange-500 hover:bg-orange-600 text-white"
                  size="sm"
                >
                  View Inventory
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Key Metric Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 bg-white">
            <div className="flex flex-col gap-3">
              <div className="bg-[#F2FFB5] p-3 rounded-lg w-fit">
                <Package className="w-6 h-6 text-[#A0C87B]" />
              </div>
              <div>
                <p className="text-gray-500">Items in Stock</p>
                <p className="text-gray-900 mt-1">{inventory.length}</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-5 bg-white cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate('inbox')}
          >
            <div className="flex flex-col gap-3">
              <div className="bg-[#F2FFB5] p-3 rounded-lg w-fit">
                <Mail className="w-6 h-6 text-[#A0C87B]" />
              </div>
              <div>
                <p className="text-gray-500">Unread Emails</p>
                <p className="text-gray-900 mt-1">{emails.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Restock Priorities Card */}
        {topRestockItems && (
          <Card 
            className="p-5 bg-white cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate('inventory')}
          >
            <div className="flex items-start gap-3">
              <div className="bg-[#F2FFB5] p-3 rounded-lg flex-shrink-0">
                <Apple className="w-6 h-6 text-[#A0C87B]" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900">Top Items to Restock</h3>
                <p className="text-gray-700 mt-2">{topRestockItems || 'All items in stock!'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Today's Priority Tasks */}
        <Card className="p-4 bg-white">
          <h3 className="text-gray-900 mb-3">Today's Priority Tasks</h3>
          <div className="space-y-3">
            {priorityTasks.length > 0 ? (
              priorityTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-[#FAF6E9] rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-[#A0C87B]' : 'bg-[#F2FFB5]'
                  }`}></div>
                  <span className="text-gray-700 flex-1">{task.title}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-2">No pending tasks</p>
            )}
          </div>
          <Button
            onClick={() => onNavigate('tasks')}
            variant="outline"
            className="w-full mt-4 bg-[#A0C87B] hover:bg-[#8ab668] text-white border-[#A0C87B]"
          >
            View All Tasks
          </Button>
        </Card>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Log Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? This will end your current session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowLogoutConfirm(false);
                signOut();
              }}
              className="flex-1 bg-[#A0C87B] hover:bg-[#8DB668] text-white"
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}