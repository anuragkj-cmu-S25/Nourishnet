import { AlertTriangle, Package, Mail, Apple } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface DashboardProps {
  onNavigate: (screen: string, date?: Date) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-gray-900">Dashboard</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-2 space-y-4">
        {/* AI Alert Banner */}
        <Card className="bg-yellow-50 border-yellow-200 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-yellow-900">AI Alert: Low Stock Predicted</h3>
              <p className="text-yellow-800 mt-1">
                3 items are predicted to run low this week. Review inventory now.
              </p>
              <Button
                onClick={() => onNavigate('inventory')}
                className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                size="sm"
              >
                View Inventory
              </Button>
            </div>
          </div>
        </Card>

        {/* Key Metric Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex flex-col gap-3">
              <div className="bg-blue-100 p-3 rounded-lg w-fit">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500">Items in Stock</p>
                <p className="text-gray-900 mt-1">247</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-5 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate('inbox')}
          >
            <div className="flex flex-col gap-3">
              <div className="bg-blue-100 p-3 rounded-lg w-fit">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500">Unread Emails</p>
                <p className="text-gray-900 mt-1">10</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Restock Priorities Card */}
        <Card 
          className="p-5 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate('inventory')}
        >
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
              <Apple className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900">Top Items to Restock</h3>
              <p className="text-gray-700 mt-2">Chicken, Tofu, Cheese, Bread</p>
            </div>
          </div>
        </Card>

        {/* Today's Priority Tasks */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3">Today's Priority Tasks</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-700 flex-1">Create sourcing list for tomorrow</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700 flex-1">Sort food by category</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700 flex-1">Review delivery schedule</span>
            </div>
          </div>
          <Button
            onClick={() => onNavigate('tasks')}
            variant="outline"
            className="w-full mt-4"
          >
            View All Tasks
          </Button>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onNavigate('inventory')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Package className="w-5 h-5" />
              <span>Check Inventory</span>
            </Button>
            <Button
              onClick={() => onNavigate('inbox')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              <span>Check Inbox</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
