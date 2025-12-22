import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/router';
import { LogOut, Bell } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-background-secondary border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-sm text-text-secondary">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-background rounded-lg transition">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-error hover:bg-background rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
