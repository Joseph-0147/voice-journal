import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const audioRecorderPlayer = new AudioRecorderPlayer();

const HomeScreen = ({ navigation }) => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [audioPath, setAudioPath] = useState('');
  const [recentEntries, setRecentEntries] = useState([]);
  const [streak, setStreak] = useState(1);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start pulsing animation for record button
    startPulseAnimation();
    
    // Load recent entries and streak from storage/API
    loadRecentEntries();
    loadStreak();

    return () => {
      // Cleanup
      if (isRecording) {
        stopRecording();
      }
    };
  }, []);

  // Pulsing glow animation for record button
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Recording pulse animation (when active)
  const startRecordingPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Request microphone permissions
  const requestMicrophonePermission = async () => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.MICROPHONE,
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      });

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permission Required',
          'Echo needs microphone access to record your journal entries.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    try {
      const path = Platform.select({
        ios: `echo_${Date.now()}.m4a`,
        android: `${RNFS.DocumentDirectoryPath}/echo_${Date.now()}.mp4`,
      });

      const result = await audioRecorderPlayer.startRecorder(path);
      
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordTime(
          audioRecorderPlayer.mmssss(Math.floor(e.currentPosition))
        );
      });

      setAudioPath(result);
      setIsRecording(true);
      startRecordingPulse();
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      
      setIsRecording(false);
      pulseAnim.setValue(1);

      // Navigate to post-recording screen with audio file
      navigation.navigate('PostRecording', {
        audioPath: result,
        duration: recordTime,
        timestamp: new Date().toISOString(),
      });

      setRecordTime('00:00');
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  // Toggle recording state
  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Load recent entries from storage/API
  const loadRecentEntries = async () => {
    // TODO: Implement API call to fetch recent entries
    // Mock data for demonstration
    const mockEntries = [
      {
        id: '1',
        date: 'Nov 24',
        tagline: 'Morning clarity',
        waveformData: [0.3, 0.7, 0.5, 0.8, 0.4, 0.6, 0.9, 0.3],
      },
      {
        id: '2',
        date: 'Nov 23',
        tagline: 'Evening thoughts',
        waveformData: [0.5, 0.4, 0.7, 0.6, 0.8, 0.3, 0.5, 0.7],
      },
    ];
    setRecentEntries(mockEntries);
  };

  // Load streak from storage/API
  const loadStreak = async () => {
    // TODO: Implement API call to fetch streak
    setStreak(1);
  };

  // Render recent entry card
  const renderRecentEntry = ({ item }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => navigation.navigate('PostRecording', { entryId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.entryWaveform}>
        {/* Simple waveform visualization */}
        {item.waveformData.map((height, index) => (
          <View
            key={index}
            style={[
              styles.waveformBar,
              { height: height * 30 },
            ]}
          />
        ))}
      </View>
      <View style={styles.entryInfo}>
        <Text style={styles.entryTagline}>{item.tagline}</Text>
        <Text style={styles.entryDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.headerIcon}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.headerIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.appTitle}>Echo</Text>
        <Text style={styles.appTagline}>Your Social Audio Journal</Text>
      </View>

      {/* Recording Button */}
      <View style={styles.recordingSection}>
        {isRecording && (
          <Text style={styles.recordTimer}>{recordTime}</Text>
        )}
        
        <Animated.View
          style={[
            styles.recordButtonContainer,
            {
              transform: [{ scale: pulseAnim }],
              opacity: glowAnim,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleRecordPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isRecording
                  ? ['#FF3B30', '#FF6B6B']
                  : [colors.softBlue, colors.lavender]
              }
              style={styles.recordButton}
            >
              <Text style={styles.recordIcon}>🎤</Text>
              <Text style={styles.recordLabel}>
                {isRecording ? 'Tap to Stop' : 'Tap to Record'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Recording indicator ring */}
        {isRecording && (
          <Animated.View
            style={[
              styles.recordingRing,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        )}
      </View>

      {/* Streak Display */}
      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>{streak} day streak 🔥</Text>
      </View>

      {/* Recent Soundscapes Section */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionHeader}>Recent Soundscapes</Text>
        <FlatList
          data={recentEntries}
          renderItem={renderRecentEntry}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.entriesList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Start your first journal entry above! 🎙️
              </Text>
            </View>
          }
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.l,
  },
  headerIcon: {
    fontSize: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.serif,
  },
  appTagline: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  recordingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    position: 'relative',
  },
  recordTimer: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.semiBold,
    color: colors.error,
    marginBottom: spacing.l,
  },
  recordButtonContainer: {
    ...shadows.heavy,
  },
  recordButton: {
    width: 180,
    height: 180,
    borderRadius: borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordIcon: {
    fontSize: 48,
    marginBottom: spacing.s,
  },
  recordLabel: {
    fontSize: typography.sizes.body,
    color: colors.background,
    fontWeight: typography.weights.medium,
  },
  recordingRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: borderRadius.circle,
    borderWidth: 3,
    borderColor: colors.error,
  },
  streakContainer: {
    alignItems: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.xl,
  },
  streakText: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.medium,
    color: colors.warning,
  },
  recentSection: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.m,
  },
  entriesList: {
    paddingBottom: spacing.xl,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    padding: spacing.l,
    marginBottom: spacing.m,
    ...shadows.light,
  },
  entryWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    width: 60,
    height: 40,
    marginRight: spacing.l,
  },
  waveformBar: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  entryInfo: {
    flex: 1,
  },
  entryTagline: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  entryDate: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HomeScreen;
