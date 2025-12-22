import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

const ProfileScreen = ({ navigation }) => {
  // Mock user data - would come from context/API in production
  const user = {
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    profileImage: null,
    joinDate: '2025-01-15',
    stats: {
      totalEntries: 45,
      totalMinutes: 198,
      currentStreak: 5,
      longestStreak: 12,
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.avatarEditButton}>
            <Text style={styles.avatarEditIcon}>📷</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.joinDate}>
          Member since {new Date(user.joinDate).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.stats.totalEntries}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.stats.totalMinutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.stats.longestStreak}</Text>
          <Text style={styles.statLabel}>Longest</Text>
        </View>
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsList}>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>🎉</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>First Entry</Text>
              <Text style={styles.achievementDate}>January 15, 2025</Text>
            </View>
          </View>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>🔥</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>7-Day Streak</Text>
              <Text style={styles.achievementDate}>November 20, 2025</Text>
            </View>
          </View>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>📝</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>10 Entries</Text>
              <Text style={styles.achievementDate}>February 10, 2025</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Premium Section */}
      <View style={styles.premiumBanner}>
        <Text style={styles.premiumIcon}>✨</Text>
        <View style={styles.premiumInfo}>
          <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
          <Text style={styles.premiumDescription}>
            Unlimited entries, advanced analytics, and more
          </Text>
        </View>
        <TouchableOpacity style={styles.premiumButton}>
          <Text style={styles.premiumButtonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: spacing.xxl * 2 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  editButton: {
    fontSize: typography.sizes.body,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.l,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: typography.weights.bold,
    color: colors.background,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditIcon: {
    fontSize: 16,
  },
  displayName: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  joinDate: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.m,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.l,
  },
  achievementsList: {
    gap: spacing.m,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.medium,
    padding: spacing.l,
    gap: spacing.l,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  achievementDate: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  premiumBanner: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  premiumIcon: {
    fontSize: 32,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  premiumDescription: {
    fontSize: typography.sizes.caption,
    color: colors.background,
    opacity: 0.9,
  },
  premiumButton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
  },
  premiumButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.primary,
  },
});

export default ProfileScreen;
