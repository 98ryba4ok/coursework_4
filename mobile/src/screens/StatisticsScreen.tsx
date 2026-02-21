import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { calculatorAPI } from '../services/api';
import { Statistics, SeverityLevel } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - 32;

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; icon: string; range: string }> = {
  no_stroke: { label: 'Нет инсульта', icon: 'shield-check', color: '#10B981', range: '0' },
  minor: { label: 'Малый инсульт', icon: 'shield-alert-outline', color: '#3B82F6', range: '1–4' },
  moderate: { label: 'Умеренный', icon: 'alert-circle', color: '#F59E0B', range: '5–15' },
  moderate_severe: { label: 'Умеренно тяжёлый', icon: 'alert-octagon', color: '#F97316', range: '16–20' },
  severe: { label: 'Тяжёлый', icon: 'skull-crossbones', color: '#EF4444', range: '21–42' },
};

const SEVERITY_ORDER: SeverityLevel[] = ['no_stroke', 'minor', 'moderate', 'moderate_severe', 'severe'];

export default function StatisticsScreen() {
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    calculatorAPI.statistics()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 156, 249, ${opacity})`,
    labelColor: () => colors.textSecondary,
    propsForDots: { r: '5', strokeWidth: '2', stroke: colors.primary },
    propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '' },
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!stats || stats.total_count === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Статистика</Text>
        </View>
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="chart-box-outline" size={52} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Данных пока нет</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Статистика появится после первой оценки
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const recentLabels = stats.recent_scores.slice().reverse().map((s) => s.date);
  const recentValues = stats.recent_scores.slice().reverse().map((s) => s.score);

  const distData = SEVERITY_ORDER.map((s) => stats.severity_distribution[s] ?? 0);
  const distMax = Math.max(...distData, 1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={24} color={colors.primary} />
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Статистика</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {stats.total_count} оценок выполнено
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Сводные карточки */}
        <View style={styles.summaryRow}>
          <SummaryCard
            icon="counter"
            label="Всего оценок"
            value={String(stats.total_count)}
            color={colors.primary}
            colors={colors}
          />
          <SummaryCard
            icon="chart-line"
            label="Средний балл"
            value={stats.average_score !== null ? String(stats.average_score) : '—'}
            color={colors.secondary}
            colors={colors}
          />
        </View>

        {/* График тренда */}
        {recentValues.length > 1 && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.chartHeader}>
              <MaterialCommunityIcons name="chart-line" size={18} color={colors.primary} />
              <Text style={[styles.chartTitle, { color: colors.text }]}>Динамика баллов NIHSS</Text>
            </View>
            <LineChart
              data={{ labels: recentLabels, datasets: [{ data: recentValues }] }}
              width={CHART_W - 32}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines
              withOuterLines={false}
              withShadow={false}
            />
            <Text style={[styles.chartNote, { color: colors.placeholder }]}>
              * Последние {recentValues.length} оценок, порядок хронологический
            </Text>
          </View>
        )}

        {/* Распределение по степени тяжести */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="chart-bar" size={18} color={colors.accent} />
            <Text style={[styles.chartTitle, { color: colors.text }]}>Распределение по тяжести</Text>
          </View>

          {SEVERITY_ORDER.map((sev) => {
            const cfg = SEVERITY_CONFIG[sev];
            const count = stats.severity_distribution[sev] ?? 0;
            const pct = distMax > 0 ? (count / distMax) : 0;

            return (
              <View key={sev} style={styles.distItem}>
                <View style={styles.distLeft}>
                  <MaterialCommunityIcons name={cfg.icon as any} size={16} color={cfg.color} />
                  <View>
                    <Text style={[styles.distLabel, { color: colors.text }]}>{cfg.label}</Text>
                    <Text style={[styles.distRange, { color: colors.placeholder }]}>{cfg.range} баллов</Text>
                  </View>
                </View>
                <View style={styles.distRight}>
                  <View style={[styles.distBarBg, { backgroundColor: colors.surfaceVariant }]}>
                    <View style={[styles.distBarFill, { width: `${pct * 100}%`, backgroundColor: cfg.color }]} />
                  </View>
                  <Text style={[styles.distCount, { color: cfg.color }]}>{count}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Шкала интерпретации */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="information-outline" size={18} color={colors.secondary} />
            <Text style={[styles.chartTitle, { color: colors.text }]}>Шкала интерпретации NIHSS</Text>
          </View>

          {SEVERITY_ORDER.map((sev) => {
            const cfg = SEVERITY_CONFIG[sev];
            return (
              <View key={sev} style={[styles.scaleRow, { borderColor: colors.border }]}>
                <View style={[styles.scaleDot, { backgroundColor: cfg.color }]} />
                <View style={[styles.scaleRangeBadge, { backgroundColor: cfg.color + '20' }]}>
                  <Text style={[styles.scaleRangeText, { color: cfg.color }]}>{cfg.range}</Text>
                </View>
                <Text style={[styles.scaleDesc, { color: colors.text }]}>{cfg.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ icon, label, value, color, colors }: any) {
  return (
    <View style={[summaryStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[summaryStyles.iconWrap, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[summaryStyles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[summaryStyles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
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
  content: { padding: 16, gap: 12 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  chartCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartTitle: { fontSize: 15, fontWeight: '700' },
  chart: { borderRadius: 12, marginLeft: -8 },
  chartNote: { fontSize: 11, fontStyle: 'italic' },
  distItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  distLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 150 },
  distLabel: { fontSize: 13, fontWeight: '600' },
  distRange: { fontSize: 11 },
  distRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  distBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  distBarFill: { height: '100%', borderRadius: 4 },
  distCount: { fontSize: 14, fontWeight: '700', width: 24, textAlign: 'right' },
  scaleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1,
  },
  scaleDot: { width: 10, height: 10, borderRadius: 5 },
  scaleRangeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  scaleRangeText: { fontSize: 12, fontWeight: '700' },
  scaleDesc: { flex: 1, fontSize: 13 },
});

const summaryStyles = StyleSheet.create({
  card: {
    flex: 1, borderRadius: 18, borderWidth: 1,
    padding: 16, alignItems: 'center', gap: 8,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  value: { fontSize: 32, fontWeight: '900' },
  label: { fontSize: 12, textAlign: 'center' },
});
