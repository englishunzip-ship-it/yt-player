import { Moon, Sun, Download, Share2, LogOut, Shield, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useFirestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { theme, toggleTheme } = useTheme();
  const { isInstalled, installApp } = usePwaInstall();
  const { appUser, logout } = useAuth();
  const { settings } = useSettings();

  const handleShare = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try { await navigator.share({ title: 'HSCianTV', text: 'HSC শিক্ষার্থীদের জন্য ভিডিও লেসন', url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "লিংক কপি হয়েছে!" });
    }
    onClose();
  };

  const handleInstall = async () => {
    await installApp();
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-72 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border flex-shrink-0">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* User info */}
            {appUser && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <User size={20} />
                  <div>
                    <p className="text-sm font-medium">{appUser.name}</p>
                    <p className="text-xs text-muted-foreground">{appUser.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                <span className="text-sm font-medium">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>

            {/* Admin link */}
            {appUser?.role === 'admin' && (
              <Link to="/admin" onClick={onClose} className="sidebar-link">
                <Shield size={20} className="text-primary" />
                <span>Admin Panel</span>
              </Link>
            )}

            <div className="border-t border-border" />

            {/* Social Links from settings */}
            {settings?.socialLinks && settings.socialLinks.length > 0 && (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-4 mb-2 font-medium">Connect with us</p>
                  {settings.socialLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="sidebar-link" onClick={onClose}>
                      <span className="text-sm">{link.label}</span>
                    </a>
                  ))}
                </div>
                <div className="border-t border-border" />
              </>
            )}

            {/* Share & Install & Logout */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground px-4 mb-2 font-medium">App</p>
              <button onClick={handleShare} className="sidebar-link w-full text-left">
                <Share2 size={20} className="text-primary" /><span>Share App</span>
              </button>
              {!isInstalled && (
                <button onClick={handleInstall} className="sidebar-link w-full text-left hover:bg-accent transition-colors">
                  <Download size={20} className="text-primary" /><span>Install App</span>
                </button>
              )}
              <button onClick={handleLogout} className="sidebar-link w-full text-left text-destructive hover:bg-destructive/10">
                <LogOut size={20} /><span>Logout</span>
              </button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
