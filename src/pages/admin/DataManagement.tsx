import { useState } from 'react';
import { exportAllData, importAllData } from '@/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Download, Upload } from 'lucide-react';

const DataManagement = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'ডেটা এক্সপোর্ট সম্পন্ন' });
    } catch (err: any) {
      toast({ title: 'ত্রুটি', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setLoading(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await importAllData(data);
        toast({ title: 'ডেটা ইম্পোর্ট সম্পন্ন' });
      } catch (err: any) {
        toast({ title: 'ত্রুটি', description: err.message, variant: 'destructive' });
      }
      setLoading(false);
    };
    input.click();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">ডেটা ম্যানেজমেন্ট</h1>
      <div className="space-y-4 max-w-md">
        <Button onClick={handleExport} disabled={loading} className="w-full" size="lg">
          <Download size={20} /> সকল ডেটা এক্সপোর্ট করুন
        </Button>
        <Button onClick={handleImport} disabled={loading} variant="outline" className="w-full" size="lg">
          <Upload size={20} /> ডেটা ইম্পোর্ট করুন (.json)
        </Button>
        {loading && <p className="text-center text-muted-foreground">প্রসেসিং হচ্ছে...</p>}
      </div>
    </div>
  );
};

export default DataManagement;
