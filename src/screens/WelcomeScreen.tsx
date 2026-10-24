import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  StatusBar,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  onGetStarted?: () => void;
};

// Ijezie's corrected layout (2026-10-24): standard RN, top hero + gradient
// fade, no page dots. Hero art = cinematic TV-room scene; neon play logo.
const POSTER = require('../assets/img/welcome_hero.png');
const LOGO = require('../assets/img/logo_splash.png');

export default function WelcomeScreen({ onGetStarted }: Props) {
  const nav = useNavigation<any>();
  const { width, height } = useWindowDimensions();

  const compact = height < 740;
  const posterHeight = Math.min(height * 0.44, 390);

  const features = [
    {
      icon: 'movie-open-play-outline',
      label: 'Thousands\nof Movies & Shows',
    },
    {
      icon: 'devices',
      label: 'Watch on\nAny Device',
    },
    {
      icon: 'lightning-bolt-circle',
      label: 'High Quality\nStreaming',
    },
    {
      icon: 'heart-outline',
      label: 'Personalized\nJust for You',
    },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* EXISTING CINEMATIC MOVIE POSTER */}
        <View style={[styles.posterContainer, { height: posterHeight }]}>
          <ImageBackground
            source={POSTER}
            style={styles.poster}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                'rgba(3,5,26,0)',
                'rgba(3,5,26,0.08)',
                'rgba(3,5,26,0.55)',
                '#03051A',
              ]}
              locations={[0, 0.5, 0.8, 1]}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              }}
            />
          </ImageBackground>
        </View>

        {/* STREAMMAX BRANDING */}
        <View style={styles.brandSection}>
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="StreamMax logo"
          />

          <View style={styles.titleRow}>
            <Text style={styles.titleWhite}>Stream</Text>

            <LinearGradient
              colors={['#06D6F5', '#2875FF', '#A020F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientText}
            >
              <Text style={styles.titleGradient}>Max</Text>
            </LinearGradient>
          </View>

          <Text style={styles.tagline}>
            Your Movies. Your Way.
          </Text>

          <Text style={styles.description}>
            Discover, stream and enjoy the best movies, TV shows and more
            {' — '}all in one place.
          </Text>
        </View>

        {/* FOUR FEATURE ITEMS */}
        <View
          style={[
            styles.featuresRow,
            { width: width - 24 },
            compact && styles.compactFeatures,
          ]}
        >
          {features.map((feature, index) => (
            <View key={feature.label} style={styles.feature}>
              {index !== 0 && <View style={styles.separator} />}

              <Icon
                name={feature.icon}
                size={compact ? 28 : 32}
                color={index % 2 === 0 ? '#168BFF' : '#962DFF'}
              />

              <Text style={styles.featureText}>
                {feature.label}
              </Text>
            </View>
          ))}
        </View>

        {/* GET STARTED BUTTON */}
        <View style={styles.bottomSection}>
          <Pressable
            onPress={onGetStarted ?? (() => nav.navigate('CreateAccount'))}
            accessibilityRole="button"
            accessibilityLabel="Get Started"
            style={({ pressed }) => [
              styles.buttonWrapper,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={['#971BFA', '#6031FF', '#086CFF']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                Get Started
              </Text>

              <Ionicons
                name="arrow-forward"
                size={25}
                color="#FFFFFF"
              />
            </LinearGradient>
          </Pressable>
        </View>

        {/* No page indicators or dots at the bottom */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#03051A',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },

  posterContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#03051A',
  },

  poster: {
    width: '100%',
    height: '100%',
  },

  brandSection: {
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: -2,
  },

  logo: {
    width: 76,
    height: 76,
    marginBottom: 4,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleWhite: {
    color: '#FFFFFF',
    fontSize: 43,
    fontWeight: '800',
    letterSpacing: -1.8,
  },

  gradientText: {
    borderRadius: 3,
  },

  titleGradient: {
    color: '#39C8FF',
    fontSize: 43,
    fontWeight: '800',
    letterSpacing: -1.8,
  },

  tagline: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },

  description: {
    color: '#C6CDDF',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 25,
    maxWidth: 440,
  },

  featuresRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 35,
    marginBottom: 30,
  },

  compactFeatures: {
    marginTop: 23,
    marginBottom: 20,
  },

  feature: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 2,
    position: 'relative',
  },

  separator: {
    position: 'absolute',
    left: 0,
    top: 3,
    height: 77,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(148,163,184,0.25)',
  },

  featureText: {
    color: '#E5E7F0',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
  },

  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 10,
    paddingHorizontal: 24,
  },

  buttonWrapper: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  button: {
    minHeight: 62,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    paddingHorizontal: 20,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
});
