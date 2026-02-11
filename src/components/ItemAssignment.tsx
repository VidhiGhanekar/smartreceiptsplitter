import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BillItem, Person } from '@/types/bill';
import { formatCurrency, getPersonBg, getPersonBgLight, getPersonText, getPersonBorder } from '@/lib/bill-utils';
import { Users, User, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';

interface ItemAssignmentProps {
  items: BillItem[];
  people: Person[];
  onItemsChange: (items: BillItem[]) => void;
}

// Draggable item chip
function DraggableItem({ item, people }: { item: BillItem; people: Person[] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
  });

  const assignedPerson = people.find(p => p.id === item.assignedTo);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`item-card flex items-center gap-2 cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'opacity-40' : ''
      } ${item.splitAmongEveryone ? 'border-split/40 bg-split/5' : ''} ${
        assignedPerson ? `${getPersonBorder(assignedPerson.colorIndex)} ${getPersonBgLight(assignedPerson.colorIndex)}` : ''
      }`}
    >
      <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
      <span className="text-sm font-semibold tabular-nums text-primary">
        {formatCurrency(item.price)}
      </span>
      {item.splitAmongEveryone && <span className="split-badge"><Users className="w-3 h-3" /> Split</span>}
      {assignedPerson && (
        <span className={`person-chip text-xs py-0.5 px-2 ${getPersonBgLight(assignedPerson.colorIndex)} ${getPersonText(assignedPerson.colorIndex)}`}>
          <User className="w-3 h-3" />
          {assignedPerson.name}
        </span>
      )}
    </div>
  );
}

// Droppable person zone
function PersonDropZone({ person, items }: { person: Person; items: BillItem[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: `person-${person.id}` });
  const assignedItems = items.filter(i => i.assignedTo === person.id);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-3 border-2 border-dashed transition-all duration-200 min-h-[80px] ${
        isOver
          ? `${getPersonBorder(person.colorIndex).replace('/30', '')} ${getPersonBgLight(person.colorIndex)} scale-[1.02]`
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-3 h-3 rounded-full ${getPersonBg(person.colorIndex)}`} />
        <span className="text-sm font-semibold">{person.name}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {assignedItems.length} item{assignedItems.length !== 1 ? 's' : ''}
        </span>
      </div>
      {assignedItems.length > 0 && (
        <div className="space-y-1">
          {assignedItems.map(item => (
            <div key={item.id} className="flex justify-between text-xs">
              <span className="truncate">{item.name}</span>
              <span className="font-medium tabular-nums">{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>
      )}
      {assignedItems.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">Drop items here</p>
      )}
    </div>
  );
}

const ItemAssignment: React.FC<ItemAssignmentProps> = ({ items, people, onItemsChange }) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const itemId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith('person-')) {
      const personId = overId.replace('person-', '');
      onItemsChange(items.map(i =>
        i.id === itemId ? { ...i, assignedTo: personId, splitAmongEveryone: false } : i
      ));
    }
  };

  const toggleSplitEveryone = (itemId: string) => {
    onItemsChange(items.map(i =>
      i.id === itemId ? { ...i, splitAmongEveryone: !i.splitAmongEveryone, assignedTo: null } : i
    ));
  };

  const unassign = (itemId: string) => {
    onItemsChange(items.map(i =>
      i.id === itemId ? { ...i, assignedTo: null, splitAmongEveryone: false } : i
    ));
  };

  const activeItem = items.find(i => i.id === activeId);

  if (items.length === 0 || people.length < 2) {
    return (
      <div className="space-y-3">
        <h2 className="section-title flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Assign Items
        </h2>
        <p className="text-sm text-muted-foreground text-center py-6">
          {items.length === 0
            ? 'Add some items first'
            : 'Add at least 2 people to start assigning'}
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Assign Items
        </h2>

        <p className="text-xs text-muted-foreground">
          Drag items onto a person, or click <strong>Split</strong> to share equally.
        </p>

        {/* Item list with action buttons */}
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="flex-1">
                <DraggableItem item={item} people={people} />
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant={item.splitAmongEveryone ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-8 px-2"
                  onClick={() => toggleSplitEveryone(item.id)}
                >
                  <Users className="w-3 h-3 mr-1" />
                  Split
                </Button>
                {(item.assignedTo || item.splitAmongEveryone) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 px-2"
                    onClick={() => unassign(item.id)}
                  >
                    <Undo2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Person drop zones */}
        <div className="grid grid-cols-2 gap-3">
          {people.map(person => (
            <PersonDropZone key={person.id} person={person} items={items} />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="item-card item-card-dragging flex items-center gap-2">
            <span className="text-sm font-medium">{activeItem.name}</span>
            <span className="text-sm font-semibold text-primary">{formatCurrency(activeItem.price)}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default ItemAssignment;
