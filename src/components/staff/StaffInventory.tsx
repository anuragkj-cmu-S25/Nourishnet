import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../utils/auth/AuthContext';
import { inventoryAPI, sourcingAPI } from '../../utils/api';

interface StaffInventoryProps {
  onNavigate: (screen: string) => void;
}

export function StaffInventory({ onNavigate }: StaffInventoryProps) {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [sourcingList, setSourcingList] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [targetQuantity, setTargetQuantity] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [session]);

  const loadData = async () => {
    if (!session?.access_token) return;

    try {
      const [inventoryData, sourcingData] = await Promise.all([
        inventoryAPI.getAll(session.access_token),
        sourcingAPI.getList(session.access_token),
      ]);

      setInventory(inventoryData.items || []);
      setSourcingList(sourcingData.items || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToList = (item: any) => {
    // Check if already in sourcing list
    const alreadyInList = sourcingList.some(s => s.id === item.id);
    if (alreadyInList) {
      toast.error('Item already in sourcing list');
      return;
    }

    setSelectedItem(item);
    setTargetQuantity('');
    setIsModalOpen(true);
  };

  const confirmAddToList = async () => {
    if (!selectedItem || !targetQuantity || !session?.access_token) return;

    try {
      await sourcingAPI.addItem(
        {
          itemId: selectedItem.id,
          name: selectedItem.name,
          targetQuantity: parseInt(targetQuantity),
          unit: selectedItem.unit,
        },
        session.access_token
      );

      setIsModalOpen(false);
      toast.success(`${selectedItem.name} added to sourcing list`);
      loadData(); // Reload to get updated sourcing list
    } catch (error: any) {
      console.error('Error adding to sourcing list:', error);
      toast.error(error.message || 'Failed to add item');
    }
  };

  const activeSourcingCount = sourcingList.filter(item => item.status === 'active').length;

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
          {filteredInventory.map((item) => {
            const isLowStock = item.stock <= item.low_stock_threshold;
            return (
              <Card key={item.id} className="relative overflow-hidden">
                {isLowStock && (
                  <Badge className="absolute top-0 left-0 right-0 bg-yellow-400 text-yellow-900 rounded-none border-0 justify-center">
                    AI PREDICTED LOW
                  </Badge>
                )}
                <div className={`p-4 ${isLowStock ? 'pt-8' : ''}`}>
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
            );
          })}
        </div>
      </div>

      {/* Sourcing Monitor Button */}
      {sourcingList.length > 0 && (
        <Button
          onClick={() => onNavigate('sourcing-monitor')}
          className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-green-600 hover:bg-green-700 text-white shadow-lg"
          size="lg"
        >
          <Eye className="w-5 h-5 mr-2" />
          Monitor Sourcing Progress ({activeSourcingCount} active)
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
              <p className="text-gray-500 mt-1">This will be shared with all volunteers</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAddToList}
              disabled={!targetQuantity}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
