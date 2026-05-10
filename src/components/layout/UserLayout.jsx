import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import PushOptInBanner from '@/components/notifications/PushOptInBanner';
import { useCustomAuth } from '@/lib/CustomAuthContext';

export default function UserLayout() {
  const { user } = useCustomAuth();
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <main className="pb-nav">
        <Outlet />
      </main>
      <BottomNav />
      <PushOptInBanner user={user} />
    </div>
  );
}