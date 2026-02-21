import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { calculatorAPI } from '../services/api';
import { NIHSSCalculation, SeverityLevel } from '../types';

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; icon: string }> = {
  no_stroke: { label: 'Нет инсульта', icon: 'shield-check', color: '#10B981' },
  minor: { label: 'Малый', icon: 'shield-alert-outline', color: '#3B82F6' },
  moderate: { label: 'Умеренный', icon: 'alert-circle', color: '#F59E0B' },
  moderate_severe: { label: 'Ум. тяжёлый', icon: 'alert-octagon', color: '#F97316' },
  severe: { label: 'Тяжёлый', icon: 'skull-crossbones', color: '#EF4444' },
};

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [records, setRecords] = useState<NIHSSCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await calculatorAPI.list();
      setRecords(data.results);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchHistory(); }, [fetchHistory]));

  const handleDelete = (id: string) => {
    Alert.alert(
      'Удалить запись?',
      'Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await calculatorAPI.delete(id);
              setRecords((prev) => prev.filter((r) => r.id !== id));
            } catch {
              Alert.alert('Ошибка', 'Не удалось удалить запись');
            }
          },
        },
      ]
    );
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: NIHSSCalculation }) => (
    <HistoryCard item={item} colors={colors} onDelete={handleDelete} />
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Шапка */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <MaterialCommunityIcons name="clipboard-text-clock-outline" size={24} color={colors.primary} />
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>История оценок</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {records.length} {records.length === 1 ? 'запись' : records.length < 5 ? 'записи' : 'записей'}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : records.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={52} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет записей</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Выполните первую оценку по шкале NIHSS
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchHistory(); }}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Карточка истории ────────────────────────────────────────────────────────
function HistoryCard({
  item,
  colors,
  onDelete,
}: {
  item: NIHSSCalculation;
  colors: any;
  onDelete: (id: string) => void;
}) {
  const cfg = SEVERITY_CONFIG[item.severity];
  const [showInterpretation, setShowInterpretation] = useState(false);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Верхняя часть */}
      <View style={styles.cardTop}>
        <View style={[styles.severityIcon, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '44' }]}>
          <MaterialCommunityIcons name={cfg.icon as any} size={24} color={cfg.color} />
        </View>

        <View style={styles.cardMain}>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreText, { color: colors.text }]}>{item.total_score}</Text>
            <Text style={[styles.scoreMax, { color: colors.textSecondary }]}> / 42</Text>
            <View style={[styles.severityBadge, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '44' }]}>
              <Text style={[styles.severityBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={[styles.ageText, { color: colors.textSecondary }]}>
            Пациент: {item.patient_age} лет
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={[styles.deleteBtn, { backgroundColor: colors.severe + '18', borderColor: colors.severe + '33' }]}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.severe} />
        </TouchableOpacity>
      </View>

      {/* Прогресс */}
      <View style={[styles.progressWrap, { backgroundColor: colors.surfaceVariant }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${(item.total_score / 42) * 100}%`, backgroundColor: cfg.color },
          ]}
        />
      </View>

      {/* Доменные оценки */}
      <View style={styles.domainsRow}>
        {[
          { label: 'Сознание', value: item.loc + item.loc_questions + item.loc_commands, icon: 'head-flash-outline' },
          { label: 'Движение', value: item.motor_arm_left + item.motor_arm_right + item.motor_leg_left + item.motor_leg_right, icon: 'arm-flex-outline' },
          { label: 'Речь', value: item.best_language + item.dysarthria, icon: 'microphone-outline' },
          { label: 'Зрение', value: item.best_gaze + item.visual, icon: 'eye-outline' },
        ].map((d, i) => (
          <View key={i} style={styles.domainItem}>
            <MaterialCommunityIcons name={d.icon as any} size={13} color={colors.textSecondary} />
            <Text style={[styles.domainValue, { color: d.value > 0 ? colors.primary : colors.textSecondary }]}>
              {d.value}
            </Text>
            <Text style={[styles.domainLabel, { color: colors.placeholder }]}>{d.label}</Text>
          </View>
        ))}
      </View>

      {/* Клиническое заключение */}
      {item.interpretation ? (
        <>
          <TouchableOpacity
            onPress={() => setShowInterpretation((v) => !v)}
            style={[styles.interpretToggle, { borderTopColor: colors.border }]}
          >
            <MaterialCommunityIcons name="file-document-outline" size={15} color={colors.accent} />
            <Text style={[styles.interpretToggleText, { color: colors.accent }]}>
              Интерпретация ИИ
            </Text>
            <MaterialCommunityIcons
              name={showInterpretation ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.accent}
            />
          </TouchableOpacity>
          {showInterpretation && (
            <View style={[styles.interpretBody, { backgroundColor: colors.surfaceVariant, borderTopColor: colors.border }]}>
              <Text style={[styles.interpretText, { color: colors.text }]}>
                {item.interpretation}
              </Text>
            </View>
          )}
        </>
      ) : null}

      {/* Дата/время */}
      <View style={[styles.cardBottom, { borderTopColor: colors.border }]}>
        <MaterialCommunityIcons name="calendar-outline" size={13} color={colors.placeholder} />
        <Text style={[styles.dateText, { color: colors.placeholder }]}>
          {formatDate(item.created_at)} в {formatTime(item.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyIcon: {
    width: 100, height: 100, borderRadius: 28,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  severityIcon: {
    width: 52, height: 52, borderRadius: 14,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  cardMain: { flex: 1, gap: 4 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 },
  scoreText: { fontSize: 30, fontWeight: '900' },
  scoreMax: { fontSize: 14 },
  severityBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  severityBadgeText: { fontSize: 12, fontWeight: '700' },
  ageText: { fontSize: 13 },
  deleteBtn: {
    width: 38, height: 38, borderRadius: 10,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  progressWrap: { height: 4, marginHorizontal: 0 },
  progressFill: { height: '100%', borderRadius: 0 },
  domainsRow: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 0,
  },
  domainItem: { flex: 1, alignItems: 'center', gap: 2 },
  domainValue: { fontSize: 16, fontWeight: '700' },
  domainLabel: { fontSize: 10 },
  cardBottom: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1,
  },
  dateText: { fontSize: 12 },
  interpretToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1,
  },
  interpretToggleText: { flex: 1, fontSize: 13, fontWeight: '600' },
  interpretBody: {
    paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1,
  },
  interpretText: { fontSize: 13, lineHeight: 20 },
});
