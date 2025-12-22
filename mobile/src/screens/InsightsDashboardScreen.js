import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const InsightsDashboardScreen = ({ navigation, route }) => {
  const [timeFilter, setTimeFilter] = useState('thisWeek');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [weeklyData, setWeeklyData] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    loadInsightsData();
  }, [timeFilter]);

  const loadInsightsData = async () => {
    // TODO: Load from backend/database
    // Mock data for demonstration
    setWeeklyData({
      entryCount: 5,
      totalMinutes: 23,
      sentiment: 'Mostly Positive',
      streak: 5,
    });

    setActionItems([
      {
        id: '1',
        task: 'Review project proposal',
        completed: false,
        date: 'Nov 25, 3:42 PM',
        priority: 'high',
      },
      {
        id: '2',
        task: 'Call Mom',
        completed: true,
        date: 'Nov 24, 8:20 AM',
        priority: 'medium',
      },
      {
        id: '3',
        task: 'Book dentist appointment',
        completed: false,
        date: 'Nov 23, 7:15 PM',
        priority: 'low',
      },
    ]);

    setMilestones([
      {
        id: '1',
        type: 'insight',
        description: 'Recognizing need for work-life balance',
        excerpt: 'I need to prioritize my mental health over work deadlines',
        date: 'Nov 25, 3:42 PM',
        timestamp: '0:34',
      },
      {
        id: '2',
        type: 'goal',
        description: 'Fitness commitment',
        excerpt: "I'll exercise 3 times per week starting Monday",
        date: 'Nov 24, 8:20 AM',
        timestamp: '1:12',
      },
      {
        id: '3',
        type: 'emotion',
        description: 'Gratitude moment',
        excerpt: "I'm so grateful for my supportive friends",
        date: 'Nov 23, 7:15 PM',
        timestamp: '2:05',
      },
    ]);

    setThemes([
      { name: 'Work', percentage: 45, color: '#007AFF' },
      { name: 'Relationships', percentage: 30, color: '#FF9500' },
      { name: 'Health', percentage: 25, color: '#34C759' },
    ]);
  };

  const toggleActionItem = (id) => {
    setActionItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const renderActionItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.actionItem,
        item.completed && styles.actionItemCompleted,
      ]}
      onPress={() => toggleActionItem(item.id)}
    >
      <View style={styles.actionItemLeft}>
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.actionItemContent}>
          <Text
            style={[
              styles.actionItemText,
              item.completed && styles.actionItemTextCompleted,
            ]}
          >
            {item.task}
          </Text>
          <Text style={styles.actionItemDate}>From: {item.date}</Text>
        </View>
      </View>
      <View style={[styles.priorityBadge, styles[`priority${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}`]]}>
        <Text style={styles.priorityText}>{item.priority}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMilestone = ({ item }) => {
    const getMilestoneColor = () => {
      switch (item.type) {
        case 'insight': return '#FFCC00';
        case 'goal': return '#34C759';
        case 'emotion': return '#FF3B30';
        default: return colors.primary;
      }
    };

    const getMilestoneIcon = () => {
      switch (item.type) {
        case 'insight': return '💡';
        case 'goal': return '🎯';
        case 'emotion': return '❤️';
        default: return '⭐';
      }
    };

    return (
      <TouchableOpacity style={styles.milestoneCard}>
        <View style={[styles.milestoneIcon, { backgroundColor: getMilestoneColor() }]}>
          <Text style={styles.milestoneEmoji}>{getMilestoneIcon()}</Text>
        </View>
        <View style={styles.milestoneContent}>
          <Text style={styles.milestoneDescription}>{item.description}</Text>
          <Text style={styles.milestoneExcerpt} numberOfLines={2}>
            "{item.excerpt}"
          </Text>
          <Text style={styles.milestoneDate}>
            {item.date} • {item.timestamp}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderThemeBar = (theme) => (
    <View key={theme.name} style={styles.themeRow}>
      <Text style={styles.themeName}>{theme.name}</Text>
      <View style={styles.themeBarContainer}>
        <View
          style={[
            styles.themeBar,
            {
              width: `${theme.percentage}%`,
              backgroundColor: theme.color,
            },
          ]}
        />
      </View>
      <Text style={styles.themePercentage}>{theme.percentage}%</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {/* TODO: Show date filter picker */}}
          >
            <Text style={styles.filterButtonText}>📅 This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSearchModal(true)}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly Summary */}
        {weeklyData && (
          <LinearGradient
            colors={[colors.primary, colors.primaryPurple]}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryTitle}>📊 Weekly Summary</Text>
            <View style={styles.summaryStats}>
              <Text style={styles.summaryText}>
                {weeklyData.entryCount} Entries • {weeklyData.totalMinutes} min total
              </Text>
              <Text style={styles.summaryText}>
                😊 {weeklyData.sentiment}
              </Text>
              <Text style={styles.summaryText}>
                🏆 {weeklyData.streak} day streak!
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* Action Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            ✅ Action Items ({actionItems.filter(i => !i.completed).length})
          </Text>
          {actionItems.length > 0 ? (
            <View style={styles.sectionContent}>
              <FlatList
                data={actionItems}
                renderItem={renderActionItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>✓</Text>
              <Text style={styles.emptyStateText}>
                No action items yet. Keep journaling!
              </Text>
            </View>
          )}
        </View>

        {/* Audio Milestones Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>🌟 Audio Milestones</Text>
          {milestones.length > 0 ? (
            <View style={styles.sectionContent}>
              <FlatList
                data={milestones}
                renderItem={renderMilestone}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>⭐</Text>
              <Text style={styles.emptyStateText}>
                Your key moments will appear here
              </Text>
            </View>
          )}
        </View>

        {/* Patterns & Themes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>📈 Patterns & Themes</Text>
          <View style={styles.themesCard}>
            <Text style={styles.themesTitle}>Top Topics This Week:</Text>
            {themes.map(renderThemeBar)}
            <View style={styles.trendContainer}>
              <Text style={styles.trendLabel}>Emotional Trend:</Text>
              <Text style={styles.trendValue}>↗️ Improving</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.searchModal}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchTitle}>Search Entries</Text>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.searchPlaceholder}>
            Search functionality coming soon...
          </Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.m,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  filterButton: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.small,
  },
  filterButtonText: {
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
  },
  searchIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  summaryCard: {
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  summaryTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semiBold,
    color: colors.background,
    marginBottom: spacing.m,
  },
  summaryStats: {
    gap: spacing.s,
  },
  summaryText: {
    fontSize: typography.sizes.body,
    color: colors.background,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.m,
  },
  sectionContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionItemCompleted: {
    backgroundColor: colors.backgroundSecondary,
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.m,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.background,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  actionItemContent: {
    flex: 1,
  },
  actionItemText: {
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  actionItemTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  actionItemDate: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  priorityHigh: {
    backgroundColor: '#FFE5E5',
  },
  priorityMedium: {
    backgroundColor: '#FFF3E0',
  },
  priorityLow: {
    backgroundColor: '#E8F5E9',
  },
  priorityText: {
    fontSize: typography.sizes.label,
    fontWeight: typography.weights.medium,
    textTransform: 'uppercase',
  },
  milestoneCard: {
    flexDirection: 'row',
    padding: spacing.l,
    gap: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneEmoji: {
    fontSize: 20,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneDescription: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  milestoneExcerpt: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  milestoneDate: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  themesCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themesTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.l,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    gap: spacing.m,
  },
  themeName: {
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    width: 100,
  },
  themeBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  themeBar: {
    height: '100%',
    borderRadius: 6,
  },
  themePercentage: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.l,
    paddingTop: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  trendLabel: {
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
  },
  trendValue: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.success,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  emptyStateText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  searchModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  searchPlaceholder: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxl * 2,
  },
});

export default InsightsDashboardScreen;
