import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Text, Button, TextInput, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { calculatorAPI } from '../services/api';
import { NIHSSCalculation, NIHSSScores, SeverityLevel } from '../types';

// ─── Описания всех 15 пунктов NIHSS ─────────────────────────────────────────
const NIHSS_ITEMS: Array<{
  key: keyof NIHSSScores;
  number: string;
  title: string;
  maxScore: number;
  options: string[];
}> = [
  {
    key: 'loc', number: '1a', title: 'Уровень сознания',
    maxScore: 3,
    options: [
      '0 — В сознании, активно реагирует',
      '1 — Не в полном сознании, пробуждается от незначительного раздражителя',
      '2 — Требует повторного раздражения или болевого воздействия',
      '3 — Реагирует только рефлекторно или не реагирует вовсе',
    ],
  },
  {
    key: 'loc_questions', number: '1б', title: 'Ответы на вопросы (месяц, возраст)',
    maxScore: 2,
    options: [
      '0 — Правильно отвечает на оба вопроса',
      '1 — Правильно отвечает на один вопрос',
      '2 — Не отвечает ни на один вопрос',
    ],
  },
  {
    key: 'loc_commands', number: '1в', title: 'Выполнение команд (открыть/закрыть глаза, кулак)',
    maxScore: 2,
    options: [
      '0 — Правильно выполняет обе команды',
      '1 — Правильно выполняет одну команду',
      '2 — Не выполняет ни одной команды',
    ],
  },
  {
    key: 'best_gaze', number: '2', title: 'Взор (движения глаз)',
    maxScore: 2,
    options: [
      '0 — Норма',
      '1 — Частичный парез взора',
      '2 — Тоническое отведение или тотальный парез взора',
    ],
  },
  {
    key: 'visual', number: '3', title: 'Поля зрения',
    maxScore: 3,
    options: [
      '0 — Норма, нет потери зрения',
      '1 — Частичная гемианопия',
      '2 — Полная гемианопия',
      '3 — Двусторонняя гемианопия (слепота)',
    ],
  },
  {
    key: 'facial_palsy', number: '4', title: 'Лицевой паралич',
    maxScore: 3,
    options: [
      '0 — Норма, симметричные движения',
      '1 — Лёгкий паралич (сглаженность НГС, асимметрия при улыбке)',
      '2 — Частичный паралич (полный или почти полный паралич нижней части лица)',
      '3 — Полный паралич (отсутствие движений с одной или обеих сторон)',
    ],
  },
  {
    key: 'motor_arm_left', number: '5а', title: 'Двигательная функция руки — Левая',
    maxScore: 4,
    options: [
      '0 — Нет отклонения (удерживает 90° / 45° 10 секунд)',
      '1 — Отклонение до конца 10 секунд, не касаясь кровати',
      '2 — Есть усилие против гравитации, касается кровати до 10 секунд',
      '3 — Нет усилия против гравитации, рука падает',
      '4 — Нет движений',
    ],
  },
  {
    key: 'motor_arm_right', number: '5б', title: 'Двигательная функция руки — Правая',
    maxScore: 4,
    options: [
      '0 — Нет отклонения (удерживает 90° / 45° 10 секунд)',
      '1 — Отклонение до конца 10 секунд, не касаясь кровати',
      '2 — Есть усилие против гравитации, касается кровати до 10 секунд',
      '3 — Нет усилия против гравитации, рука падает',
      '4 — Нет движений',
    ],
  },
  {
    key: 'motor_leg_left', number: '6а', title: 'Двигательная функция ноги — Левая',
    maxScore: 4,
    options: [
      '0 — Нет отклонения (удерживает 30° 5 секунд)',
      '1 — Отклонение до конца 5 секунд, не касаясь кровати',
      '2 — Есть усилие против гравитации, касается кровати до 5 секунд',
      '3 — Нет усилия против гравитации, нога падает',
      '4 — Нет движений',
    ],
  },
  {
    key: 'motor_leg_right', number: '6б', title: 'Двигательная функция ноги — Правая',
    maxScore: 4,
    options: [
      '0 — Нет отклонения (удерживает 30° 5 секунд)',
      '1 — Отклонение до конца 5 секунд, не касаясь кровати',
      '2 — Есть усилие против гравитации, касается кровати до 5 секунд',
      '3 — Нет усилия против гравитации, нога падает',
      '4 — Нет движений',
    ],
  },
  {
    key: 'limb_ataxia', number: '7', title: 'Атаксия конечностей (пальценосовая/пяточно-коленная пробы)',
    maxScore: 2,
    options: [
      '0 — Отсутствует',
      '1 — Атаксия в одной конечности',
      '2 — Атаксия в двух конечностях',
    ],
  },
  {
    key: 'sensory', number: '8', title: 'Чувствительность',
    maxScore: 2,
    options: [
      '0 — Норма, нет нарушений',
      '1 — Лёгкое или умеренное снижение чувствительности',
      '2 — Тяжёлое или полное нарушение чувствительности',
    ],
  },
  {
    key: 'best_language', number: '9', title: 'Речь / Афазия',
    maxScore: 3,
    options: [
      '0 — Норма, нет афазии',
      '1 — Лёгкая или умеренная афазия',
      '2 — Тяжёлая афазия',
      '3 — Мутизм или глобальная афазия',
    ],
  },
  {
    key: 'dysarthria', number: '10', title: 'Дизартрия',
    maxScore: 2,
    options: [
      '0 — Норма',
      '1 — Лёгкая или умеренная дизартрия',
      '2 — Тяжёлая дизартрия (невнятная или немая речь)',
    ],
  },
  {
    key: 'extinction', number: '11', title: 'Угасание и невнимательность',
    maxScore: 2,
    options: [
      '0 — Нет нарушений',
      '1 — Зрительная, тактильная, слуховая или пространственная невнимательность',
      '2 — Тяжёлая гемиинаттенция или игнорирование более одной модальности',
    ],
  },
];

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; icon: string; gradient: [string, string] }> = {
  no_stroke: { label: 'Нет признаков инсульта', icon: 'shield-check', color: '#10B981', gradient: ['#064E3B', '#065F46'] },
  minor: { label: 'Малый инсульт', icon: 'shield-alert-outline', color: '#3B82F6', gradient: ['#1E3A5F', '#1D4ED8'] },
  moderate: { label: 'Умеренный инсульт', icon: 'alert-circle', color: '#F59E0B', gradient: ['#451A03', '#92400E'] },
  moderate_severe: { label: 'Умеренно тяжёлый', icon: 'alert-octagon', color: '#F97316', gradient: ['#431407', '#9A3412'] },
  severe: { label: 'Тяжёлый инсульт', icon: 'skull-crossbones', color: '#EF4444', gradient: ['#450A0A', '#991B1B'] },
};

const DEFAULT_SCORES: NIHSSScores = {
  loc: 0, loc_questions: 0, loc_commands: 0,
  best_gaze: 0, visual: 0, facial_palsy: 0,
  motor_arm_left: 0, motor_arm_right: 0,
  motor_leg_left: 0, motor_leg_right: 0,
  limb_ataxia: 0, sensory: 0,
  best_language: 0, dysarthria: 0, extinction: 0,
};

export default function CalculatorScreen() {
  const { colors } = useTheme();
  const [patientAge, setPatientAge] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [scores, setScores] = useState<NIHSSScores>({ ...DEFAULT_SCORES });
  const [result, setResult] = useState<NIHSSCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>('1a');

  const totalLocal = Object.values(scores).reduce((s, v) => s + v, 0);
  const scrollRef = useRef<ScrollView>(null);

  const setScore = (key: keyof NIHSSScores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleCalculate = async () => {
    if (!patientAge || isNaN(Number(patientAge))) {
      Alert.alert('Ошибка', 'Укажите корректный возраст пациента');
      return;
    }
    setLoading(true);
    try {
      const { data } = await calculatorAPI.calculate({
        patient_age: Number(patientAge),
        patient_notes: patientNotes,
        ...scores,
      });
      setResult(data);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (e: any) {
      Alert.alert('Ошибка', 'Не удалось выполнить расчёт. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScores({ ...DEFAULT_SCORES });
    setPatientAge('');
    setPatientNotes('');
    setResult(null);
    setExpandedItem('1a');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const getSeverityConfig = (severity: SeverityLevel) => SEVERITY_CONFIG[severity];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Заголовок */}
      <LinearGradient
        colors={['#0D1B35', '#112040']}
        style={styles.topBar}
      >
        <View style={styles.topBarContent}>
          <MaterialCommunityIcons name="brain" size={26} color={colors.primary} />
          <View style={styles.topBarText}>
            <Text style={[styles.topBarTitle, { color: colors.text }]}>Шкала NIHSS</Text>
            <Text style={[styles.topBarSub, { color: colors.textSecondary }]}>Оценка тяжести инсульта</Text>
          </View>
          {/* Текущая сумма */}
          <View style={[styles.scoreBadge, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '55' }]}>
            <Text style={[styles.scoreBadgeNum, { color: colors.primary }]}>{totalLocal}</Text>
            <Text style={[styles.scoreBadgeDen, { color: colors.textSecondary }]}>/42</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Данные пациента */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.secondary + '22' }]}>
              <MaterialCommunityIcons name="account-details-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Данные пациента</Text>
          </View>

          <TextInput
            label="Возраст пациента (лет)"
            value={patientAge}
            onChangeText={setPatientAge}
            mode="outlined"
            keyboardType="numeric"
            left={<TextInput.Icon icon="human" color={colors.textSecondary} />}
            outlineStyle={styles.inputOutline}
            style={[styles.input, { backgroundColor: colors.surfaceVariant }]}
            textColor={colors.text}
            theme={{ colors: { primary: colors.secondary, outline: colors.border } }}
          />

          <TextInput
            label="Примечания (необязательно)"
            value={patientNotes}
            onChangeText={setPatientNotes}
            mode="outlined"
            multiline
            numberOfLines={2}
            left={<TextInput.Icon icon="note-text-outline" color={colors.textSecondary} />}
            outlineStyle={styles.inputOutline}
            style={[styles.input, { backgroundColor: colors.surfaceVariant }]}
            textColor={colors.text}
            theme={{ colors: { primary: colors.secondary, outline: colors.border } }}
          />
        </View>

        {/* Шкала: прогресс */}
        <View style={[styles.progressSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              Текущий счёт
            </Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>
              {totalLocal} / 42 баллов
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(totalLocal / 42) * 100}%`,
                  backgroundColor:
                    totalLocal === 0 ? colors.no_stroke :
                    totalLocal <= 4 ? colors.minor :
                    totalLocal <= 15 ? colors.moderate :
                    totalLocal <= 20 ? colors.moderate_severe :
                    colors.severe,
                },
              ]}
            />
          </View>
          <View style={styles.scaleLabels}>
            {[
              { label: '0', color: colors.no_stroke },
              { label: '4', color: colors.minor },
              { label: '15', color: colors.moderate },
              { label: '20', color: colors.moderate_severe },
              { label: '42', color: colors.severe },
            ].map((s) => (
              <Text key={s.label} style={[styles.scaleLabel, { color: s.color }]}>{s.label}</Text>
            ))}
          </View>
        </View>

        {/* Пункты NIHSS — аккордеон */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.accent + '22' }]}>
              <MaterialCommunityIcons name="format-list-numbered" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Пункты шкалы NIHSS</Text>
          </View>

          {NIHSS_ITEMS.map((item, idx) => {
            const isExpanded = expandedItem === item.key;
            const itemScore = scores[item.key];
            const hasScore = itemScore > 0;

            return (
              <View key={item.key}>
                {idx > 0 && <View style={[styles.separator, { backgroundColor: colors.border }]} />}

                {/* Заголовок пункта */}
                <TouchableOpacity
                  onPress={() => setExpandedItem(isExpanded ? null : item.key)}
                  style={styles.itemHeader}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.itemNumber,
                    {
                      backgroundColor: hasScore ? colors.primary + '22' : colors.surfaceVariant,
                      borderColor: hasScore ? colors.primary : colors.border,
                    }
                  ]}>
                    <Text style={[styles.itemNumberText, { color: hasScore ? colors.primary : colors.textSecondary }]}>
                      {item.number}
                    </Text>
                  </View>

                  <View style={styles.itemTitleWrap}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </View>

                  <View style={[
                    styles.itemScoreBadge,
                    { backgroundColor: hasScore ? colors.primary : colors.surfaceVariant }
                  ]}>
                    <Text style={[styles.itemScoreText, { color: hasScore ? '#fff' : colors.placeholder }]}>
                      {itemScore}
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {/* Варианты ответов */}
                {isExpanded && (
                  <View style={[styles.itemOptions, { backgroundColor: colors.surfaceVariant }]}>
                    {item.options.map((opt, optIdx) => {
                      const isSelected = itemScore === optIdx;
                      const optColor = optIdx === 0 ? colors.no_stroke : optIdx === item.maxScore ? colors.severe : colors.moderate;
                      return (
                        <TouchableOpacity
                          key={optIdx}
                          onPress={() => setScore(item.key, optIdx)}
                          style={[
                            styles.optionRow,
                            isSelected && {
                              backgroundColor: optColor + '18',
                              borderColor: optColor + '60',
                              borderWidth: 1,
                            },
                            !isSelected && { borderColor: 'transparent', borderWidth: 1 },
                          ]}
                          activeOpacity={0.7}
                        >
                          <View style={[
                            styles.optionDot,
                            { borderColor: isSelected ? optColor : colors.border },
                            isSelected && { backgroundColor: optColor },
                          ]}>
                            {isSelected && (
                              <MaterialCommunityIcons name="check" size={12} color="#fff" />
                            )}
                          </View>
                          <Text style={[
                            styles.optionText,
                            { color: isSelected ? colors.text : colors.textSecondary },
                          ]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Кнопки */}
        <View style={styles.buttons}>
          <Button
            mode="contained"
            onPress={handleCalculate}
            loading={loading}
            disabled={loading}
            icon="calculator"
            style={styles.calcBtn}
            contentStyle={styles.calcBtnContent}
            labelStyle={styles.calcBtnLabel}
            buttonColor={colors.primary}
          >
            Рассчитать NIHSS
          </Button>
          <Button
            mode="outlined"
            onPress={handleReset}
            icon="refresh"
            style={[styles.resetBtn, { borderColor: colors.border }]}
            labelStyle={{ color: colors.textSecondary }}
          >
            Сброс
          </Button>
        </View>

        {/* Результат */}
        {result && (
          <ResultCard result={result} colors={colors} />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Карточка результата ──────────────────────────────────────────────────────
function ResultCard({ result, colors }: { result: NIHSSCalculation; colors: any }) {
  const cfg = SEVERITY_CONFIG[result.severity];
  const [showInterpretation, setShowInterpretation] = useState(false);

  return (
    <View style={resultStyles.container}>
      {/* Заголовок результата */}
      <LinearGradient
        colors={cfg.gradient}
        style={resultStyles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[resultStyles.headerIcon, { backgroundColor: cfg.color + '30', borderColor: cfg.color + '50' }]}>
          <MaterialCommunityIcons name={cfg.icon as any} size={36} color={cfg.color} />
        </View>
        <View style={resultStyles.headerText}>
          <Text style={resultStyles.resultLabel}>Результат NIHSS</Text>
          <Text style={[resultStyles.scoreValue, { color: cfg.color }]}>{result.total_score} баллов</Text>
          <Text style={resultStyles.severityLabel}>{cfg.label}</Text>
        </View>
      </LinearGradient>

      {/* Статистика по секциям */}
      <View style={[resultStyles.statsRow, { borderColor: colors.border }]}>
        {[
          {
            label: 'Сознание',
            value: result.loc + result.loc_questions + result.loc_commands,
            max: 7,
            icon: 'head-flash-outline',
          },
          {
            label: 'Движение',
            value: result.motor_arm_left + result.motor_arm_right + result.motor_leg_left + result.motor_leg_right,
            max: 16,
            icon: 'arm-flex-outline',
          },
          {
            label: 'Речь',
            value: result.best_language + result.dysarthria,
            max: 5,
            icon: 'microphone-outline',
          },
          {
            label: 'Зрение',
            value: result.best_gaze + result.visual,
            max: 5,
            icon: 'eye-outline',
          },
        ].map((stat, i) => (
          <View
            key={i}
            style={[
              resultStyles.statItem,
              i < 3 && { borderRightWidth: 1, borderRightColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons name={stat.icon as any} size={18} color={colors.textSecondary} />
            <Text style={[resultStyles.statValue, { color: colors.text }]}>
              {stat.value}/{stat.max}
            </Text>
            <Text style={[resultStyles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Шкала тяжести */}
      <View style={[resultStyles.severityScale, { backgroundColor: colors.surfaceVariant }]}>
        {[
          { label: 'Норма', range: '0', color: colors.no_stroke, key: 'no_stroke' },
          { label: 'Малый', range: '1-4', color: colors.minor, key: 'minor' },
          { label: 'Умерен.', range: '5-15', color: colors.moderate, key: 'moderate' },
          { label: 'Ум.тяж.', range: '16-20', color: colors.moderate_severe, key: 'moderate_severe' },
          { label: 'Тяжёлый', range: '21-42', color: colors.severe, key: 'severe' },
        ].map((s) => (
          <View key={s.key} style={[
            resultStyles.scaleItem,
            result.severity === s.key && { backgroundColor: s.color + '22', borderRadius: 8 },
          ]}>
            <View style={[resultStyles.scaleDot, { backgroundColor: s.color }]} />
            <Text style={[resultStyles.scaleItemLabel, { color: s.color }]}>{s.label}</Text>
            <Text style={[resultStyles.scaleItemRange, { color: colors.placeholder }]}>{s.range}</Text>
          </View>
        ))}
      </View>

      {/* Клиническое заключение */}
      <TouchableOpacity
        onPress={() => setShowInterpretation((v) => !v)}
        style={[resultStyles.interpretToggle, { borderColor: colors.border }]}
      >
        <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.accent} />
        <Text style={[resultStyles.interpretToggleText, { color: colors.accent }]}>
          Клиническое заключение
        </Text>
        <MaterialCommunityIcons
          name={showInterpretation ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.accent}
        />
      </TouchableOpacity>

      {showInterpretation && (
        <View style={[resultStyles.interpretation, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          <Text style={[resultStyles.interpretText, { color: colors.text }]}>
            {result.interpretation}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  topBarContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topBarText: { flex: 1 },
  topBarTitle: { fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  topBarSub: { fontSize: 12, marginTop: 1 },
  scoreBadge: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 4,
    flexDirection: 'row', alignItems: 'baseline', gap: 2,
  },
  scoreBadgeNum: { fontSize: 22, fontWeight: '800' },
  scoreBadgeDen: { fontSize: 12 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  section: {
    borderRadius: 20, borderWidth: 1, padding: 16, gap: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  input: { marginBottom: 0, borderRadius: 12 },
  inputOutline: { borderRadius: 12 },
  progressSection: { borderRadius: 20, borderWidth: 1, padding: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13 },
  progressValue: { fontSize: 13, fontWeight: '700' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleLabel: { fontSize: 11, fontWeight: '600' },
  separator: { height: 1, marginVertical: 2 },
  itemHeader: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10,
  },
  itemNumber: {
    width: 40, height: 40, borderRadius: 10,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  itemNumberText: { fontSize: 13, fontWeight: '700' },
  itemTitleWrap: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  itemScoreBadge: {
    width: 28, height: 28, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  itemScoreText: { fontSize: 14, fontWeight: '700' },
  itemOptions: { borderRadius: 12, padding: 8, marginBottom: 4, gap: 4 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 10,
    borderRadius: 10, gap: 10,
  },
  optionDot: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
  },
  optionText: { flex: 1, fontSize: 13, lineHeight: 17 },
  buttons: { gap: 10 },
  calcBtn: { borderRadius: 16 },
  calcBtnContent: { height: 54 },
  calcBtnLabel: { fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  resetBtn: { borderRadius: 16 },
});

const resultStyles = StyleSheet.create({
  container: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#1E3A5F' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, gap: 16,
  },
  headerIcon: {
    width: 70, height: 70, borderRadius: 20,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  headerText: { flex: 1 },
  resultLabel: { fontSize: 12, color: '#8BA3C7', letterSpacing: 1, textTransform: 'uppercase' },
  scoreValue: { fontSize: 42, fontWeight: '900', lineHeight: 46 },
  severityLabel: { fontSize: 15, color: '#E8EEF8', fontWeight: '600', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1, borderBottomWidth: 1,
    backgroundColor: '#0D1B35',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 4 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 11 },
  severityScale: {
    flexDirection: 'row', padding: 10, gap: 2,
  },
  scaleItem: { flex: 1, alignItems: 'center', paddingVertical: 6, gap: 3 },
  scaleDot: { width: 8, height: 8, borderRadius: 4 },
  scaleItemLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  scaleItemRange: { fontSize: 9, textAlign: 'center' },
  interpretToggle: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 8, borderTopWidth: 1,
  },
  interpretToggleText: { flex: 1, fontSize: 14, fontWeight: '600' },
  interpretation: {
    padding: 14, borderTopWidth: 1,
  },
  interpretText: { fontSize: 13, lineHeight: 20 },
});
