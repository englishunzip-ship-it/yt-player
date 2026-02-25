import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Users, BookOpen, Video, Settings, Database, ArrowLeft, Menu, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
  { to: '/admin/users', icon: Users, label: 'ইউজার ম্যানেজমেন্ট' },
  { to: '/admin/courses', icon: BookOpen, label: 'কোর্স ম্যানেজমেন্ট' },
  { to: '/admin/videos', icon: Video, label: 'ভিডিও ম্যানেজমেন্ট' },
  { to: '/admin/settings', icon: Settings, label: 'সেটিংস' },
  { to: '/admin/data', icon: Database, label: 'ডেটা ম্যানেজমেন্ট' },
];

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg text-foreground">অ্যাডমিন প্যানেল</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X size={20} /></button>
        </div>
        <ScrollArea className="flex-1 h-[calc(100vh-65px)]">
          <nav className="p-3 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${location.pathname === item.to ? 'sidebar-link-active' : ''}`}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
            <div className="border-t border-border my-3" />
            <Link to="/" className="sidebar-link">
              <ArrowLeft size={20} />
              <span className="text-sm">ফিরে যান</span>
            </Link>
          </nav>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border flex items-center px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2"><Menu size={24} /></button>
          <span className="font-bold ml-2">অ্যাডমিন</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
