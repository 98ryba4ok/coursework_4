export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

// Все 15 пунктов шкалы NIHSS
export interface NIHSSScores {
  loc: number;            // 1a: Уровень сознания (0-3)
  loc_questions: number;  // 1b: Вопросы (0-2)
  loc_commands: number;   // 1c: Команды (0-2)
  best_gaze: number;      // 2: Взор (0-2)
  visual: number;         // 3: Поля зрения (0-3)
  facial_palsy: number;   // 4: Лицевой паралич (0-3)
  motor_arm_left: number; // 5a: Рука левая (0-4)
  motor_arm_right: number;// 5b: Рука правая (0-4)
  motor_leg_left: number; // 6a: Нога левая (0-4)
  motor_leg_right: number;// 6b: Нога правая (0-4)
  limb_ataxia: number;    // 7: Атаксия конечностей (0-2)
  sensory: number;        // 8: Чувствительность (0-2)
  best_language: number;  // 9: Речь (0-3)
  dysarthria: number;     // 10: Дизартрия (0-2)
  extinction: number;     // 11: Угасание (0-2)
}

export type SeverityLevel = 'no_stroke' | 'minor' | 'moderate' | 'moderate_severe' | 'severe';

export interface NIHSSCalculation extends NIHSSScores {
  id: string;
  patient_age: number;
  patient_notes: string;
  total_score: number;
  severity: SeverityLevel;
  severity_display: string;
  interpretation: string;
  created_at: string;
}

export interface Statistics {
  total_count: number;
  average_score: number | null;
  severity_distribution: Partial<Record<SeverityLevel, number>>;
  recent_scores: Array<{
    date: string;
    score: number;
    severity: SeverityLevel;
  }>;
}

export type ThemeMode = 'dark' | 'light' | 'system';
