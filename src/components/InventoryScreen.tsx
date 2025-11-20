import { useState } from 'react';
import { Search, X, Camera } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  isLowPredicted?: boolean;
}

interface SourcingItem extends InventoryItem {
  targetQuantity: number;
  assignedVolunteer?: string;
}

const initialInventory: InventoryItem[] = [
  { id: '1', name: 'Peanut Butter', stock: 12, unit: 'jars', isLowPredicted: true },
  { id: '2', name: 'Canned Beans', stock: 45, unit: 'cans' },
  { id: '3', name: 'Rice', stock: 8, unit: 'bags', isLowPredicted: true },
  { id: '4', name: 'Pasta', stock: 30, unit: 'boxes' },
  { id: '5', name: 'Tomato Sauce', stock: 25, unit: 'cans' },
  { id: '6', name: 'Cereal', stock: 18, unit: 'boxes' },
  { id: '7', name: 'Canned Tuna', stock: 6, unit: 'cans', isLowPredicted: true },
  { id: '8', name: 'Oatmeal', stock: 22, unit: 'boxes' },
  { id: '9', name: 'Soup', stock: 35, unit: 'cans' },
  { id: '10', name: 'Crackers', stock: 14, unit: 'boxes' },
  { id: '11', name: 'Milk (Shelf-Stable)', stock: 10, unit: 'cartons' },
  { id: '12', name: 'Vegetable Oil', stock: 8, unit: 'bottles' },
];

const volunteers = [
  { id: 'james-smith', name: 'James Smith' },
  { id: 'sarah-johnson', name: 'Sarah Johnson' },
  { id: 'michael-brown', name: 'Michael Brown' },
  { id: 'emily-davis', name: 'Emily Davis' },
];

interface InventoryScreenProps {
  onOpenScanner?: () => void;
  onOpenSourcingList?: (items: SourcingItem[]) => void;
}

export function InventoryScreen({ onOpenScanner, onOpenSourcingList }: InventoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [targetQuantity, setTargetQuantity] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [sourcingList, setSourcingList] = useState<SourcingItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredInventory = initialInventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToList = (item: InventoryItem) => {
    setSelectedItem(item);
    setTargetQuantity('');
    setSelectedVolunteer('');
    setIsModalOpen(true);
  };

  const confirmAddToList = () => {
    if (selectedItem && targetQuantity && selectedVolunteer) {
      const newItem: SourcingItem = {
        ...selectedItem,
        targetQuantity: parseInt(targetQuantity),
        assignedVolunteer: selectedVolunteer,
      };
      setSourcingList([...sourcingList, newItem]);
      setIsModalOpen(false);
      const volunteerName = volunteers.find(v => v.id === selectedVolunteer)?.name;
      toast.success(`${selectedItem.name} added to ${volunteerName}'s list`);
    }
  };

  const removeFromList = (id: string) => {
    setSourcingList(sourcingList.filter(item => item.id !== id));
    toast.success('Item removed from list');
  };

  const openSourcingListScreen = () => {
    if (onOpenSourcingList) {
      onOpenSourcingList(sourcingList);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-gray-900">Inventory & Sourcing</h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 pb-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-2">
        <div className="grid grid-cols-2 gap-4 pb-24">
          {filteredInventory.map((item) => (
            <Card key={item.id} className="relative overflow-hidden">
              {item.isLowPredicted && (
                <Badge className="absolute top-0 left-0 right-0 bg-yellow-400 text-yellow-900 rounded-none border-0 justify-center">
                  AI PREDICTED LOW
                </Badge>
              )}
              <div className={`p-4 ${item.isLowPredicted ? 'pt-8' : ''}`}>
                <h3 className="text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-3">
                  Stock: {item.stock} {item.unit}
                </p>
                <Button
                  onClick={() => handleAddToList(item)}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add to List
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sourcing List Button */}
      {sourcingList.length > 0 && (
        <Button
          onClick={openSourcingListScreen}
          className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          size="lg"
        >
          View Sourcing List ({sourcingList.length})
        </Button>
      )}

      {/* Add to List Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add to Sourcing List</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-gray-900">{selectedItem?.name}</p>
              <p className="text-gray-600">
                Current Stock: {selectedItem?.stock} {selectedItem?.unit}
              </p>
            </div>
            <div>
              <Label htmlFor="target-quantity">Target Quantity</Label>
              <Input
                id="target-quantity"
                type="number"
                placeholder="Enter target quantity"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="volunteer">Assign Volunteer</Label>
              <Select
                id="volunteer"
                value={selectedVolunteer}
                onValueChange={setSelectedVolunteer}
                className="mt-1"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a volunteer" />
                </SelectTrigger>
                <SelectContent>
                  {volunteers.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAddToList}
              disabled={!targetQuantity || !selectedVolunteer}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Camera Scanner FAB */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto pointer-events-none z-50">
        <div className="relative w-full h-0">
          <button
            onClick={onOpenScanner}
            className="absolute bottom-0 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 pointer-events-auto"
            aria-label="Open camera scanner"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}