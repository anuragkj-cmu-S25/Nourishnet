import { useState } from 'react';
import { Minus, Plus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface SourcingItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  targetQuantity: number;
  sourcedQuantity: number;
  isComplete: boolean;
  assignedVolunteer?: string;
}

interface SourcingListScreenProps {
  items?: Array<{
    id: string;
    name: string;
    stock: number;
    unit: string;
    targetQuantity: number;
    assignedVolunteer?: string;
  }>;
  onBack?: () => void;
}

export function SourcingListScreen({ items = [], onBack }: SourcingListScreenProps) {
  const [sourcingItems, setSourcingItems] = useState<SourcingItem[]>(
    items.length > 0
      ? items.map(item => ({
          ...item,
          sourcedQuantity: 0,
          isComplete: false,
        }))
      : [
          { id: '1', name: 'Peanut Butter', stock: 12, unit: 'jars', targetQuantity: 20, sourcedQuantity: 0, isComplete: false, assignedVolunteer: 'James Smith' },
          { id: '2', name: 'Rice', stock: 8, unit: 'bags', targetQuantity: 15, sourcedQuantity: 0, isComplete: false, assignedVolunteer: 'James Smith' },
          { id: '3', name: 'Canned Tuna', stock: 6, unit: 'cans', targetQuantity: 24, sourcedQuantity: 0, isComplete: false, assignedVolunteer: 'James Smith' },
        ]
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Get the assigned volunteer name (assuming all items in the list are for the same volunteer)
  const assignedVolunteerName = sourcingItems.length > 0 && sourcingItems[0].assignedVolunteer 
    ? sourcingItems[0].assignedVolunteer 
    : 'James Smith';

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

  const handleSubmit = () => {
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-gray-900">Today's Sourcing List</h1>
            <p className="text-gray-500 mt-1">For volunteer: {assignedVolunteerName}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <div className="space-y-3">
          {sourcingItems.map((item) => (
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
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Sourced Quantity:</span>
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
          ))}
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <Button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          Confirm & Update List
        </Button>
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
            <DialogTitle className="text-center">List Updated!</DialogTitle>
            <DialogDescription className="text-center">
              Your sourcing list has been submitted successfully and the inventory has been updated.
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