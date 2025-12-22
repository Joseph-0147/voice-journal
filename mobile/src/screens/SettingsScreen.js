import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [reminderEnabled, setReminderEnabled] = React.useState(true);
  const [autoTranscribe, setAutoTranscribe] = React.useState(true);
  const [localStorageOnly, setLocalStorageOnly] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.settingLabel}>Profile</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Change Password</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email Preferences</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Daily Reminder</Text>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Reminder Time</Text>
          <Text style={styles.settingValue}>8:00 PM</Text>
        </TouchableOpacity>
      </View>

      {/* Recording Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recording</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Auto-transcribe</Text>
            <Text style={styles.settingDescription}>
              Automatically transcribe recordings
            </Text>
          </View>
          <Switch
            value={autoTranscribe}
            onValueChange={setAutoTranscribe}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Audio Quality</Text>
          <Text style={styles.settingValue}>High</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={styles.settingLabel}>Local Storage Only</Text>
            <Text style={styles.settingDescription}>
              Keep all data on device
            </Text>
          </View>
          <Switch
            value={localStorageOnly}
            onValueChange={setLocalStorageOnly}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Delete Account</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Help Center</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Terms of Service</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Echo v1.0.0</Text>
        <TouchableOpacity>
          <Text style={styles.logoutButton}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.m,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  settingDescription: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  settingValue: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  settingArrow: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  footerText: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginBottom: spacing.l,
  },
  logoutButton: {
    fontSize: typography.sizes.body,
    color: colors.error,
    fontWeight: typography.weights.semiBold,
  },
});

export default SettingsScreen;
