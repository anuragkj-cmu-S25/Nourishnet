import { useState } from 'react';
import { ArrowLeft, Flame, Droplet } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ScannedItemDetailsScreenProps {
  onClose: () => void;
}

interface Recipe {
  id: string;
  name: string;
  image: string;
}

interface NutritionInfo {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export function ScannedItemDetailsScreen({ onClose }: ScannedItemDetailsScreenProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [quantity, setQuantity] = useState('');

  const itemName = 'Black Beans';
  const itemImage = 'https://images.unsplash.com/photo-1612504258838-fbf14fe4437d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGJlYW5zJTIwY2FufGVufDF8fHx8MTc2Mjc0OTkxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

  const nutritionInfo: NutritionInfo[] = [
    { label: 'Calories', value: '110 per serving', icon: <Flame className="w-5 h-5 text-orange-500" /> },
    { label: 'Protein', value: '7g', icon: <span className="text-xl">💪</span> },
    { label: 'Fiber', value: '5g', icon: <span className="text-xl">🌾</span> },
    { label: 'Sodium', value: '380mg', icon: <Droplet className="w-5 h-5 text-blue-500" /> },
    { label: 'Iron', value: '15% DV', icon: <span className="text-xl">🔴</span> },
    { label: 'Potassium', value: '10% DV', icon: <span className="text-xl">⚡</span> },
  ];

  const recipes: Recipe[] = [
    {
      id: '1',
      name: 'Quick Bean and Corn Salsa',
      image: 'https://images.unsplash.com/photo-1722239312531-486bbfd50f18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFuJTIwc2Fsc2ElMjByZWNpcGV8ZW58MXx8fHwxNzYyNzQ5OTE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '2',
      name: 'Black Bean Soup',
      image: 'https://images.unsplash.com/photo-1648455320791-a667c8aab7e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFuJTIwc291cCUyMGJvd2x8ZW58MXx8fHwxNzYyNzQ5OTE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '3',
      name: 'Bean and Rice Bowl',
      image: 'https://images.unsplash.com/photo-1612504258838-fbf14fe4437d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGJlYW5zJTIwY2FufGVufDF8fHx8MTc2Mjc0OTkxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '4',
      name: 'Mexican-Style Black Beans',
      image: 'https://images.unsplash.com/photo-1722239312531-486bbfd50f18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFuJTIwc2Fsc2ElMjByZWNpcGV8ZW58MXx8fHwxNzYyNzQ5OTE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  const handleAddToInventory = () => {
    setShowAddModal(true);
  };

  const confirmAddToInventory = () => {
    if (quantity) {
      toast.success(`${quantity} cans of ${itemName} added to inventory`);
      setShowAddModal(false);
      setQuantity('');
      // Close the scanned item screen and return to inventory
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-gray-900 flex-1">{itemName}</h1>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Scanned
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Item Image */}
        <div className="bg-white p-4">
          <div className="aspect-square w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={itemImage}
              alt={itemName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Add to Inventory Button */}
        <div className="px-4 pt-4 pb-2">
          <Button
            onClick={handleAddToInventory}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            + Add to Inventory
          </Button>
        </div>

        {/* Information Tabs */}
        <div className="px-4 pb-6">
          <Tabs defaultValue="nutrition" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="recipes">Recipes</TabsTrigger>
            </TabsList>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition" className="space-y-3">
              <h3 className="text-gray-900 mb-3">Nutritional Information</h3>
              <div className="grid grid-cols-2 gap-3">
                {nutritionInfo.map((info, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">{info.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600">{info.label}</p>
                        <p className="text-gray-900 mt-1">{info.value}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Recipes Tab */}
            <TabsContent value="recipes" className="space-y-3">
              <h3 className="text-gray-900 mb-3">Recipe Ideas</h3>
              {recipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-4 p-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900">{recipe.name}</h4>
                      <p className="text-gray-500 mt-1">
                        Tap to view recipe
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add to Inventory Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add to Inventory</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-gray-900">{itemName}</p>
              <p className="text-gray-600">How many cans are you adding?</p>
            </div>
            <div>
              <Label htmlFor="quantity">Number of Cans</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter number of cans"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAddToInventory}
              disabled={!quantity || parseInt(quantity) <= 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add to Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
