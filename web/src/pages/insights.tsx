import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { TrendingUp, TrendingDown, Calendar, Target, Brain, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['#6B7FD7', '#9BA3EB', '#4A5DB5', '#10B981', '#EF4444'];

export default function InsightsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const { data: weeklyData, isLoading } = useQuery({
    queryKey: ['weeklyInsights'],
    queryFn: async () => {
      const response = await apiClient.get('/insights/weekly');
      return response.data;
    },
    enabled: !!token,
  });

  const { data: entriesData } = useQuery({
    queryKey: ['entries', selectedPeriod],
    queryFn: async () => {
      const days = selectedPeriod === '7days' ? 7 : selectedPeriod === '30days' ? 30 : 90;
      const response = await apiClient.get(`/journals?limit=${days * 5}`);
      return response.data.entries || [];
    },
    enabled: !!token,
  });

  if (!token) return null;

  // Process data for charts
  const activityData = entriesData
    ? Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = entriesData.filter(
          (e: any) => format(new Date(e.createdAt), 'yyyy-MM-dd') === dateStr
        ).length;
        return {
          date: format(date, 'EEE'),
          entries: count,
        };
      })
    : [];

  const emotionData = weeklyData?.emotionalBreakdown
    ? Object.entries(weeklyData.emotionalBreakdown).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const stats = [
    {
      label: 'Total Entries',
      value: weeklyData?.totalEntries || 0,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Active Streak',
      value: weeklyData?.currentStreak || 0,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: '+2 days',
      trendUp: true,
    },
    {
      label: 'Action Items',
      value: weeklyData?.totalActionItems || 0,
      icon: Target,
      color: 'text-primary-dark',
      bgColor: 'bg-primary-dark/10',
      trend: '8 completed',
      trendUp: true,
    },
    {
      label: 'Total Time',
      value: `${Math.round((weeklyData?.totalDuration || 0) / 60)}m`,
      icon: Clock,
      color: 'text-text-secondary',
      bgColor: 'bg-text-secondary/10',
      trend: 'This week',
      trendUp: false,
    },
  ];

  return (
    <>
      <Head>
        <title>Insights - Echo</title>
      </Head>

      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Your Insights
            </h1>
            <p className="text-text-secondary">
              Track your journaling patterns and emotional trends
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-background-secondary rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        stat.trendUp ? 'text-success' : 'text-text-secondary'
                      }`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Activity Chart */}
            <div className="bg-background-secondary rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text-primary">
                  Weekly Activity
                </h2>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-1 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                </select>
              </div>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="skeleton h-full w-full rounded-lg" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Bar dataKey="entries" fill="#6B7FD7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Emotional Breakdown */}
            <div className="bg-background-secondary rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-text-primary mb-6">
                Emotional Breakdown
              </h2>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="skeleton h-full w-full rounded-lg" />
                </div>
              ) : emotionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={emotionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {emotionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-text-secondary">
                  <div className="text-center">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No emotional data yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Insights */}
          {weeklyData?.themes && weeklyData.themes.length > 0 && (
            <div className="bg-background-secondary rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-4">
                Key Themes This Week
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyData.themes.map((theme: string, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-primary/5 rounded-lg border border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-primary" />
                      <span className="font-medium text-text-primary">
                        {theme}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          {weeklyData?.actionItems && weeklyData.actionItems.length > 0 && (
            <div className="bg-background-secondary rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-text-primary mb-4">
                Suggested Action Items
              </h2>
              <div className="space-y-3">
                {weeklyData.actionItems.slice(0, 5).map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-background rounded-lg hover:shadow-md transition"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      readOnly
                    />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{item.task}</p>
                      {item.context && (
                        <p className="text-sm text-text-secondary mt-1">
                          {item.context}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.priority === 'high'
                          ? 'bg-error/10 text-error'
                          : item.priority === 'medium'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
