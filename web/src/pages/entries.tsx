import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Play, Pause, Trash2, Calendar, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface Entry {
  id: string;
  tagline: string;
  transcript: string;
  duration: number;
  createdAt: string;
  audioUrl: string;
  analysis: any;
}

export default function EntriesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const { data: entriesData, isLoading } = useQuery({
    queryKey: ['allEntries'],
    queryFn: async () => {
      const response = await apiClient.get('/journals?limit=100');
      return response.data.entries || [];
    },
    enabled: !!token,
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      await apiClient.delete(`/journals/${entryId}`);
    },
    onSuccess: () => {
      toast.success('Entry deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['allEntries'] });
      setSelectedEntry(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Delete failed');
    },
  });

  if (!token) return null;

  const handleDelete = (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntryMutation.mutate(entryId);
    }
  };

  const entries: Entry[] = entriesData || [];

  return (
    <>
      <Head>
        <title>Journal Entries - Echo</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Journal Entries
            </h1>
            <p className="text-text-secondary">
              Browse and manage your audio journal history
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-64 rounded-xl" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-background-secondary rounded-xl shadow-lg p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50" />
              <h2 className="text-xl font-bold text-text-primary mb-2">
                No Entries Yet
              </h2>
              <p className="text-text-secondary mb-6">
                Start your journaling journey by recording your first entry
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                Record First Entry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-background-secondary rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-text-primary line-clamp-2">
                        {entry.tagline || 'Untitled Entry'}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {entry.transcript && (
                      <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                        {entry.transcript}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{Math.round(entry.duration)}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(new Date(entry.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayingId(playingId === entry.id ? null : entry.id);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                    >
                      {playingId === entry.id ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Play
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Entry Detail Modal */}
          {selectedEntry && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedEntry(null)}
            >
              <div
                className="bg-background-secondary rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">
                      {selectedEntry.tagline || 'Untitled Entry'}
                    </h2>
                    <button
                      onClick={() => setSelectedEntry(null)}
                      className="p-2 hover:bg-background rounded-lg transition"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Transcript */}
                    {selectedEntry.transcript && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-text-primary">
                            Transcript
                          </h3>
                        </div>
                        <p className="text-text-secondary leading-relaxed">
                          {selectedEntry.transcript}
                        </p>
                      </div>
                    )}

                    {/* Analysis */}
                    {selectedEntry.analysis && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-text-primary">
                            AI Insights
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {selectedEntry.analysis.mood && (
                            <div className="p-3 bg-background rounded-lg">
                              <span className="text-sm font-medium text-text-primary">
                                Mood:{' '}
                              </span>
                              <span className="text-sm text-text-secondary">
                                {selectedEntry.analysis.mood}
                              </span>
                            </div>
                          )}
                          {selectedEntry.analysis.themes && (
                            <div className="p-3 bg-background rounded-lg">
                              <span className="text-sm font-medium text-text-primary">
                                Themes:{' '}
                              </span>
                              <span className="text-sm text-text-secondary">
                                {selectedEntry.analysis.themes.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-6 text-sm text-text-secondary pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{Math.round(selectedEntry.duration)}s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(new Date(selectedEntry.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(selectedEntry.id)}
                      disabled={deleteEntryMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-error text-white rounded-lg hover:bg-error/90 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                      {deleteEntryMutation.isPending ? 'Deleting...' : 'Delete Entry'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
