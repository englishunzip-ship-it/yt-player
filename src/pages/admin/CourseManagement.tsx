import { useState } from 'react';
import { useCourses } from '@/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const CourseManagement = () => {
  const { courses, loading, addCourse, updateCourse, deleteCourse } = useCourses();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addCourse(newName.trim());
    setNewName('');
    toast({ title: 'কোর্স যুক্ত হয়েছে' });
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await updateCourse(id, editName.trim());
    setEditingId(null);
    toast({ title: 'কোর্স আপডেট হয়েছে' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই কোর্স মুছে ফেলতে চান?')) return;
    await deleteCourse(id);
    toast({ title: 'কোর্স মুছে ফেলা হয়েছে' });
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">কোর্স ম্যানেজমেন্ট</h1>

      <div className="flex gap-2 mb-6">
        <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="নতুন কোর্সের নাম" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <Button onClick={handleAdd}><Plus size={18} /> যুক্ত করুন</Button>
      </div>

      <div className="space-y-2">
        {courses.map(course => (
          <div key={course.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            {editingId === course.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUpdate(course.id)} />
                <Button size="sm" onClick={() => handleUpdate(course.id)}><Check size={16} /></Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X size={16} /></Button>
              </div>
            ) : (
              <>
                <span className="font-medium text-foreground">{course.courseName}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingId(course.id); setEditName(course.courseName); }}>
                    <Pencil size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(course.id)}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
        {courses.length === 0 && <p className="text-center text-muted-foreground py-8">কোনো কোর্স নেই</p>}
      </div>
    </div>
  );
};

export default CourseManagement;
