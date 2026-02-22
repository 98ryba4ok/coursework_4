import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode } from '../types';

const SEVERITY_SCALE = [
  { score: '0',     label: 'Нет признаков инсульта',   color: '#10B981' },
  { score: '1–4',   label: 'Малый инсульт',             color: '#3B82F6' },
  { score: '5–15',  label: 'Умеренный инсульт',         color: '#F59E0B' },
  { score: '16–20', label: 'Умеренно тяжёлый',          color: '#F97316' },
  { score: '21–42', label: 'Тяжёлый инсульт',           color: '#EF4444' },
];

const NIHSS_DOMAINS = [
  { number: '1а-в', title: 'Уровень сознания',           max: 7 },
  { number: '2',    title: 'Взор',                       max: 2 },
  { number: '3',    title: 'Поля зрения',                max: 3 },
  { number: '4',    title: 'Лицевой паралич',            max: 3 },
  { number: '5а-б', title: 'Двигательные функции рук',   max: 8 },
  { number: '6а-б', title: 'Двигательные функции ног',   max: 8 },
  { number: '7',    title: 'Атаксия конечностей',        max: 2 },
  { number: '8',    title: 'Чувствительность',           max: 2 },
  { number: '9',    title: 'Речь / Афазия',              max: 3 },
  { number: '10',   title: 'Дизартрия',                  max: 2 },
  { number: '11',   title: 'Угасание и невнимательность',max: 2 },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, themeMode, setThemeMode } = useTheme();
  const [showDomains, setShowDomains] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
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

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'dark',   label: 'Тёмная',   icon: 'weather-night' },
    { value: 'light',  label: 'Светлая',  icon: 'white-balance-sunny' },
    { value: 'system', label: 'Система',  icon: 'theme-light-dark' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Шапка */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>Профиль</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Карточка пользователя ── */}
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Цветная полоса слева */}
          <View style={[styles.userCardAccent, { backgroundColor: colors.primary }]} />

          <View style={styles.userCardBody}>
            {/* Аватар */}
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            {/* Инфо */}
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user?.full_name}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                {user?.email}
              </Text>
              {memberSince ? (
                <View style={styles.memberRow}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.memberText, { color: colors.textSecondary }]}>
                    с {memberSince}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Тема оформления ── */}
        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>ОФОРМЛЕНИЕ</Text>
          <View style={[styles.groupBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {themeOptions.map((opt, i) => {
              const active = themeMode === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.themeRow,
                    i < themeOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                  onPress={() => setThemeMode(opt.value)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeIconWrap, { backgroundColor: active ? colors.primary + '22' : colors.border + '44' }]}>
                    <MaterialCommunityIcons
                      name={opt.icon as any}
                      size={18}
                      color={active ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <Text style={[styles.themeLabel, { color: active ? colors.text : colors.textSecondary }]}>
                    {opt.label}
                  </Text>
                  <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border }]}>
                    {active && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Шкала NIHSS ── */}
        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>ШКАЛА NIHSS</Text>
          <View style={[styles.groupBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.nihssDesc, { color: colors.textSecondary }]}>
              Стандартизированный инструмент оценки неврологического дефицита при инсульте. Максимум — 42 балла.
            </Text>

            {/* Степени тяжести — горизонтальные плашки */}
            <View style={styles.severityList}>
              {SEVERITY_SCALE.map((s) => (
                <View key={s.score} style={styles.severityRow}>
                  <View style={[styles.severityBar, { backgroundColor: s.color }]} />
                  <View style={[styles.severityScore, { borderColor: s.color + '55' }]}>
                    <Text style={[styles.severityScoreText, { color: s.color }]}>{s.score}</Text>
                  </View>
                  <Text style={[styles.severityLabel, { color: colors.text }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Аккордеон доменов */}
            <TouchableOpacity
              style={[styles.domainsToggle, { borderTopColor: colors.border }]}
              onPress={() => setShowDomains((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={[styles.domainsToggleText, { color: colors.secondary }]}>
                {showDomains ? 'Скрыть домены' : 'Все домены шкалы'}
              </Text>
              <MaterialCommunityIcons
                name={showDomains ? 'chevron-up' : 'chevron-right'}
                size={16}
                color={colors.secondary}
              />
            </TouchableOpacity>

            {showDomains && (
              <View style={[styles.domainsTable, { borderTopColor: colors.border }]}>
                {NIHSS_DOMAINS.map((d, i) => (
                  <View
                    key={d.number}
                    style={[
                      styles.domainRow,
                      { backgroundColor: i % 2 === 0 ? colors.surfaceVariant + '66' : 'transparent' },
                    ]}
                  >
                    <Text style={[styles.domainNum, { color: colors.primary }]}>{d.number}</Text>
                    <Text style={[styles.domainTitle, { color: colors.text }]}>{d.title}</Text>
                    <Text style={[styles.domainMax, { color: colors.textSecondary }]}>{d.max}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ── О приложении ── */}
        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>О ПРИЛОЖЕНИИ</Text>
          <View style={[styles.groupBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { icon: 'tag-outline',         label: 'Версия',      value: '1.0.0' },
              { icon: 'hospital-building',    label: 'Стандарт',    value: 'NIH Stroke Scale' },
              { icon: 'shield-check-outline', label: 'Назначение',  value: 'Медицинский персонал' },
            ].map((row, i, arr) => (
              <View
                key={row.label}
                style={[
                  styles.infoRow,
                  i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <MaterialCommunityIcons name={row.icon as any} size={15} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Выход ── */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.severe + '55' }]}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name="logout-variant" size={18} color={colors.severe} />
          <Text style={[styles.logoutText, { color: colors.severe }]}>Выйти из аккаунта</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  scroll: {
    padding: 16,
    gap: 20,
  },

  /* Карточка пользователя */
  userCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  userCardAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  userCardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  memberText: {
    fontSize: 11,
  },

  /* Группы настроек */
  group: {
    gap: 6,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: 2,
  },
  groupBox: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },

  /* Тема */
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  themeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* NIHSS */
  nihssDesc: {
    fontSize: 13,
    lineHeight: 19,
    padding: 14,
    paddingBottom: 10,
  },
  severityList: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 6,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  severityBar: {
    width: 3,
    height: 28,
    borderRadius: 2,
  },
  severityScore: {
    width: 52,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  severityScoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  severityLabel: {
    fontSize: 13,
    flex: 1,
  },
  domainsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
  },
  domainsToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  domainsTable: {
    borderTopWidth: 1,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  domainNum: {
    fontSize: 11,
    fontWeight: '700',
    width: 40,
  },
  domainTitle: {
    flex: 1,
    fontSize: 13,
  },
  domainMax: {
    fontSize: 12,
  },

  /* О приложении */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    width: 82,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },

  /* Кнопка выхода */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
