import { useState } from 'react';
import { useCourses, useVideos } from '@/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const VideoManagement = () => {
  const { courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState('');
  const { videos, loading, addVideo, updateVideo, deleteVideo } = useVideos(selectedCourse);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const resetForm = () => {
    setTitle(''); setVideoUrl(''); setPdfUrl(''); setThumbnailUrl('');
    setEditingVideo(null);
  };

  const handleSubmit = async () => {
    if (!title || !videoUrl || !selectedCourse) {
      toast({ title: 'ত্রুটি', description: 'টাইটেল ও ভিডিও URL আবশ্যক', variant: 'destructive' });
      return;
    }

    if (editingVideo) {
      await updateVideo(editingVideo, { title, videoUrl, pdfUrl, thumbnailUrl });
      toast({ title: 'ভিডিও আপডেট হয়েছে' });
    } else {
      await addVideo({ courseId: selectedCourse, title, videoUrl, pdfUrl, thumbnailUrl });
      toast({ title: 'ভিডিও যুক্ত হয়েছে' });
    }
    resetForm();
    setDialogOpen(false);
  };

  const handleEdit = (video: any) => {
    setTitle(video.title);
    setVideoUrl(video.videoUrl);
    setPdfUrl(video.pdfUrl);
    setThumbnailUrl(video.thumbnailUrl);
    setEditingVideo(video.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই ভিডিও মুছে ফেলতে চান?')) return;
    await deleteVideo(id);
    toast({ title: 'ভিডিও মুছে ফেলা হয়েছে' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">ভিডিও ম্যানেজমেন্ট</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-64"><SelectValue placeholder="কোর্স সিলেক্ট করুন" /></SelectTrigger>
          <SelectContent>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.courseName}</SelectItem>)}
          </SelectContent>
        </Select>

        {selectedCourse && (
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus size={18} /> ভিডিও যুক্ত করুন</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVideo ? 'ভিডিও এডিট' : 'নতুন ভিডিও যুক্ত করুন'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>ভিডিও টাইটেল</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div><Label>ভিডিও URL (YouTube Embed)</Label><Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." /></div>
                <div><Label>PDF URL</Label><Input value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://drive.google.com/..." /></div>
                <div><Label>থাম্বনেইল URL</Label><Input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://..." /></div>
                <Button onClick={handleSubmit} className="w-full">{editingVideo ? 'আপডেট করুন' : 'যুক্ত করুন'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedCourse ? (
        <p className="text-center text-muted-foreground py-8">একটি কোর্স সিলেক্ট করুন</p>
      ) : loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-3">
          {videos.map(video => (
            <div key={video.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
              {video.thumbnailUrl && (
                <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-14 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{video.title}</p>
                <p className="text-xs text-muted-foreground truncate">{video.videoUrl}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(video)}><Pencil size={16} /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(video.id)}><Trash2 size={16} className="text-destructive" /></Button>
              </div>
            </div>
          ))}
          {videos.length === 0 && <p className="text-center text-muted-foreground py-8">কোনো ভিডিও নেই</p>}
        </div>
      )}
    </div>
  );
};

export default VideoManagement;
