import { useState, useEffect } from 'react';
import { Search, Eye, Info } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
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
  const [showInfo, setShowInfo] = useState(false);

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
    <div className="flex flex-col h-full bg-[#FFFDF6]">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-gray-900">Inventory & Sourcing</h1>
            <p className="text-gray-500 mt-1">{inventory.length} items</p>
          </div>
          <div className="relative">
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
                    View all inventory items. Search to filter. Add low stock items to sourcing list for volunteers to collect.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
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
            className="pl-10 bg-[#FAF6E9]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-2">
        <div className="grid grid-cols-2 gap-4 pb-24">
          {filteredInventory.map((item) => {
            const isLowStock = item.stock <= item.low_stock_threshold;
            return (
              <Card key={item.id} className="relative overflow-hidden bg-white">
                {isLowStock && (
                  <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white rounded-t-lg flex items-center justify-center gap-1 py-1 px-2">
                    <span className="uppercase tracking-wide text-xs sm:text-sm">AI Predicted Low</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                          <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" side="top">
                        <p className="text-gray-700">
                          Based on previous trends, you should restock this item ASAP.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                <div className={`p-4 ${isLowStock ? 'pt-8' : ''}`}>
                  <h3 className="text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-3">
                    Stock: {item.stock} {item.unit}
                  </p>
                  <Button
                    onClick={() => handleAddToList(item)}
                    size="sm"
                    className="w-full bg-[#A0C87B] hover:bg-[#8ab668] text-white"
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
          className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-[#F2FFB5] hover:bg-[#e8f5a0] text-gray-900 shadow-lg border border-[#A0C87B]"
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
            <DialogDescription>
              Add the selected item to the sourcing list with a target quantity.
            </DialogDescription>
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
                className="mt-1 bg-[#FAF6E9]"
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
              className="bg-[#A0C87B] hover:bg-[#8ab668] text-white"
            >
              Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}