import { useState, useEffect } from 'react';
import { Minus, Plus, CheckCircle2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../utils/auth/AuthContext';
import { sourcingAPI } from '../../utils/api';

interface SourcingItem {
  id: string;
  name: string;
  targetQuantity: number;
  unit: string;
  totalSourced: number;
  status: string;
  sourcedQuantity: number;
}

export function VolunteerSourcingList() {
  const { user, session } = useAuth();
  const [sourcingItems, setSourcingItems] = useState<SourcingItem[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedItemName, setSubmittedItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingItemId, setSubmittingItemId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [session]);

  const loadData = async () => {
    if (!session?.access_token) return;

    try {
      const [sourcingData, logsData] = await Promise.all([
        sourcingAPI.getList(session.access_token),
        sourcingAPI.getAllLogs(session.access_token),
      ]);

      const items = (sourcingData.items || [])
        .filter((item: any) => item.status === 'active')
        .map((item: any) => ({
          ...item,
          sourcedQuantity: 0,
        }));
      
      setSourcingItems(items);
      setLogs(logsData.logs || []);
    } catch (error) {
      console.error('Error loading sourcing list:', error);
      toast.error('Failed to load sourcing list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const updateQuantity = (id: string, delta: number) => {
    setSourcingItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.sourcedQuantity + delta);
          return { ...item, sourcedQuantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleSubmitItem = async (item: SourcingItem) => {
    if (!session?.access_token) return;

    if (item.sourcedQuantity === 0) {
      toast.error('Please add a quantity before submitting');
      return;
    }

    setSubmittingItemId(item.id);

    try {
      await sourcingAPI.submitSourced(
        [{ itemId: item.id, quantity: item.sourcedQuantity }],
        session.access_token
      );
      
      setSubmittedItemName(item.name);
      setShowSuccessModal(true);
      
      setSourcingItems(items =>
        items.map(i => (i.id === item.id ? { ...i, sourcedQuantity: 0 } : i))
      );
      
      setTimeout(loadData, 1000);
    } catch (error: any) {
      console.error('Error submitting sourcing:', error);
      toast.error(error.message || 'Failed to submit');
    } finally {
      setSubmittingItemId(null);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getLogsForItem = (itemId: string) => {
    return logs.filter(log => log.item_id === itemId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sourcing list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white px-4 py-4 border-b border-gray-200 z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-gray-900">Today's Sourcing List</h1>
            <p className="text-gray-500 mt-1">Welcome, {user?.full_name}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content - Account for fixed header and bottom nav */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-24 mb-16">
        {sourcingItems.length > 0 ? (
          <div className="space-y-3">
            {sourcingItems.map((item) => {
              const remainingNeeded = Math.max(0, item.targetQuantity - (item.totalSourced || 0));
              const isSubmitting = submittingItemId === item.id;
              const isExpanded = expandedItems.has(item.id);
              const itemLogs = getLogsForItem(item.id);
              
              return (
                <Card key={item.id} className="p-4 bg-white">
                  <div className="space-y-3">
                    {/* Item Name and Target */}
                    <div>
                      <h3 className="text-gray-900">{item.name}</h3>
                      <p className="text-gray-600 mt-1">
                        Target: {item.targetQuantity} {item.unit}
                      </p>
                      <p className="text-blue-600 mt-1">
                        Still needed: {remainingNeeded} {item.unit}
                      </p>
                    </div>

                    {/* View Sourcing Logs */}
                    {itemLogs.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          <span>View Sourcing Logs ({itemLogs.length})</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
                            {itemLogs.map((log) => (
                              <div
                                key={log.id}
                                className="flex justify-between items-start text-sm bg-gray-50 p-2 rounded"
                              >
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
                        )}
                      </div>
                    )}

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">I sourced:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-gray-100 hover:bg-gray-200"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-5 h-5 text-gray-700" />
                        </button>
                        <span className="text-gray-900 w-12 text-center">
                          {item.sourcedQuantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-blue-600 hover:bg-blue-700"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={() => handleSubmitItem(item)}
                      disabled={item.sourcedQuantity === 0 || isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300"
                    >
                      {isSubmitting ? 'Submitting...' : `Submit ${item.sourcedQuantity > 0 ? item.sourcedQuantity : ''} ${item.unit}`}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No active sourcing items at this time</p>
            <p className="text-gray-400 mt-2">Check back later for new assignments</p>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Contribution Submitted!</DialogTitle>
            <DialogDescription className="text-center">
              Thank you for sourcing {submittedItemName}! The inventory has been updated.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}