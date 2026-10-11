/**
 * PermissionsSetupModal Component
 * First-launch onboarding modal requesting notification, haptic, and audio permissions.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Modal } from 'react-native';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ColorTheme } from '../../theme/colors';

interface PermissionsSetupModalProps {
  visible: boolean;
  theme: ColorTheme;
  initialSound: boolean;
  initialHaptics: boolean;
  onComplete: (settings: { soundEnabled: boolean; hapticsEnabled: boolean; notificationsEnabled: boolean }) => void;
}

export const PermissionsSetupModal: React.FC<PermissionsSetupModalProps> = ({
  visible,
  theme,
  initialSound,
  initialHaptics,
  onComplete,
}) => {
  const [sound, setSound] = useState(initialSound);
  const [haptics, setHaptics] = useState(initialHaptics);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [isRequestingNotif, setIsRequestingNotif] = useState(false);

  const handleRequestNotifications = async () => {
    setIsRequestingNotif(true);
    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        setNotificationsGranted(true);
      }
    } catch {
      // ignore
    } finally {
      setIsRequestingNotif(false);
    }
  };

  const handleFinish = () => {
    onComplete({
      soundEnabled: sound,
      hapticsEnabled: haptics,
      notificationsEnabled: notificationsGranted,
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.boardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: theme.surfaceElevated || 'rgba(255,255,255,0.1)' }]}>
              <Text style={styles.badgeIcon}>🏹</Text>
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome to Arrow Escape!</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Customize your puzzle experience before jumping in:
            </Text>
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {/* Notification Permission Item */}
            <View style={[styles.optionRow, { borderBottomColor: theme.boardBorder }]}>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>🔔 Daily Challenge Reminder</Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                  {notificationsGranted ? '✓ Notification permission granted!' : 'Receive daily alerts for fresh puzzles'}
                </Text>
              </View>
              {notificationsGranted ? (
                <Text style={styles.grantedBadge}>Active ✓</Text>
              ) : (
                <TouchableOpacity
                  style={[styles.allowBtn, { backgroundColor: theme.accent }]}
                  onPress={handleRequestNotifications}
                  disabled={isRequestingNotif}
                  activeOpacity={0.8}
                >
                  <Text style={styles.allowBtnText}>{isRequestingNotif ? '...' : 'Allow'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Haptics Option */}
            <View style={[styles.optionRow, { borderBottomColor: theme.boardBorder }]}>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>📳 Tactile Haptics</Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                  Feel bumps & escape vibrations
                </Text>
              </View>
              <Switch
                value={haptics}
                onValueChange={setHaptics}
                trackColor={{ false: '#CBD5E1', true: theme.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Sound Option */}
            <View style={styles.optionRow}>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>🔊 Sound Effects</Text>
                <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                  Crisp escape pops & fanfare
                </Text>
              </View>
              <Switch
                value={sound}
                onValueChange={setSound}
                trackColor={{ false: '#CBD5E1', true: theme.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: theme.arrowBody }]}
            onPress={handleFinish}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>START PLAYING 🚀</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 99999,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 2,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  optionsList: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionInfo: {
    flex: 1,
    paddingRight: 10,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 11,
    lineHeight: 14,
  },
  allowBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  allowBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  grantedBadge: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 12,
  },
  startBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
