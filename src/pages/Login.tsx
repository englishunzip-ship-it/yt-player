import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const paymentMethods = ['bKash', 'Nagad', 'Rocket', 'Bank Transfer'];

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { courses } = useCourses();
  const navigate = useNavigate();

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      toast({ title: 'লগইন ব্যর্থ', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !paymentMethod) {
      toast({ title: 'ত্রুটি', description: 'সকল তথ্য পূরণ করুন', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, selectedCourseId, paymentMethod, paymentNumber, transactionId });
      navigate('/');
    } catch (err: any) {
      toast({ title: 'রেজিস্ট্রেশন ব্যর্থ', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-full mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">HSCianTV</h1>
          <p className="text-muted-foreground mt-1">{isRegister ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'আপনার অ্যাকাউন্টে লগইন করুন'}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>ইমেইল</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" />
              </div>
              <div>
                <Label>পাসওয়ার্ড</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'লগইন হচ্ছে...' : 'লগইন'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label>নাম</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="আপনার নাম" />
              </div>
              <div>
                <Label>ইমেইল</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" />
              </div>
              <div>
                <Label>পাসওয়ার্ড</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="কমপক্ষে ৬ অক্ষর" />
              </div>
              <div>
                <Label>কোর্স সিলেক্ট করুন</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger><SelectValue placeholder="কোর্স বাছাই করুন" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.courseName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>পেমেন্ট মেথড</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue placeholder="পেমেন্ট মেথড বাছাই করুন" /></SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>পেমেন্ট নাম্বার</Label>
                <Input value={paymentNumber} onChange={e => setPaymentNumber(e.target.value)} required placeholder="01XXXXXXXXX" />
              </div>
              <div>
                <Label>ট্রানজেকশন আইডি</Label>
                <Input value={transactionId} onChange={e => setTransactionId(e.target.value)} required placeholder="TrxID" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'রেজিস্ট্রেশন হচ্ছে...' : 'রেজিস্টার করুন'}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-primary hover:underline"
            >
              {isRegister ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
