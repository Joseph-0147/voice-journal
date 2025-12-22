import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, BarChart3, Settings, User, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/entries', icon: BookOpen, label: 'Entries' },
  { href: '/insights', icon: BarChart3, label: 'Insights' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 bg-background-secondary border-r border-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Echo</h1>
        <p className="text-sm text-text-secondary">Audio Journal</p>
      </div>

      <nav className="px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
