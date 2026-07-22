import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import RecordingCard from '@/components/RecordingCard';
import RecentEntries from '@/components/RecentEntries';
import { Sparkles } from 'lucide-react';
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

          <div className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background-secondary to-success/10 p-6 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  AI Assistant
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Turn your journal into coaching, summaries, and next steps.
                </h2>
                <p className="text-text-secondary">
                  Ask Echo AI to summarize recent entries, spot emotional patterns,
                  or turn today&apos;s notes into clear action items.
                </p>
              </div>

              <Link
                href="/assistant"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:bg-primary-dark"
              >
                Open AI Assistant
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </div>

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
