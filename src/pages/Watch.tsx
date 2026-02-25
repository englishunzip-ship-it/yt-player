import { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SkipBack, SkipForward, Share2, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import RecommendedVideos from '@/components/RecommendedVideos';
import { useAuth } from '@/contexts/AuthContext';
import { useVideos } from '@/hooks/useFirestore';
import { toast } from '@/hooks/use-toast';

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const courseId = appUser?.selectedCourseId || '';
  const { videos } = useVideos(courseId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const currentVideo = useMemo(() => videos.find((v) => v.id === id), [id, videos]);

  const currentIndex = useMemo(() => videos.findIndex((v) => v.id === id), [videos, id]);

  const handlePrevious = () => {
    if (currentIndex > 0) navigate(`/watch/${videos[currentIndex - 1].id}`);
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) navigate(`/watch/${videos[currentIndex + 1].id}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: currentVideo?.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "লিংক কপি হয়েছে!", description: "ভিডিও লিংক ক্লিপবোর্ডে কপি করা হয়েছে।" });
    }
  };

  const handlePdfOpen = () => {
    if (currentVideo?.pdfUrl) window.open(currentVideo.pdfUrl, '_blank');
  };

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">ভিডিও পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 pt-14 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-shrink-0 p-4 lg:flex-1 lg:overflow-y-auto lg:max-h-[calc(100vh-3.5rem)]">
          <VideoPlayer embedUrl={currentVideo.videoUrl} title={currentVideo.title} />
          <div className="mt-4">
            <h1 className="text-xl font-medium text-foreground">{currentVideo.title}</h1>
            <div className="flex items-center justify-between mt-2">
              <p className="text-muted-foreground text-sm">HSCian</p>
              <div className="flex items-center gap-1 lg:hidden">
                <button onClick={handlePrevious} disabled={currentIndex === 0} className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"><SkipBack size={18} /></button>
                <button onClick={handleNext} disabled={currentIndex === videos.length - 1} className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"><SkipForward size={18} /></button>
                <button onClick={handleShare} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><Share2 size={18} /></button>
                {currentVideo.pdfUrl && (
                  <button onClick={handlePdfOpen} className="flex items-center gap-1 px-2 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-xs font-medium rounded-md">
                    <FileText size={16} /><span>PDF</span>
                  </button>
                )}
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3 mt-4">
              <button onClick={handlePrevious} disabled={currentIndex === 0} className="control-button disabled:opacity-50"><SkipBack size={18} /><span>Previous</span></button>
              <button onClick={handleNext} disabled={currentIndex === videos.length - 1} className="control-button disabled:opacity-50"><span>Next</span><SkipForward size={18} /></button>
              <button onClick={handleShare} className="control-button"><Share2 size={18} /><span>Share</span></button>
              {currentVideo.pdfUrl && (
                <button onClick={handlePdfOpen} className="control-button bg-primary/20 text-primary hover:bg-primary/30"><FileText size={18} /><span>PDF</span></button>
              )}
            </div>
          </div>
        </div>
        <div className="lg:hidden flex-1 overflow-y-auto border-t border-border py-4 min-h-0">
          <RecommendedVideos videos={videos} currentVideoId={currentVideo.id} />
        </div>
        <div className="hidden lg:block lg:w-96 lg:border-l lg:border-border lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto py-4">
          <RecommendedVideos videos={videos} currentVideoId={currentVideo.id} />
        </div>
      </main>
    </div>
  );
};

export default Watch;
