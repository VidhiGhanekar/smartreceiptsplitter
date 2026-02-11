import { BillItem, Person, PersonSummary } from '@/types/bill';

export const PERSON_COLORS = [
  'person-1', 'person-2', 'person-3', 'person-4',
  'person-5', 'person-6', 'person-7', 'person-8',
] as const;

export function getPersonBg(colorIndex: number): string {
  const bgs: Record<number, string> = {
    1: 'bg-person-1',
    2: 'bg-person-2',
    3: 'bg-person-3',
    4: 'bg-person-4',
    5: 'bg-person-5',
    6: 'bg-person-6',
    7: 'bg-person-7',
    8: 'bg-person-8',
  };
  return bgs[colorIndex] || 'bg-primary';
}

export function getPersonBgLight(colorIndex: number): string {
  const bgs: Record<number, string> = {
    1: 'bg-person-1/15',
    2: 'bg-person-2/15',
    3: 'bg-person-3/15',
    4: 'bg-person-4/15',
    5: 'bg-person-5/15',
    6: 'bg-person-6/15',
    7: 'bg-person-7/15',
    8: 'bg-person-8/15',
  };
  return bgs[colorIndex] || 'bg-primary/15';
}

export function getPersonText(colorIndex: number): string {
  const texts: Record<number, string> = {
    1: 'text-person-1',
    2: 'text-person-2',
    3: 'text-person-3',
    4: 'text-person-4',
    5: 'text-person-5',
    6: 'text-person-6',
    7: 'text-person-7',
    8: 'text-person-8',
  };
  return texts[colorIndex] || 'text-primary';
}

export function getPersonBorder(colorIndex: number): string {
  const borders: Record<number, string> = {
    1: 'border-person-1/30',
    2: 'border-person-2/30',
    3: 'border-person-3/30',
    4: 'border-person-4/30',
    5: 'border-person-5/30',
    6: 'border-person-6/30',
    7: 'border-person-7/30',
    8: 'border-person-8/30',
  };
  return borders[colorIndex] || 'border-primary/30';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function calculateSummaries(items: BillItem[], people: Person[]): PersonSummary[] {
  return people.map(person => {
    const individualItems = items
      .filter(item => item.assignedTo === person.id && !item.splitAmongEveryone)
      .map(item => ({ name: item.name, price: item.price }));

    const sharedItems = items
      .filter(item => item.splitAmongEveryone)
      .map(item => ({
        name: item.name,
        fullPrice: item.price,
        share: item.price / people.length,
      }));

    const individualTotal = individualItems.reduce((sum, i) => sum + i.price, 0);
    const sharedTotal = sharedItems.reduce((sum, i) => sum + i.share, 0);

    return {
      person,
      individualItems,
      sharedItems,
      total: individualTotal + sharedTotal,
    };
  });
}

export function parseReceiptText(text: string): { name: string; price: number }[] {
  const lines = text.split('\n').filter(l => l.trim());
  const items: { name: string; price: number }[] = [];

  for (const line of lines) {
    // Match patterns like "Item name    $12.99" or "Item name 12.99"
    const match = line.match(/^(.+?)\s+\$?\s*(\d+\.\d{2})\s*$/);
    if (match) {
      const name = match[1].trim();
      const price = parseFloat(match[2]);
      if (name && !isNaN(price) && price > 0) {
        items.push({ name, price });
      }
    }
  }

  return items;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
