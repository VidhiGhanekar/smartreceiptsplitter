import React, { useState } from 'react';
import { List, Plus, Trash2, Edit2, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BillItem } from '@/types/bill';
import { generateId, formatCurrency } from '@/lib/bill-utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ItemListProps {
  items: BillItem[];
  onItemsChange: (items: BillItem[]) => void;
  ocrLoading: boolean;
}

const ItemList: React.FC<ItemListProps> = ({ items, onItemsChange, ocrLoading }) => {
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const addItem = () => {
    const name = newName.trim();
    const price = parseFloat(newPrice);
    if (!name || isNaN(price) || price <= 0) return;
    onItemsChange([...items, { id: generateId(), name, price, assignedTo: null, splitAmongEveryone: false }]);
    setNewName('');
    setNewPrice('');
  };

  const deleteItem = (id: string) => {
    onItemsChange(items.filter(i => i.id !== id));
  };

  const startEdit = (item: BillItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
  };

  const saveEdit = () => {
    if (!editingId) return;
    const price = parseFloat(editPrice);
    if (!editName.trim() || isNaN(price) || price <= 0) return;
    onItemsChange(items.map(i =>
      i.id === editingId ? { ...i, name: editName.trim(), price } : i
    ));
    setEditingId(null);
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addItem();
  };

  return (
    <div className="space-y-3">
      <h2 className="section-title flex items-center gap-2">
        <List className="w-5 h-5 text-primary" />
        Items
        {ocrLoading && (
          <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground ml-auto">
            <Loader2 className="w-3 h-3 animate-spin" />
            Scanning receipt...
          </span>
        )}
      </h2>

      {/* Add item form */}
      <div className="flex gap-2">
        <Input
          placeholder="Item name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleAddKeyDown}
          className="flex-1"
        />
        <Input
          placeholder="Price"
          type="number"
          step="0.01"
          min="0"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          onKeyDown={handleAddKeyDown}
          className="w-24"
        />
        <Button onClick={addItem} size="icon" disabled={!newName.trim() || !newPrice}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Items list */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="item-card flex items-center gap-2"
            >
              {editingId === item.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 h-8 text-sm"
                    autoFocus
                  />
                  <Input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    type="number"
                    step="0.01"
                    className="w-20 h-8 text-sm"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveEdit}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
                  <span className="text-sm font-semibold text-primary tabular-nums">
                    {formatCurrency(item.price)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(item)}>
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && !ocrLoading && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Upload a receipt or add items manually
          </p>
        )}
      </div>
    </div>
  );
};

export default ItemList;
