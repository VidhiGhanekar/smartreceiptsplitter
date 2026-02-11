import React, { useState, useCallback, useMemo } from 'react';
import { createWorker } from 'tesseract.js';
import { BillItem, Person } from '@/types/bill';
import { generateId, parseReceiptText, calculateSummaries, formatCurrency } from '@/lib/bill-utils';
import ReceiptUpload from '@/components/ReceiptUpload';
import PeopleManager from '@/components/PeopleManager';
import ItemList from '@/components/ItemList';
import ItemAssignment from '@/components/ItemAssignment';
import SplitSummary from '@/components/SplitSummary';
import { Scissors } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const [items, setItems] = useState<BillItem[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const handleImageReady = useCallback(async (file: File) => {
    setOcrLoading(true);
    setOcrProgress(0);
    try {
      const worker = await createWorker('eng', undefined, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const parsed = parseReceiptText(text);
      if (parsed.length > 0) {
        const newItems: BillItem[] = parsed.map(p => ({
          id: generateId(),
          name: p.name,
          price: p.price,
          assignedTo: null,
          splitAmongEveryone: false,
        }));
        setItems(prev => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  }, []);

  const summaries = useMemo(
    () => calculateSummaries(items, people),
    [items, people]
  );

  const grandTotal = useMemo(
    () => items.reduce((s, i) => s + i.price, 0),
    [items]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display leading-tight">SplitSnap</h1>
            <p className="text-xs text-muted-foreground">Snap. Split. Settle.</p>
          </div>
          {grandTotal > 0 && (
            <span className="ml-auto text-sm font-semibold text-primary tabular-nums">
              Total: {formatCurrency(grandTotal)}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8 pb-20">
        {/* OCR progress */}
        {ocrLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Scanning receipt...</span>
              <span>{ocrProgress}%</span>
            </div>
            <Progress value={ocrProgress} className="h-2" />
          </div>
        )}

        {/* Step 1: Receipt + People side by side on desktop */}
        <div className="grid gap-6 md:grid-cols-2">
          <ReceiptUpload onImageReady={handleImageReady} />
          <PeopleManager people={people} onPeopleChange={setPeople} />
        </div>

        {/* Step 2: Items */}
        <ItemList items={items} onItemsChange={setItems} ocrLoading={ocrLoading} />

        {/* Step 3: Assignment */}
        <ItemAssignment items={items} people={people} onItemsChange={setItems} />

        {/* Step 4: Summary */}
        <SplitSummary summaries={summaries} grandTotal={grandTotal} />
      </main>
    </div>
  );
};

export default Index;
