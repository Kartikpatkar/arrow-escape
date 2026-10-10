/**
 * Arrow Escape — Bottom Banner Ad Component
 * Adaptive AdMob banner placeholder with Remove Ads shortcut.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BannerAdProps {
  adsRemoved?: boolean;
  onRemoveAdsPress?: () => void;
}

export const BannerAd: React.FC<BannerAdProps> = ({
  adsRemoved = false,
  onRemoveAdsPress,
}) => {
  if (adsRemoved) {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.adBadgeContainer}>
        <Text style={styles.adBadgeText}>Ad</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.adHeadline} numberOfLines={1}>
          Escape Room & Logic Puzzles — Play Now
        </Text>
        <Text style={styles.adSubtext} numberOfLines={1}>
          Google AdMob Test Partner • 4.9 ★★★★★
        </Text>
      </View>

      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => {
          if (onRemoveAdsPress) {
            onRemoveAdsPress();
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaButtonText}>Remove Ads</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    maxWidth: 520,
    height: 52,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    alignSelf: 'center',
    zIndex: 10,
  },
  adBadgeContainer: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  adBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  adHeadline: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  adSubtext: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  ctaButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ctaButtonText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '700',
  },
});
