import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: Props) => {
  const { firebaseUser, appUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!firebaseUser) return <Navigate to="/login" replace />;

  if (!appUser) return <Navigate to="/login" replace />;

  if (appUser.status === 'pending' && !requireAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">অনুমোদনের অপেক্ষায়</h2>
          <p className="text-muted-foreground">আপনার অ্যাকাউন্ট এখনো অনুমোদিত হয়নি। অনুগ্রহ করে অপেক্ষা করুন।</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && appUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
