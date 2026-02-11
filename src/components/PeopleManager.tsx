import React, { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Person } from '@/types/bill';
import { generateId, getPersonBg, getPersonBgLight, getPersonText } from '@/lib/bill-utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PeopleManagerProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
}

let nextColor = 1;

const PeopleManager: React.FC<PeopleManagerProps> = ({ people, onPeopleChange }) => {
  const [name, setName] = useState('');

  const addPerson = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const colorIndex = ((nextColor - 1) % 8) + 1;
    nextColor++;
    onPeopleChange([...people, { id: generateId(), name: trimmed, colorIndex }]);
    setName('');
  };

  const removePerson = (id: string) => {
    onPeopleChange(people.filter(p => p.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addPerson();
  };

  return (
    <div className="space-y-3">
      <h2 className="section-title flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        People
        {people.length < 2 && (
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            Add at least 2
          </span>
        )}
      </h2>

      <div className="flex gap-2">
        <Input
          placeholder="Enter a name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={addPerson} size="icon" disabled={!name.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {people.map((person) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`person-chip ${getPersonBgLight(person.colorIndex)} ${getPersonText(person.colorIndex)} border ${getPersonBg(person.colorIndex).replace('bg-', 'border-')}/30`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${getPersonBg(person.colorIndex)}`} />
              {person.name}
              <button
                onClick={() => removePerson(person.id)}
                className="ml-1 hover:opacity-70 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PeopleManager;
