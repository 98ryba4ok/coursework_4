import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode } from '../types';

const SEVERITY_SCALE = [
  { score: '0', label: 'Нет признаков инсульта', color: '#10B981' },
  { score: '1–4', label: 'Малый инсульт', color: '#3B82F6' },
  { score: '5–15', label: 'Умеренный инсульт', color: '#F59E0B' },
  { score: '16–20', label: 'Умеренно тяжёлый инсульт', color: '#F97316' },
  { score: '21–42', label: 'Тяжёлый инсульт', color: '#EF4444' },
];

const NIHSS_DOMAINS = [
  { number: '1a-в', title: 'Уровень сознания', max: 7 },
  { number: '2', title: 'Взор', max: 2 },
  { number: '3', title: 'Поля зрения', max: 3 },
  { number: '4', title: 'Лицевой паралич', max: 3 },
  { number: '5a-б', title: 'Двигательные функции рук', max: 8 },
  { number: '6a-б', title: 'Двигательные функции ног', max: 8 },
  { number: '7', title: 'Атаксия конечностей', max: 2 },
  { number: '8', title: 'Чувствительность', max: 2 },
  { number: '9', title: 'Речь / Афазия', max: 3 },
  { number: '10', title: 'Дизартрия', max: 2 },
  { number: '11', title: 'Угасание и невнимательность', max: 2 },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, themeMode, setThemeMode } = useTheme();
  const [showDomains, setShowDomains] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Выйти из аккаунта?',
      'Все несохранённые данные будут потеряны.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: logout },
      ]
    );
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : '';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Профиль пользователя */}
        <LinearGradient
          colors={['#0D1B35', '#112040', '#0A2040']}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Аватар */}
          <View style={[styles.avatarRing, { borderColor: colors.primary + '60' }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '30' }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
            </View>
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>{user?.full_name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>

          <View style={[styles.memberBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '30' }]}>
            <MaterialCommunityIcons name="calendar-check-outline" size={13} color={colors.primary} />
            <Text style={[styles.memberText, { color: colors.primary }]}>
              В системе с {memberSince}
            </Text>
          </View>
        </LinearGradient>

        {/* Тема оформления */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.accent + '22' }]}>
              <MaterialCommunityIcons name="palette-outline" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Тема оформления</Text>
          </View>

          <SegmentedButtons
            value={themeMode}
            onValueChange={(v) => setThemeMode(v as ThemeMode)}
            buttons={[
              {
                value: 'dark',
                label: 'Тёмная',
                icon: 'weather-night',
                style: themeMode === 'dark' ? { backgroundColor: colors.primary + '22' } : undefined,
              },
              {
                value: 'light',
                label: 'Светлая',
                icon: 'white-balance-sunny',
                style: themeMode === 'light' ? { backgroundColor: colors.primary + '22' } : undefined,
              },
              {
                value: 'system',
                label: 'Система',
                icon: 'theme-light-dark',
                style: themeMode === 'system' ? { backgroundColor: colors.primary + '22' } : undefined,
              },
            ]}
            style={{ borderColor: colors.border }}
            theme={{ colors: { secondaryContainer: colors.primary + '22', onSecondaryContainer: colors.primary } }}
          />
        </View>

        {/* Шкала NIHSS — справочник */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.secondary + '22' }]}>
              <MaterialCommunityIcons name="information-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Шкала NIHSS</Text>
          </View>

          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Шкала инсульта NIH (NIHSS) — стандартизированный инструмент для количественной оценки
            неврологического дефицита при инсульте. Максимальный балл — 42.
          </Text>

          {/* Степени тяжести */}
          {SEVERITY_SCALE.map((s) => (
            <View key={s.score} style={[styles.scaleItem, { borderColor: colors.border }]}>
              <View style={[styles.scorePill, { backgroundColor: s.color + '22', borderColor: s.color + '44' }]}>
                <Text style={[styles.scorePillText, { color: s.color }]}>{s.score}</Text>
              </View>
              <Text style={[styles.scaleLabel, { color: colors.text }]}>{s.label}</Text>
            </View>
          ))}

          {/* Домены */}
          <TouchableOpacity
            onPress={() => setShowDomains((v) => !v)}
            style={[styles.toggleDomains, { borderColor: colors.border }]}
          >
            <Text style={[styles.toggleDomainsText, { color: colors.primary }]}>
              {showDomains ? 'Скрыть домены' : 'Показать все домены шкалы'}
            </Text>
            <MaterialCommunityIcons
              name={showDomains ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>

          {showDomains && NIHSS_DOMAINS.map((d) => (
            <View key={d.number} style={[styles.domainRow, { borderColor: colors.border }]}>
              <View style={[styles.domainNum, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>
                <Text style={[styles.domainNumText, { color: colors.primary }]}>{d.number}</Text>
              </View>
              <Text style={[styles.domainTitle, { color: colors.text }]}>{d.title}</Text>
              <Text style={[styles.domainMax, { color: colors.textSecondary }]}>max {d.max}</Text>
            </View>
          ))}
        </View>

        {/* О приложении */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.no_stroke + '22' }]}>
              <MaterialCommunityIcons name="brain" size={20} color={colors.no_stroke} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>О приложении</Text>
          </View>

          {[
            { icon: 'tag-outline', label: 'Версия', value: '1.0.0' },
            { icon: 'hospital-building', label: 'Стандарт', value: 'NIHSS (NIH Stroke Scale)' },
            { icon: 'shield-check-outline', label: 'Назначение', value: 'Только для профессиональных медицинских целей' },
          ].map((row) => (
            <View key={row.label} style={[styles.infoRow, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name={row.icon as any} size={16} color={colors.textSecondary} />
              <Text style={[styles.infoRowLabel, { color: colors.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.infoRowValue, { color: colors.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Выход */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          icon="logout"
          style={[styles.logoutBtn, { borderColor: colors.severe + '60' }]}
          labelStyle={{ color: colors.severe, fontWeight: '700' }}
        >
          Выйти из аккаунта
        </Button>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12 },
  profileCard: {
    borderRadius: 24, padding: 24, alignItems: 'center', gap: 6,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '900', letterSpacing: 2 },
  userName: { fontSize: 22, fontWeight: '800' },
  userEmail: { fontSize: 14 },
  memberBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, marginTop: 4,
  },
  memberText: { fontSize: 12, fontWeight: '600' },
  section: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  infoText: { fontSize: 13, lineHeight: 19 },
  scaleItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 6, borderBottomWidth: 1,
  },
  scorePill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, minWidth: 56, alignItems: 'center',
  },
  scorePillText: { fontSize: 13, fontWeight: '700' },
  scaleLabel: { fontSize: 13, flex: 1 },
  toggleDomains: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, paddingVertical: 10, borderTopWidth: 1, marginTop: 4,
  },
  toggleDomainsText: { fontSize: 14, fontWeight: '600' },
  domainRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 6, borderBottomWidth: 1,
  },
  domainNum: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1,
  },
  domainNumText: { fontSize: 11, fontWeight: '700' },
  domainTitle: { flex: 1, fontSize: 13 },
  domainMax: { fontSize: 12 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1,
  },
  infoRowLabel: { fontSize: 13, width: 90 },
  infoRowValue: { flex: 1, fontSize: 13, fontWeight: '500' },
  logoutBtn: { borderRadius: 16 },
});
