import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import VideoGrid from '@/components/VideoGrid';
import { useAuth } from '@/contexts/AuthContext';
import { useVideos } from '@/hooks/useFirestore';

const Index = () => {
  const { appUser } = useAuth();
  const courseId = appUser?.selectedCourseId || '';
  const { videos, loading } = useVideos(courseId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="pt-14 lg:pl-52">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-muted-foreground">এখনো কোনো ভিডিও যুক্ত করা হয়নি</p>
          </div>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </main>
    </div>
  );
};

export default Index;
