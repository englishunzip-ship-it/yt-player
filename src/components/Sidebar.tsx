import { BookOpen, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useFirestore';

const Sidebar = () => {
  const location = useLocation();
  const { appUser, logout } = useAuth();
  const { settings } = useSettings();

  return (
    <aside className="hidden lg:flex flex-col w-52 fixed left-0 top-14 bottom-0 bg-sidebar border-r border-sidebar-border">
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-1">
          <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'sidebar-link-active' : ''}`}>
            <BookOpen size={20} /><span className="text-sm">ভিডিও</span>
          </Link>
        </div>

        {settings?.socialLinks && settings.socialLinks.length > 0 && (
          <>
            <div className="border-t border-sidebar-border mx-3 my-2" />
            <div className="p-3 space-y-1">
              <p className="text-xs text-muted-foreground px-4 mb-2 font-medium">যোগাযোগ</p>
              {settings.socialLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="sidebar-link">
                  <span className="text-sm">{link.label}</span>
                </a>
              ))}
            </div>
          </>
        )}

        {settings?.phoneNumber && (
          <>
            <div className="border-t border-sidebar-border mx-3 my-2" />
            <div className="p-3">
              <p className="text-xs text-muted-foreground px-4 mb-1 font-medium">ফোন</p>
              <p className="text-sm px-4">{settings.phoneNumber}</p>
            </div>
          </>
        )}
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <button onClick={logout} className="sidebar-link w-full">
          <LogOut size={20} /><span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
