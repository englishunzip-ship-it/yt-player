import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  };

  const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
  };

  const installApp = async () => {
    // If already installed, show message
    if (isInstalled) {
      toast({
        title: "ইতিমধ্যে ইনস্টল হয়েছে",
        description: "অ্যাপটি আপনার ডিভাইসে ইনস্টল আছে।",
      });
      return;
    }

    // If we have the deferred prompt (Chrome/Edge on Android/Desktop)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setIsInstalled(true);
          toast({
            title: "ইনস্টল সফল!",
            description: "অ্যাপটি আপনার ডিভাইসে ইনস্টল হয়েছে।",
          });
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
      } catch (error) {
        console.error('Install error:', error);
      }
      return;
    }

    // iOS Safari - show manual instructions
    if (isIOS()) {
      toast({
        title: "iOS এ ইনস্টল করুন",
        description: "Safari এ Share বাটনে ট্যাপ করুন, তারপর 'Add to Home Screen' নির্বাচন করুন।",
        duration: 8000,
      });
      return;
    }

    // Android without prompt support - try opening in browser
    if (isAndroid()) {
      toast({
        title: "অ্যাপ ইনস্টল করুন",
        description: "ব্রাউজার মেনু থেকে 'Add to Home Screen' বা 'Install App' নির্বাচন করুন।",
        duration: 8000,
      });
      return;
    }

    // Desktop browsers without prompt support
    toast({
      title: "অ্যাপ ইনস্টল করুন",
      description: "ব্রাউজারের অ্যাড্রেস বারে ইনস্টল আইকনে ক্লিক করুন অথবা মেনু থেকে 'Install App' নির্বাচন করুন।",
      duration: 8000,
    });
  };

  return { isInstallable, isInstalled, installApp };
};
