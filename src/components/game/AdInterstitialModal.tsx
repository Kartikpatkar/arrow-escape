/**
 * AdInterstitialModal Component
 * Full-screen interstitial advertisement with countdown skip timer.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface AdInterstitialModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const AdInterstitialModal: React.FC<AdInterstitialModalProps> = ({
  visible,
  onDismiss,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(3);

  useEffect(() => {
    if (visible) {
      setSecondsRemaining(3);
      const interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <View style={styles.topBar}>
        <Text style={styles.sponsorBadge}>SPONSORED</Text>
        {secondsRemaining > 0 ? (
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>Skip in {secondsRemaining}s</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ Close Ad</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.adContent}>
        <View style={styles.bannerImagePlaceholder}>
          <Text style={styles.bannerIcon}>🏹</Text>
          <Text style={styles.bannerHeadline}>Arrow Escape</Text>
          <Text style={styles.bannerTagline}>Support independent game development!</Text>
        </View>

        <TouchableOpacity onPress={onDismiss} style={styles.learnMoreBtn}>
          <Text style={styles.learnMoreText}>CONTINUE TO NEXT LEVEL ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    zIndex: 1000,
    justifyContent: 'space-between',
    padding: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
  },
  sponsorBadge: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  timerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  closeBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  adContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bannerImagePlaceholder: {
    width: '100%',
    maxWidth: 340,
    height: 240,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 32,
  },
  bannerIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  bannerHeadline: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  bannerTagline: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  learnMoreBtn: {
    width: '100%',
    maxWidth: 340,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  learnMoreText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});
