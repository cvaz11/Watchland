import { Crown, Settings } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoggedIn, login, logout } = useUserStore();

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    // In a real app, this would navigate to settings
    console.log('Navigate to settings');
  };

  const handleUpgrade = () => {
    // In a real app, this would navigate to premium upgrade
    console.log('Navigate to premium upgrade');
  };

  if (!isLoggedIn || !user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.title}>Welcome to ChronoLab</Text>
        <Text style={styles.subtitle}>
          Sign in to save your watch collection and identification history.
        </Text>
        <Button
          title="Sign In"
          onPress={handleLogin}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + 20 },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
        <Pressable onPress={handleSettings} style={styles.settingsButton}>
          <Settings size={24} color={Colors.gray[600]} />
        </Pressable>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.watchesSaved}</Text>
          <Text style={styles.statLabel}>Watches Saved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.identificationsCount}</Text>
          <Text style={styles.statLabel}>Identifications</Text>
        </View>
      </View>

      {!user.isPremium && (
        <View style={styles.premiumCard}>
          <View style={styles.premiumContent}>
            <Crown size={24} color={Colors.accent} />
            <View style={styles.premiumTextContainer}>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumDescription}>
                Get unlimited identifications, detailed specs, and price history.
              </Text>
            </View>
          </View>
          <Button
            title="Upgrade"
            onPress={handleUpgrade}
            variant="secondary"
            size="small"
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Edit Profile</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Notification Settings</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Privacy Settings</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Help Center</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Contact Us</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>About ChronoLab</Text>
        </View>
      </View>

      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="outline"
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: Colors.gray[200],
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.gray[300],
    alignSelf: 'center',
  },
  premiumCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
  },
});