import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { Settings as SettingsIcon, Bell, Shield, Palette, Mic, HelpCircle, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStoredTheme, setThemeMode, ThemeMode } from '@/lib/theme';

interface SettingsState {
  notifications: {
    dailyReminder: boolean;
    weeklyReport: boolean;
    achievementAlerts: boolean;
  };
  privacy: {
    profileVisibility: 'private' | 'friends' | 'public';
    dataSharing: boolean;
  };
  audio: {
    autoSave: boolean;
    maxDuration: number;
    quality: 'low' | 'medium' | 'high';
  };
  appearance: {
    theme: ThemeMode;
    accentColor: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      dailyReminder: true,
      weeklyReport: true,
      achievementAlerts: true,
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
    },
    audio: {
      autoSave: true,
      maxDuration: 300,
      quality: 'high',
    },
    appearance: {
      theme: 'light',
      accentColor: 'blue',
    },
  });

  useEffect(() => {
    const theme = getStoredTheme();
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme,
      },
    }));
    setThemeMode(theme);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  if (!token) return null;

  const handleToggle = (
    section: 'notifications' | 'privacy' | 'audio',
    key: 'dailyReminder' | 'weeklyReport' | 'achievementAlerts' | 'dataSharing' | 'autoSave'
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !((prev[section] as Record<string, boolean>)[key]),
      },
    }));
    toast.success('Setting updated');
  };

  const handleSelectChange = (
    section: 'privacy' | 'audio' | 'appearance',
    key: 'profileVisibility' | 'maxDuration' | 'quality' | 'theme' | 'accentColor',
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));

    if (section === 'appearance' && key === 'theme') {
      setThemeMode(value as ThemeMode);
    }

    toast.success('Setting updated');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return (
    <>
      <Head>
        <title>Settings - Echo</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-8">Settings</h1>

          {/* Notifications */}
          <div className="bg-background-secondary rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-text-primary">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Daily Reminder</div>
                  <div className="text-sm text-text-secondary">
                    Get reminded to journal every day
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.dailyReminder}
                    onChange={() => handleToggle('notifications', 'dailyReminder')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Weekly Report</div>
                  <div className="text-sm text-text-secondary">
                    Receive weekly insights summary
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.weeklyReport}
                    onChange={() => handleToggle('notifications', 'weeklyReport')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Achievement Alerts</div>
                  <div className="text-sm text-text-secondary">
                    Get notified when you unlock achievements
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.achievementAlerts}
                    onChange={() => handleToggle('notifications', 'achievementAlerts')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-background-secondary rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-text-primary">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-text-primary mb-2">
                  Profile Visibility
                </label>
                <select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) =>
                    handleSelectChange('privacy', 'profileVisibility', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                  <option value="public">Public</option>
                </select>
                <p className="text-sm text-text-secondary mt-1">
                  Control who can see your profile
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Data Sharing</div>
                  <div className="text-sm text-text-secondary">
                    Share anonymized data to improve AI insights
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.dataSharing}
                    onChange={() => handleToggle('privacy', 'dataSharing')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="bg-background-secondary rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Mic className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-text-primary">Audio Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Auto-save Recordings</div>
                  <div className="text-sm text-text-secondary">
                    Automatically save recordings after completion
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.audio.autoSave}
                    onChange={() => handleToggle('audio', 'autoSave')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div>
                <label className="block font-medium text-text-primary mb-2">
                  Recording Quality
                </label>
                <select
                  value={settings.audio.quality}
                  onChange={(e) =>
                    handleSelectChange('audio', 'quality', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="low">Low (Saves storage)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Best quality)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-text-primary mb-2">
                  Max Recording Duration: {settings.audio.maxDuration}s
                </label>
                <input
                  type="range"
                  min="60"
                  max="600"
                  step="30"
                  value={settings.audio.maxDuration}
                  onChange={(e) =>
                    handleSelectChange('audio', 'maxDuration', e.target.value)
                  }
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-background-secondary rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-text-primary">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-text-primary mb-2">Theme</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSelectChange('appearance', 'theme', 'light')}
                    className={`p-4 rounded-lg border-2 transition ${
                      settings.appearance.theme === 'light'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">☀️</div>
                      <div className="font-medium text-text-primary">Light</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSelectChange('appearance', 'theme', 'dark')}
                    className={`p-4 rounded-lg border-2 transition ${
                      settings.appearance.theme === 'dark'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🌙</div>
                      <div className="font-medium text-text-primary">Dark</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-background-secondary rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-text-primary">Help & Support</h2>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 hover:bg-background rounded-lg transition">
                <div className="font-medium text-text-primary">Help Center</div>
                <div className="text-sm text-text-secondary">Browse FAQs and guides</div>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-background rounded-lg transition">
                <div className="font-medium text-text-primary">Contact Support</div>
                <div className="text-sm text-text-secondary">Get help from our team</div>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-background rounded-lg transition">
                <div className="font-medium text-text-primary">Privacy Policy</div>
                <div className="text-sm text-text-secondary">Read our privacy policy</div>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-background rounded-lg transition">
                <div className="font-medium text-text-primary">Terms of Service</div>
                <div className="text-sm text-text-secondary">Read our terms</div>
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-error text-white rounded-lg hover:bg-error/90 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </DashboardLayout>
    </>
  );
}
