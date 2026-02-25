import { useState } from 'react';
import { useAllUsers, useCourses } from '@/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const UserManagement = () => {
  const { users, loading, updateUserStatus, updateUserRole, deleteUser } = useAllUsers();
  const { courses } = useCourses();
  const [filterCourse, setFilterCourse] = useState('all');

  const filteredUsers = filterCourse === 'all'
    ? users
    : users.filter(u => u.selectedCourseId === filterCourse);

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.courseName || 'N/A';
  };

  const handleApprove = async (id: string) => {
    await updateUserStatus(id, 'approved');
    toast({ title: 'ইউজার অনুমোদিত হয়েছে' });
  };

  const handleDeactivate = async (id: string) => {
    await updateUserStatus(id, 'pending');
    toast({ title: 'ইউজার ডিএক্টিভ করা হয়েছে' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত?')) return;
    await deleteUser(id);
    toast({ title: 'ইউজার মুছে ফেলা হয়েছে' });
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">ইউজার ম্যানেজমেন্ট ({filteredUsers.length})</h1>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-48"><SelectValue placeholder="কোর্স ফিল্টার" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সকল কোর্স</SelectItem>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.courseName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{user.name}</span>
                  <Badge variant={user.status === 'approved' ? 'default' : 'secondary'}>
                    {user.status === 'approved' ? 'অ্যাক্টিভ' : 'পেন্ডিং'}
                  </Badge>
                  {user.role === 'admin' && <Badge variant="destructive">Admin</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  কোর্স: {getCourseName(user.selectedCourseId)} | {user.paymentMethod}: {user.paymentNumber} | TrxID: {user.transactionId}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {user.status === 'pending' ? (
                  <Button size="sm" onClick={() => handleApprove(user.id)}>অনুমোদন</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleDeactivate(user.id)}>ডিএক্টিভ</Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>মুছুন</Button>
              </div>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">কোনো ইউজার পাওয়া যায়নি</p>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
