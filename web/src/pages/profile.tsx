import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { User, Mail, Calendar, Edit2, Camera, Trash2, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get('/users/profile');
      return response.data;
    },
    enabled: !!token,
  });

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const response = await apiClient.get('/users/streak');
      return response.data.streak;
    },
    enabled: !!token,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put('/users/profile', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Update failed');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete('/users/profile');
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
      logout();
      router.push('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Delete failed');
    },
  });

  if (!token) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone and all your journal entries will be permanently deleted.'
      )
    ) {
      deleteAccountMutation.mutate();
    }
  };

  const achievements = [
    { name: 'First Entry', icon: '🎉', unlocked: true },
    { name: '7 Day Streak', icon: '🔥', unlocked: (streakData?.currentStreak || 0) >= 7 },
    { name: '30 Day Streak', icon: '⭐', unlocked: (streakData?.currentStreak || 0) >= 30 },
    { name: '100 Entries', icon: '💯', unlocked: (profileData?.stats?.totalEntries || 0) >= 100 },
  ];

  return (
    <>
      <Head>
        <title>Profile - Echo</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-8">
            Your Profile
          </h1>

          {/* Profile Card */}
          <div className="bg-background-secondary rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  {profileData?.profileImageUrl ? (
                    <img
                      src={profileData.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white hover:bg-primary-dark transition">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) =>
                          setFormData({ ...formData, displayName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-background transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-text-primary">
                        {profileData?.displayName || user?.displayName || 'User'}
                      </h2>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </div>
                    <div className="space-y-2 text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{profileData?.email || user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Joined{' '}
                          {profileData?.createdAt
                            ? formatDistanceToNow(new Date(profileData.createdAt), {
                                addSuffix: true,
                              })
                            : 'recently'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-background-secondary rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {profileData?.stats?.totalEntries || 0}
              </div>
              <div className="text-text-secondary">Total Entries</div>
            </div>
            <div className="bg-background-secondary rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-success mb-2">
                {streakData?.currentStreak || 0}
              </div>
              <div className="text-text-secondary">Current Streak</div>
            </div>
            <div className="bg-background-secondary rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary-dark mb-2">
                {streakData?.longestStreak || 0}
              </div>
              <div className="text-text-secondary">Longest Streak</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-background-secondary rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-text-primary">Achievements</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg text-center transition ${
                    achievement.unlocked
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-background border-2 border-border opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="text-sm font-medium text-text-primary">
                    {achievement.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-background-secondary rounded-xl shadow-lg p-6 border-2 border-error/20">
            <h2 className="text-xl font-bold text-error mb-4">Danger Zone</h2>
            <p className="text-text-secondary mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
