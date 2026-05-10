import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User, MapPin, Users, ChevronRight, LogOut, Download,
  Shield, Bell, BellOff, HelpCircle, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomAuth } from '@/lib/CustomAuthContext';
import InstallAppSheet from '@/components/pwa/InstallAppSheet';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { toast } from 'sonner';

export default function Profile() {
  const { user, logout } = useCustomAuth();
  const navigate = useNavigate();
  const [showInstallSheet, setShowInstallSheet] = useState(false);
  const { subscribed, loading: pushLoading, subscribe, unsubscribe } = usePushSubscription(user?.email, user?.role);

  const handleTogglePush = async () => {
    try {
      if (subscribed) {
        await unsubscribe();
        toast.success('Notifications disabled.');
      } else {
        await subscribe();
        toast.success('🔔 Notifications enabled!');
      }
    } catch (e) {
      toast.error(e.message || 'Failed to update notification settings.');
    }
  };

  const menuItems = [
    { icon: Users, label: 'Family Members', path: '/family', color: 'text-primary' },
    { icon: MapPin, label: 'Saved Addresses', path: '/addresses', color: 'text-primary' },
    { icon: Bell, label: 'Notifications', path: '/notifications', color: 'text-accent' },
    { icon: Shield, label: 'Privacy & Security', path: '/privacy', color: 'text-emerald-600' },
    { icon: Download, label: 'Install App', path: '#install', color: 'text-blue-600' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help', color: 'text-muted-foreground' },
  ];

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">Profile</h1>

      {/* User Info */}
      <Card className="p-4 mb-6 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base">{user?.full_name || 'User'}</h2>
          <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-primary">
          Edit
        </Button>
      </Card>

      {/* Menu */}
      <Card className="mb-6 divide-y divide-border">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors"
            onClick={item.path === '#install' ? (e) => {
              e.preventDefault();
              setShowInstallSheet(true);
            } : undefined}
          >
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </Card>

      {/* Push Notifications Toggle */}
      {'Notification' in window && (
        <Card className="mb-4">
          <button
            onClick={handleTogglePush}
            disabled={pushLoading}
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/50 transition-colors"
          >
            {pushLoading
              ? <Loader2 className="w-5 h-5 animate-spin text-primary" />
              : subscribed
                ? <Bell className="w-5 h-5 text-primary" />
                : <BellOff className="w-5 h-5 text-muted-foreground" />}
            <span className="flex-1 text-sm font-medium text-left">
              {subscribed ? 'Notifications Enabled' : 'Enable Notifications'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subscribed ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
              {subscribed ? 'ON' : 'OFF'}
            </span>
          </button>
        </Card>
      )}

      {/* Admin/Staff/Doctor portals */}
      {user?.role === 'admin' && (
        <Card className="mb-4">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50"
          >
            <Shield className="w-5 h-5 text-primary" />
            <span className="flex-1 text-sm font-semibold text-primary">Admin Dashboard</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </Card>
      )}



      <Button
        variant="ghost"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 gap-2"
        onClick={logout}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>

      <InstallAppSheet open={showInstallSheet} onClose={() => setShowInstallSheet(false)} />
    </div>
  );
}