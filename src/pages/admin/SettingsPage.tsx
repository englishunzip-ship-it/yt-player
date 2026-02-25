import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Save } from 'lucide-react';

const SettingsPage = () => {
  const { settings, loading, updateSettings } = useSettings();
  const [phone, setPhone] = useState('');
  const [links, setLinks] = useState<{ label: string; url: string; icon: string }[]>([]);

  useEffect(() => {
    if (settings) {
      setPhone(settings.phoneNumber || '');
      setLinks(settings.socialLinks || []);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({ phoneNumber: phone, socialLinks: links });
    toast({ title: 'সেটিংস সেভ হয়েছে' });
  };

  const addLink = () => {
    setLinks([...links, { label: '', url: '', icon: 'link' }]);
  };

  const updateLink = (i: number, field: string, value: string) => {
    const updated = [...links];
    (updated[i] as any)[field] = value;
    setLinks(updated);
  };

  const removeLink = (i: number) => {
    setLinks(links.filter((_, idx) => idx !== i));
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">অ্যাপ সেটিংস</h1>

      <div className="space-y-6 max-w-lg">
        <div>
          <Label>ফোন নাম্বার</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880XXXXXXXXXX" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>সোশ্যাল / Connect With Us লিংক</Label>
            <Button size="sm" variant="outline" onClick={addLink}><Plus size={16} /> যুক্ত করুন</Button>
          </div>
          <div className="space-y-3">
            {links.map((link, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} placeholder="লেবেল (যেমন: Facebook)" className="mb-2" />
                  <Input value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} placeholder="URL" />
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeLink(i)}><Trash2 size={16} className="text-destructive" /></Button>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full"><Save size={18} /> সেভ করুন</Button>
      </div>
    </div>
  );
};

export default SettingsPage;
