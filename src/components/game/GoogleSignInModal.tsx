/**
 * Arrow Escape — Google Play Games Account Sign-In / Selector Modal
 * Prompts user to select or connect their Google account, synchronizing
 * achievements, XP badges, and cloud save data.
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GoogleAccountOption,
  playGamesService,
} from '../../services/playgames/playGamesService';

interface GoogleSignInModalProps {
  visible: boolean;
  onSignedIn: () => void;
  onClose: () => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  visible,
  onSignedIn,
  onClose,
}) => {
  const accounts = playGamesService.getAvailableAccounts();
  const [selectedId, setSelectedId] = useState<string>(accounts[0]?.id || 'g_account_1');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');

  if (!visible) return null;

  const handleSelectAccount = (acc: GoogleAccountOption) => {
    setSelectedId(acc.id);
    setIsCustomMode(false);
  };

  const handleConfirmSignIn = () => {
    if (isCustomMode) {
      const email = customEmail.trim() || 'player@gmail.com';
      const name = customName.trim() || email.split('@')[0] || 'Google Player';
      playGamesService.signInWithAccount({
        displayName: name,
        email,
        avatarUrl: '🎮',
      });
    } else {
      const chosen = accounts.find(a => a.id === selectedId) || accounts[0];
      playGamesService.signInWithAccount({
        displayName: chosen.displayName,
        email: chosen.email,
        avatarUrl: chosen.avatarIcon,
      });
    }
    onSignedIn();
  };

  const handlePlayOffline = () => {
    playGamesService.setPromptedSignIn();
    onClose();
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        {/* Play Games Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.googleIconCircle}>
              <Text style={styles.googleIcon}>🎮</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>Google Play Games</Text>
              <Text style={styles.brandSubtitle}>Choose an account for Arrow Escape</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Sync Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>☁️</Text>
          <Text style={styles.infoText}>
            Sign in to sync your level achievements, XP ranks, and cloud save across devices.
          </Text>
        </View>

        {/* Account List */}
        <ScrollView style={styles.accountList} showsVerticalScrollIndicator={false}>
          {accounts.map(acc => {
            const isSelected = !isCustomMode && selectedId === acc.id;
            return (
              <TouchableOpacity
                key={acc.id}
                style={[
                  styles.accountTile,
                  isSelected && styles.accountTileSelected,
                ]}
                onPress={() => handleSelectAccount(acc)}
                activeOpacity={0.8}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{acc.avatarIcon}</Text>
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{acc.displayName}</Text>
                  <Text style={styles.accountEmail}>{acc.email}</Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add / Custom Account */}
          <TouchableOpacity
            style={[
              styles.accountTile,
              isCustomMode && styles.accountTileSelected,
            ]}
            onPress={() => setIsCustomMode(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.avatarCircle, { backgroundColor: 'rgba(52, 211, 153, 0.2)' }]}>
              <Text style={styles.avatarText}>➕</Text>
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>Use Another Google Account</Text>
              <Text style={styles.accountEmail}>Enter your Google ID or GamerTag</Text>
            </View>
            <View
              style={[
                styles.radioCircle,
                isCustomMode && styles.radioCircleSelected,
              ]}
            >
              {isCustomMode && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Custom Account Inputs */}
          {isCustomMode && (
            <View style={styles.customInputBox}>
              <Text style={styles.inputLabel}>GamerTag / Display Name:</Text>
              <TextInput
                style={styles.textInput}
                value={customName}
                onChangeText={setCustomName}
                placeholder="e.g. MasterArcher"
                placeholderTextColor="#64748B"
              />
              <Text style={[styles.inputLabel, { marginTop: 8 }]}>Google Email:</Text>
              <TextInput
                style={styles.textInput}
                value={customEmail}
                onChangeText={setCustomEmail}
                placeholder="e.g. player@gmail.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleConfirmSignIn}
            activeOpacity={0.85}
          >
            <Text style={styles.signInButtonText}>Sign In & Sync Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={handlePlayOffline}
            activeOpacity={0.7}
          >
            <Text style={styles.guestButtonText}>Play Offline (Skip)</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: 'rgba(5, 10, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  googleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
    lineHeight: 15,
  },
  accountList: {
    maxHeight: 250,
    marginBottom: 16,
  },
  accountTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  accountTileSelected: {
    backgroundColor: 'rgba(15, 118, 110, 0.25)',
    borderColor: '#2DD4BF',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  accountEmail: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2DD4BF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2DD4BF',
  },
  customInputBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actions: {
    gap: 8,
  },
  signInButton: {
    backgroundColor: '#0F766E',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2DD4BF',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  guestButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
});
