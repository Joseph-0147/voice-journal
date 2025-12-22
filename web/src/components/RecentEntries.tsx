import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Entry {
  id: string;
  tagline: string;
  duration: number;
  createdAt: string;
}

export default function RecentEntries() {
  const { data, isLoading } = useQuery({
    queryKey: ['recentEntries'],
    queryFn: async () => {
      const response = await apiClient.get('/journals?limit=5');
      return response.data.entries;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-background-secondary rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-text-primary mb-4">
          Recent Entries
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const entries = data || [];

  return (
    <div className="bg-background-secondary rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-text-primary mb-4">
        Recent Entries
      </h3>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No entries yet</p>
          <p className="text-sm">Start recording to see your entries here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry: Entry) => (
            <div
              key={entry.id}
              className="p-4 bg-background rounded-lg hover:shadow-md transition cursor-pointer"
            >
              <h4 className="font-semibold text-text-primary mb-2">
                {entry.tagline || 'Untitled Entry'}
              </h4>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
