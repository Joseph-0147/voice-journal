import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import SoundscapeVisualizer from '../components/SoundscapeVisualizer';
import AIService from '../services/AIService';

const PostRecordingScreen = ({ route, navigation }) => {
  const { audioPath, duration, timestamp } = route.params;
  
  // State
  const [tagline, setTagline] = useState('A moment of clarity');
  const [isEditingTagline, setIsEditingTagline] = useState(false);
  const [selectedGradient, setSelectedGradient] = useState('default');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [insights, setInsights] = useState(null);
  const [transcript, setTranscript] = useState('');
  
  // Refs
  const soundscapeRef = useRef();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Process audio with AI
    processAudio();
  }, []);

  const processAudio = async () => {
    try {
      setIsProcessing(true);
      
      const result = await AIService.processJournalEntry(audioPath);
      
      if (result.success) {
        setTranscript(result.transcript);
        setInsights(result.analysis);
      } else {
        Alert.alert('Processing Error', 'Could not analyze your entry. Please try again.');
      }
    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert('Error', 'An error occurred while processing your entry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTagline = () => {
    if (tagline.length > 40) {
      Alert.alert('Too Long', 'Please keep your tagline under 40 characters.');
      return;
    }
    setIsEditingTagline(false);
  };

  const handleThemeChange = (gradientName) => {
    setSelectedGradient(gradientName);
    setShowThemePicker(false);
  };

  const handleShare = async () => {
    try {
      // Capture the soundscape as an image
      const uri = await captureRef(soundscapeRef, {
        format: 'png',
        quality: 1,
      });

      await Share.open({
        url: uri,
        message: `${tagline} - Echo Journal Entry`,
      });
    } catch (error) {
      console.error('Share error:', error);
      if (error.message !== 'User did not share') {
        Alert.alert('Share Failed', 'Could not share your soundscape.');
      }
    }
  };

  const handleSaveEntry = async () => {
    try {
      // TODO: Save to backend/database
      const entryData = {
        audioPath,
        duration,
        timestamp,
        tagline,
        gradient: selectedGradient,
        transcript,
        insights,
      };

      // Show success feedback
      Alert.alert(
        'Saved!',
        'Your journal entry has been saved.',
        [
          {
            text: 'View Insights',
            onPress: () => navigation.navigate('Insights'),
          },
          {
            text: 'Done',
            onPress: () => navigation.navigate('Home'),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Could not save your entry.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Delete audio file
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const renderQuickInsights = () => {
    if (isProcessing) {
      return (
        <View style={styles.insightsPanel}>
          <Text style={styles.insightsHeader}>📝 Processing...</Text>
          <Text style={styles.processingText}>Analyzing your journal entry...</Text>
        </View>
      );
    }

    if (!insights) {
      return null;
    }

    const { actionItems, audioMilestones, sentiment } = insights;

    return (
      <View style={styles.insightsPanel}>
        <Text style={styles.insightsHeader}>📝 Quick Insights</Text>
        
        <View style={styles.insightRow}>
          <Text style={styles.insightIcon}>💡</Text>
          <Text style={styles.insightText}>
            {actionItems.length} Action Item{actionItems.length !== 1 ? 's' : ''} Found
          </Text>
        </View>

        <View style={styles.insightRow}>
          <Text style={styles.insightIcon}>🎯</Text>
          <Text style={styles.insightText}>
            {audioMilestones.filter(m => m.type === 'goal').length} Goal{audioMilestones.filter(m => m.type === 'goal').length !== 1 ? 's' : ''} Mentioned
          </Text>
        </View>

        <View style={styles.insightRow}>
          <Text style={styles.insightIcon}>{getSentimentEmoji(sentiment.overall)}</Text>
          <Text style={styles.insightText}>
            {sentiment.emotionalTone}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.viewFullButton}
          onPress={() => navigation.navigate('Insights', { highlight: timestamp })}
        >
          <Text style={styles.viewFullButtonText}>View Full Analysis →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      case 'neutral': return '😐';
      case 'mixed': return '🤔';
      default: return '😊';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.moreButton}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Date/Time Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>
          {new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={styles.timeText}>
          {new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {/* Soundscape Card */}
      <Animated.View
        ref={soundscapeRef}
        style={[styles.soundscapeContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <LinearGradient
          colors={colors.gradients[selectedGradient]}
          style={styles.soundscapeCard}
        >
          <SoundscapeVisualizer audioPath={audioPath} />
          
          {isEditingTagline ? (
            <TextInput
              style={styles.taglineInput}
              value={tagline}
              onChangeText={setTagline}
              maxLength={40}
              autoFocus
              onBlur={handleSaveTagline}
              onSubmitEditing={handleSaveTagline}
              placeholder="Your tagline..."
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
          ) : (
            <View style={styles.taglineContainer}>
              <Text style={styles.tagline}>{tagline}</Text>
              <TouchableOpacity onPress={() => setIsEditingTagline(true)}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowThemePicker(true)}
        >
          <Text style={styles.actionButtonIcon}>🎨</Text>
          <Text style={styles.actionButtonText}>Themes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSaveEntry}>
          <Text style={styles.actionButtonIcon}>💾</Text>
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionButtonIcon}>📤</Text>
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Insights Panel */}
      {renderQuickInsights()}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
          <Text style={styles.saveButtonText}>✅ Save Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Theme Picker Modal */}
      <Modal
        visible={showThemePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowThemePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Theme</Text>
            <ScrollView style={styles.themeGrid}>
              {Object.keys(colors.gradients).map((gradientName) => (
                <TouchableOpacity
                  key={gradientName}
                  onPress={() => handleThemeChange(gradientName)}
                  style={styles.themeOption}
                >
                  <LinearGradient
                    colors={colors.gradients[gradientName]}
                    style={styles.themePreview}
                  >
                    {selectedGradient === gradientName && (
                      <Text style={styles.selectedCheck}>✓</Text>
                    )}
                  </LinearGradient>
                  <Text style={styles.themeName}>
                    {gradientName.charAt(0).toUpperCase() + gradientName.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowThemePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: 28,
    color: colors.textPrimary,
  },
  moreButton: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  dateHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.l,
  },
  dateText: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  timeText: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  soundscapeContainer: {
    marginHorizontal: spacing.xl,
    ...shadows.heavy,
  },
  soundscapeCard: {
    height: 300,
    borderRadius: borderRadius.xlarge,
    padding: spacing.xxl,
    justifyContent: 'space-between',
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
  },
  tagline: {
    fontSize: typography.sizes.h3,
    fontStyle: 'italic',
    color: colors.background,
    textAlign: 'center',
    fontFamily: typography.fontFamily.serif,
  },
  taglineInput: {
    fontSize: typography.sizes.h3,
    fontStyle: 'italic',
    color: colors.background,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    paddingVertical: spacing.s,
  },
  editIcon: {
    fontSize: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButtonIcon: {
    fontSize: 24,
  },
  actionButtonText: {
    fontSize: typography.sizes.body,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  insightsPanel: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightsHeader: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.m,
  },
  processingText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginBottom: spacing.m,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightText: {
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
  },
  viewFullButton: {
    marginTop: spacing.m,
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewFullButtonText: {
    fontSize: typography.sizes.body,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing.m,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  deleteButton: {
    flex: 1,
    height: 50,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: typography.sizes.body,
    color: colors.error,
    fontWeight: typography.weights.medium,
  },
  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  saveButtonText: {
    fontSize: typography.sizes.body,
    color: colors.background,
    fontWeight: typography.weights.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xlarge,
    borderTopRightRadius: borderRadius.xlarge,
    padding: spacing.xxl,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  themeGrid: {
    marginBottom: spacing.xl,
  },
  themeOption: {
    marginBottom: spacing.l,
  },
  themePreview: {
    height: 80,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  selectedCheck: {
    fontSize: 32,
    color: colors.background,
  },
  themeName: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: typography.sizes.body,
    color: colors.background,
    fontWeight: typography.weights.semiBold,
  },
});

export default PostRecordingScreen;
