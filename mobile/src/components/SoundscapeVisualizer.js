import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const SoundscapeVisualizer = ({ audioPath, barCount = 50 }) => {
  // Create animated values for each bar
  const animatedValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Start continuous flowing animation
    startFlowingAnimation();
  }, []);

  const startFlowingAnimation = () => {
    // Create staggered animations for wave effect
    const animations = animatedValues.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 0.8 + 0.2, // Random height between 0.2 and 1.0
            duration: 1000 + Math.random() * 1000, // Random duration for organic feel
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: Math.random() * 0.4 + 0.1,
            duration: 800 + Math.random() * 800,
            useNativeDriver: true,
          }),
        ])
      );
    });

    // Start all animations with slight delays for wave effect
    animations.forEach((animation, index) => {
      setTimeout(() => {
        animation.start();
      }, index * 50); // 50ms stagger
    });
  };

  // Generate waveform bars
  const renderWaveformBars = () => {
    const barWidth = 4;
    const barSpacing = 3;
    const maxHeight = 120;
    const containerWidth = (barWidth + barSpacing) * barCount;

    return (
      <View style={[styles.container, { width: containerWidth }]}>
        {animatedValues.map((anim, index) => {
          // Interpolate height
          const height = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, maxHeight],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.bar,
                {
                  height,
                  width: barWidth,
                  marginRight: index < barCount - 1 ? barSpacing : 0,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      {renderWaveformBars()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
  },
  bar: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
  },
});

export default SoundscapeVisualizer;
