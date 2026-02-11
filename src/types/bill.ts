export interface BillItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string | null; // person id or null
  splitAmongEveryone: boolean;
}

export interface Person {
  id: string;
  name: string;
  colorIndex: number; // 1-8
}

export interface PersonSummary {
  person: Person;
  individualItems: { name: string; price: number }[];
  sharedItems: { name: string; fullPrice: number; share: number }[];
  total: number;
}
