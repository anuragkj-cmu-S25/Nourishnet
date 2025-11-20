import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../utils/auth/AuthContext';
import { sourcingAPI } from '../../utils/api';

interface StaffSourcingMonitorProps {
  onBack: () => void;
}

export function StaffSourcingMonitor({ onBack }: StaffSourcingMonitorProps) {
  const { session } = useAuth();
  const [sourcingList, setSourcingList] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [itemLogs, setItemLogs] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Poll for updates every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [session]);

  const loadData = async () => {
    if (!session?.access_token) return;

    try {
      const data = await sourcingAPI.getList(session.access_token);
      setSourcingList(data.items || []);
    } catch (error) {
      console.error('Error loading sourcing list:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
      // Load logs if not already loaded
      if (!itemLogs[itemId] && session?.access_token) {
        try {
          const data = await sourcingAPI.getAllLogs(session.access_token);
          // Filter logs for this specific item
          const itemSpecificLogs = (data.logs || []).filter((log: any) => log.item_id === itemId);
          setItemLogs(prev => ({ ...prev, [itemId]: itemSpecificLogs }));
        } catch (error) {
          console.error('Error loading logs:', error);
        }
      }
    }
    
    setExpandedItems(newExpanded);
  };

  const handleRemoveItem = async (itemId: string, itemName: string) => {
    if (!session?.access_token) return;

    try {
      await sourcingAPI.removeItem(itemId, session.access_token);
      toast.success(`${itemName} removed from sourcing list`);
      loadData();
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const activeItems = sourcingList.filter(item => item.status === 'active');
  const completedItems = sourcingList.filter(item => item.status === 'complete');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-gray-900">Sourcing Progress Monitor</h1>
            <p className="text-gray-500 mt-1">Track volunteer sourcing in real-time</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Active Items */}
        {activeItems.length > 0 && (
          <div>
            <h2 className="text-gray-700 mb-3 uppercase tracking-wide">Active Items</h2>
            <div className="space-y-3">
              {activeItems.map((item) => {
                const progress = Math.min(100, (item.totalSourced / item.targetQuantity) * 100);
                const isExpanded = expandedItems.has(item.id);
                const logs = itemLogs[item.id] || [];

                return (
                  <Card key={item.id} className="p-4">
                    <div className="space-y-3">
                      {/* Item Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-gray-900">{item.name}</h3>
                          <p className="text-gray-600 mt-1">
                            Target: {item.targetQuantity} {item.unit}
                          </p>
                          <p className="text-gray-900 mt-1">
                            Sourced: {item.totalSourced || 0} {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            <span>Hide Details</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>View Sourcing Log</span>
                          </>
                        )}
                      </button>

                      {/* Expanded Logs */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-gray-200">
                          <h4 className="text-gray-700 mb-2">Sourcing History</h4>
                          {logs.length > 0 ? (
                            <div className="space-y-2">
                              {logs.map((log) => (
                                <div key={log.id} className="flex items-start justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <p className="text-gray-900">{log.volunteer_name}</p>
                                    <p className="text-gray-600">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                  <p className="text-gray-900">
                                    +{log.quantity} {item.unit}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-2">No sourcing activity yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div>
            <h2 className="text-gray-700 mb-3 uppercase tracking-wide">Completed Items</h2>
            <div className="space-y-3">
              {completedItems.map((item) => (
                <Card key={item.id} className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-gray-900">{item.name}</h3>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-gray-600 mt-1">
                        Target: {item.targetQuantity} {item.unit}
                      </p>
                      <p className="text-gray-900 mt-1">
                        Sourced: {item.totalSourced} {item.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {sourcingList.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items in sourcing list</p>
            <Button
              onClick={onBack}
              variant="outline"
              className="mt-4"
            >
              Go to Inventory
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}