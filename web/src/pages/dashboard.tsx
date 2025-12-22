import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import RecordingCard from '@/components/RecordingCard';
import RecentEntries from '@/components/RecentEntries';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <>
      <Head>
        <title>Dashboard - Echo</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-8">
            Record Your Journey
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recording Section */}
            <div className="lg:col-span-2">
              <RecordingCard />
            </div>

            {/* Recent Entries */}
            <div>
              <RecentEntries />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
