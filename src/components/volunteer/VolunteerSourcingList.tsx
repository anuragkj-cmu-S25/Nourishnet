import { useState, useEffect } from 'react';
import { Minus, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
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
  sourcedQuantity: number; // Local quantity being entered
  isComplete: boolean; // Local completion state
}

export function VolunteerSourcingList() {
  const { user, session } = useAuth();
  const [sourcingItems, setSourcingItems] = useState<SourcingItem[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    // Poll for updates every 15 seconds
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [session]);

  const loadData = async () => {
    if (!session?.access_token) return;

    try {
      const data = await sourcingAPI.getList(session.access_token);
      const items = (data.items || [])
        .filter((item: any) => item.status === 'active') // Only show active items
        .map((item: any) => ({
          ...item,
          sourcedQuantity: 0,
          isComplete: false,
        }));
      
      setSourcingItems(items);
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
        if (item.id === id && !item.isComplete) {
          const newQuantity = Math.max(0, item.sourcedQuantity + delta);
          return { ...item, sourcedQuantity: newQuantity };
        }
        return item;
      })
    );
  };

  const toggleComplete = (id: string) => {
    setSourcingItems(items =>
      items.map(item => {
        if (item.id === id) {
          return { ...item, isComplete: !item.isComplete };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    if (!session?.access_token) return;

    // Get items that were marked complete or have quantity > 0
    const itemsToSubmit = sourcingItems
      .filter(item => item.sourcedQuantity > 0)
      .map(item => ({
        itemId: item.id,
        quantity: item.sourcedQuantity,
      }));

    if (itemsToSubmit.length === 0) {
      toast.error('Please add quantities before submitting');
      return;
    }

    try {
      await sourcingAPI.submitSourced(itemsToSubmit, session.access_token);
      setShowSuccessModal(true);
      // Reset local quantities
      setSourcingItems(items =>
        items.map(item => ({
          ...item,
          sourcedQuantity: 0,
          isComplete: false,
        }))
      );
      // Reload to get updated totals
      setTimeout(loadData, 1000);
    } catch (error: any) {
      console.error('Error submitting sourcing:', error);
      toast.error(error.message || 'Failed to submit');
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
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
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {sourcingItems.length > 0 ? (
          <div className="space-y-3">
            {sourcingItems.map((item) => {
              const remainingNeeded = Math.max(0, item.targetQuantity - (item.totalSourced || 0));
              
              return (
                <Card
                  key={item.id}
                  className={`p-4 transition-all ${
                    item.isComplete ? 'bg-gray-50 opacity-75' : 'bg-white'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Item Name and Target */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className={`text-gray-900 ${item.isComplete ? 'line-through' : ''}`}>
                          {item.name}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Target: {item.targetQuantity} {item.unit}
                        </p>
                        <p className="text-gray-600">
                          Already sourced: {item.totalSourced || 0} {item.unit}
                        </p>
                        <p className="text-blue-600 mt-1">
                          Still needed: {remainingNeeded} {item.unit}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">I sourced:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.isComplete}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            item.isComplete
                              ? 'bg-gray-200 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          aria-label="Decrease quantity"
                        >
                          <Minus className={`w-5 h-5 ${item.isComplete ? 'text-gray-400' : 'text-gray-700'}`} />
                        </button>
                        <span className={`text-gray-900 w-12 text-center ${item.isComplete ? 'text-gray-500' : ''}`}>
                          {item.sourcedQuantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.isComplete}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            item.isComplete
                              ? 'bg-gray-200 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          aria-label="Increase quantity"
                        >
                          <Plus className={`w-5 h-5 ${item.isComplete ? 'text-gray-400' : 'text-white'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Mark as Complete Checkbox */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                      <Checkbox
                        id={`complete-${item.id}`}
                        checked={item.isComplete}
                        onCheckedChange={() => toggleComplete(item.id)}
                      />
                      <label
                        htmlFor={`complete-${item.id}`}
                        className="text-gray-700 cursor-pointer select-none flex-1"
                      >
                        Mark as Complete
                      </label>
                      {item.isComplete && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
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

      {/* Footer Button */}
      {sourcingItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            Submit My Contribution
          </Button>
        </div>
      )}

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
              Thank you! Your sourced items have been recorded and the inventory has been updated.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Button
              onClick={handleCloseSuccessModal}
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
