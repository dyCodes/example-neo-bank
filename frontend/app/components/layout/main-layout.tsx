import { Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { isAuthenticated } from '~/lib/auth';
import { BottomNav } from '../navigation/bottom-nav';
import { SidebarNav } from '../navigation/sidebar-nav';

export default function MainLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin');
    }
  }, [navigate]);

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

