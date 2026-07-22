import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

function buildAssistantUrl() {
  const configuredBase = process.env.EXPO_PUBLIC_WEB_APP_URL;

  if (configuredBase) {
    return `${configuredBase.replace(/\/$/, '')}/assistant`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/assistant';
  }

  return 'http://localhost:3000/assistant';
}

const AssistantScreen = () => {
  const [error, setError] = useState('');
  const assistantUrl = useMemo(() => buildAssistantUrl(), []);

  const openInBrowser = async () => {
    try {
      await Linking.openURL(assistantUrl);
    } catch (linkError) {
      setError('Could not open the assistant in your browser.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <Text style={styles.headerSubtitle}>
          The same browser-based Echo AI experience, embedded in the app.
        </Text>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Powered by Puter.js</Text>
        <Text style={styles.bannerText}>
          Ask for summaries, patterns, or next steps using your journal context.
        </Text>
      </View>

      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: assistantUrl }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          onError={() => setError('The assistant could not load inside the app.')}
          renderError={() => (
            <View style={styles.errorState}>
              <Text style={styles.errorTitle}>Assistant unavailable</Text>
              <Text style={styles.errorText}>
                {error || 'The assistant page could not be displayed.'}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={openInBrowser}>
                <Text style={styles.retryButtonText}>Open in browser</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          If you are developing locally, set EXPO_PUBLIC_WEB_APP_URL to your web app URL.
        </Text>
      </View>
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
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.l,
  },
  headerTitle: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  banner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.l,
    padding: spacing.xl,
    borderRadius: borderRadius.large,
    backgroundColor: colors.backgroundSecondary,
    ...shadows.medium,
  },
  bannerTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bannerText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  webviewContainer: {
    flex: 1,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.l,
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
  },
  errorTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  errorText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: colors.background,
    fontWeight: typography.weights.semiBold,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default AssistantScreen;