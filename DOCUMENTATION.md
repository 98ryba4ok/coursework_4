# NIHSS Калькулятор — Полная документация проекта

> **Мобильное приложение для клинической оценки тяжести инсульта по шкале NIH Stroke Scale (NIHSS)**

---

## Содержание

1. [Обзор проекта](#1-обзор-проекта)
2. [Технологический стек](#2-технологический-стек)
3. [Структура проекта](#3-структура-проекта)
4. [Шкала NIHSS — медицинская основа](#4-шкала-nihss--медицинская-основа)
5. [Backend — Django REST Framework](#5-backend--django-rest-framework)
6. [Mobile — React Native + Expo](#6-mobile--react-native--expo)
7. [Дизайн-система](#7-дизайн-система)
8. [API Reference](#8-api-reference)
9. [Схема базы данных](#9-схема-базы-данных)
10. [Безопасность](#10-безопасность)
11. [Развёртывание](#11-развёртывание)
12. [Установка и запуск](#12-установка-и-запуск)

---

## 1. Обзор проекта

**NIHSS Калькулятор** — профессиональный медицинский инструмент для нврологов и врачей скорой помощи, реализующий стандартизированную оценку неврологического дефицита при остром инсульте.

### Назначение

Шкала NIHSS (National Institutes of Health Stroke Scale) является международным стандартом количественной оценки тяжести инсульта. Она используется для:

- первичной оценки пациента при поступлении;
- принятия решения о тромболизисе (rt-PA) или механической тромбэктомии;
- мониторинга динамики неврологического статуса;
- прогнозирования исходов и реабилитационного потенциала.

### Ключевые возможности

| Функция | Описание |
|---------|----------|
| Оценка по 15 пунктам | Полная реализация шкалы NIHSS с подсказками по каждому пункту |
| Аккордеон-интерфейс | Каждый пункт раскрывается с детальными вариантами ответа |
| Живой счётчик | Суммарный балл обновляется в реальном времени при заполнении |
| Клиническое заключение | Автоматическая интерпретация с анализом доменов и рекомендациями |
| История оценок | Сохранение всех расчётов с возможностью просмотра и удаления |
| Статистика | Графики динамики баллов и распределение по степеням тяжести |
| Двойная тема | Тёмная нейро-тема и светлая тема с переключением |
| Аутентификация | Регистрация и JWT-вход, данные изолированы по пользователям |

---

## 2. Технологический стек

### Backend

| Компонент | Версия | Назначение |
|-----------|--------|-----------|
| Python | 3.11+ | Язык |
| Django | 5.0.6 | Web-фреймворк |
| Django REST Framework | 3.15.2 | REST API |
| djangorestframework-simplejwt | 5.3.1 | JWT-аутентификация |
| django-cors-headers | 4.4.0 | CORS |
| psycopg2-binary | 2.9.9 | PostgreSQL драйвер |
| argon2-cffi | 23.1.0 | Хеширование паролей (Argon2) |
| python-decouple | 3.8 | Управление конфигурацией через .env |
| gunicorn | 22.0.0 | WSGI-сервер для продакшена |
| whitenoise | 6.7.0 | Отдача статики без nginx |
| PostgreSQL | 15 | База данных |

### Mobile

| Компонент | Версия | Назначение |
|-----------|--------|-----------|
| React Native | 0.76.9 | Кроссплатформенный мобильный фреймворк |
| Expo | ~54.0.0 | Инфраструктура разработки |
| TypeScript | 5.3.3 | Строгая типизация |
| React Navigation | 7.x | Навигация (Stack + BottomTabs) |
| React Native Paper | 5.12.3 | UI-компоненты Material Design 3 |
| expo-linear-gradient | ~14.0 | Градиентные фоны |
| @expo/vector-icons | 14.x | Иконки (MaterialCommunityIcons) |
| axios | 1.7.9 | HTTP-клиент |
| AsyncStorage | 2.1.0 | Локальное хранилище токенов и настроек |
| react-native-chart-kit | 6.12.0 | Графики (Line, Bar) |
| react-native-svg | 15.8.0 | SVG для графиков |
| react-native-reanimated | ~3.16.7 | Анимации |

### Инфраструктура

| Сервис | Назначение |
|--------|-----------|
| Render.com | Хостинг backend + PostgreSQL |

---

## 3. Структура проекта

```
nihss_calculator/
│
├── backend/                          # Django REST API
│   ├── nihss/                        # Настройки проекта
│   │   ├── __init__.py
│   │   ├── settings.py               # Конфигурация Django
│   │   ├── urls.py                   # Корневые URL
│   │   └── wsgi.py                   # WSGI entry point
│   │
│   ├── calculator/                   # Основное приложение
│   │   ├── __init__.py
│   │   ├── admin.py                  # Django Admin: User, NIHSSCalculation
│   │   ├── models.py                 # Модели: User, NIHSSCalculation
│   │   ├── serializers.py            # DRF сериализаторы
│   │   ├── services.py               # Логика расчёта NIHSS
│   │   ├── views.py                  # API view-классы и функции
│   │   └── urls.py                   # URL-маршруты API
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── mobile/                           # React Native + Expo
│   ├── App.tsx                       # Root: провайдеры GestureHandler, SafeArea, Theme, Auth
│   ├── app.json                      # Конфиг Expo (иконки, splash, bundleId)
│   ├── babel.config.js
│   ├── package.json
│   ├── tsconfig.json
│   │
│   └── src/
│       ├── types/
│       │   └── index.ts              # TypeScript интерфейсы (User, NIHSSScores, Statistics и др.)
│       │
│       ├── context/
│       │   ├── AuthContext.tsx       # JWT-аутентификация, состояние пользователя
│       │   └── ThemeContext.tsx      # Нейро-тёмная/светлая палитры, Material Design 3
│       │
│       ├── services/
│       │   └── api.ts                # Axios-клиент: authAPI, calculatorAPI
│       │
│       ├── navigation/
│       │   └── AppNavigator.tsx      # Stack (Auth/Main) + BottomTabs
│       │
│       └── screens/
│           ├── LoginScreen.tsx       # Вход (email + пароль, JWT)
│           ├── RegisterScreen.tsx    # Регистрация (ФИО, email, пароль)
│           ├── CalculatorScreen.tsx  # Главный экран: 15 пунктов NIHSS + результат
│           ├── HistoryScreen.tsx     # История оценок с pull-to-refresh и удалением
│           ├── StatisticsScreen.tsx  # Графики динамики и распределения
│           └── ProfileScreen.tsx     # Профиль, тема, справочник NIHSS, выход
│
├── render.yaml                       # Конфигурация деплоя Render.com
└── DOCUMENTATION.md                  # Этот файл
```

---

## 4. Шкала NIHSS — медицинская основа

### Все 15 пунктов шкалы

| № | Код | Название | Диапазон | Описание градаций |
|---|-----|----------|----------|-------------------|
| 1а | `loc` | Уровень сознания | 0–3 | 0: бодрствует · 1: сомнолентность · 2: сопор · 3: кома |
| 1б | `loc_questions` | Ответы на вопросы (месяц/возраст) | 0–2 | 0: оба верно · 1: один верно · 2: оба неверно |
| 1в | `loc_commands` | Выполнение команд (глаза/кулак) | 0–2 | 0: обе выполнены · 1: одна · 2: ни одной |
| 2 | `best_gaze` | Взор | 0–2 | 0: норма · 1: частичный парез · 2: тотальный парез/девиация |
| 3 | `visual` | Поля зрения | 0–3 | 0: норма · 1: частичная гемианопия · 2: полная · 3: двусторонняя слепота |
| 4 | `facial_palsy` | Лицевой паралич | 0–3 | 0: норма · 1: лёгкий · 2: частичный · 3: полный |
| 5а | `motor_arm_left` | Двигательная функция: левая рука | 0–4 | 0: нет дрейфа · 1: дрейф · 2: против гравитации · 3: нет усилия · 4: нет движений |
| 5б | `motor_arm_right` | Двигательная функция: правая рука | 0–4 | аналогично 5а |
| 6а | `motor_leg_left` | Двигательная функция: левая нога | 0–4 | 0: нет дрейфа (30°/5 с) · 1: дрейф · 2: против гравитации · 3: нет усилия · 4: нет движений |
| 6б | `motor_leg_right` | Двигательная функция: правая нога | 0–4 | аналогично 6а |
| 7 | `limb_ataxia` | Атаксия конечностей | 0–2 | 0: отсутствует · 1: в одной конечности · 2: в двух |
| 8 | `sensory` | Чувствительность | 0–2 | 0: норма · 1: лёгкое снижение · 2: тяжёлое нарушение |
| 9 | `best_language` | Речь / Афазия | 0–3 | 0: норма · 1: лёгкая афазия · 2: тяжёлая · 3: мутизм/глобальная |
| 10 | `dysarthria` | Дизартрия | 0–2 | 0: норма · 1: лёгкая/умеренная · 2: тяжёлая |
| 11 | `extinction` | Угасание и невнимательность | 0–2 | 0: норма · 1: гемиинаттенция · 2: тяжёлое игнорирование |

**Максимальный балл: 42**

### Интерпретация суммарного балла

| Диапазон | Степень тяжести | Код | Цвет | Тактика |
|----------|----------------|-----|------|---------|
| 0 | Нет признаков инсульта | `no_stroke` | Зелёный | Динамическое наблюдение |
| 1–4 | Малый инсульт / ТИА | `minor` | Синий | МРТ/КТ, госпитализация, антиагрегантная терапия |
| 5–15 | Умеренный инсульт | `moderate` | Янтарный | Экстренная госпитализация, оценка тромболизиса (4,5 ч), тромбэктомии |
| 16–20 | Умеренно тяжёлый | `moderate_severe` | Оранжевый | Нейрореанимация, мониторинг витальных функций, реперфузионная терапия |
| 21–42 | Тяжёлый инсульт | `severe` | Красный | Немедленная нейрореанимация, ИВЛ, многопрофильная бригада, краниоэктомия |

### Логика расчёта (`services.py`)

```
1. Суммирование: total = Σ clamp(score[item], 0, max[item])  для всех 15 пунктов
2. Классификация: severity = f(total) по пороговым значениям
3. Интерпретация:
   - Общий балл и степень тяжести
   - Анализ ключевых доменов (сознание, речь, моторика, зрение)
   - Клинические рекомендации по степени тяжести
```

### Доменный анализ в заключении

| Домен | Пункты | Макс. |
|-------|--------|-------|
| Сознание | 1a + 1б + 1в | 7 |
| Движение (руки) | 5а + 5б | 8 |
| Движение (ноги) | 6а + 6б | 8 |
| Речь | 9 + 10 | 5 |
| Зрение | 2 + 3 | 5 |

---

## 5. Backend — Django REST Framework

### Модели (`calculator/models.py`)

#### `User`

Кастомная модель пользователя, заменяет стандартную Django. Идентификатор — UUID, логин — email.

```
User
├── id          UUID (PK, auto)
├── email       EmailField (unique, USERNAME_FIELD)
├── full_name   CharField(150)
├── is_active   BooleanField (default True)
├── is_staff    BooleanField (default False)
└── created_at  DateTimeField (auto_now_add)
```

#### `NIHSSCalculation`

Хранит полный набор 15 баллов NIHSS, параметры пациента и вычисленные результаты.

```
NIHSSCalculation
├── id               UUID (PK, auto)
├── user             FK → User (CASCADE)
│
├── patient_age      PositiveIntegerField
├── patient_notes    TextField (blank)
│
├── loc              SmallInt 0-3   # 1a
├── loc_questions    SmallInt 0-2   # 1б
├── loc_commands     SmallInt 0-2   # 1в
├── best_gaze        SmallInt 0-2   # 2
├── visual           SmallInt 0-3   # 3
├── facial_palsy     SmallInt 0-3   # 4
├── motor_arm_left   SmallInt 0-4   # 5а
├── motor_arm_right  SmallInt 0-4   # 5б
├── motor_leg_left   SmallInt 0-4   # 6а
├── motor_leg_right  SmallInt 0-4   # 6б
├── limb_ataxia      SmallInt 0-2   # 7
├── sensory          SmallInt 0-2   # 8
├── best_language    SmallInt 0-3   # 9
├── dysarthria       SmallInt 0-2   # 10
├── extinction       SmallInt 0-2   # 11
│
├── total_score      SmallInt (computed)
├── severity         CharField choices(5)
├── interpretation   TextField
└── created_at       DateTimeField (auto_now_add)
```

### Сервис расчёта (`calculator/services.py`)

Класс `NIHSSCalculator` содержит чистую бизнес-логику без зависимостей от Django:

```python
NIHSSCalculator.calculate(scores: dict) -> (total_score, severity, interpretation)
NIHSSCalculator._classify(total: int)   -> severity_key
NIHSSCalculator._generate_interpretation(total, severity, scores) -> str
```

Метод `calculate()` вызывается из сериализатора при создании записи.

### Сериализаторы (`calculator/serializers.py`)

| Класс | Назначение |
|-------|-----------|
| `RegisterSerializer` | Валидация регистрации, вызов `create_user()` |
| `UserSerializer` | Чтение данных пользователя (id, email, full_name, created_at) |
| `NIHSSCalculationCreateSerializer` | Валидация входных данных, вызов `NIHSSCalculator.calculate()` при `create()` |
| `NIHSSCalculationSerializer` | Полное чтение записи, включая вычисленные поля |

### Views (`calculator/views.py`)

| View | Метод | URL | Auth | Описание |
|------|-------|-----|------|----------|
| `RegisterView` | POST | `/api/auth/register` | Нет | Регистрация + возврат JWT |
| `LoginView` | POST | `/api/auth/login` | Нет | Вход + возврат JWT |
| `MeView` | GET | `/api/auth/me` | JWT | Данные текущего пользователя |
| `CalculationListCreateView` | GET | `/api/calculations` | JWT | Список своих оценок (пагинация 20) |
| `CalculationListCreateView` | POST | `/api/calculations` | JWT | Создать оценку |
| `CalculationDetailView` | GET | `/api/calculations/{uuid}` | JWT | Одна запись |
| `CalculationDetailView` | DELETE | `/api/calculations/{uuid}` | JWT | Удалить запись |
| `statistics_view` | GET | `/api/calculations/statistics` | JWT | Агрегированная статистика |

### Конфигурация Django (`nihss/settings.py`)

```
AUTH_USER_MODEL = 'calculator.User'

PASSWORD_HASHERS = [Argon2, PBKDF2]

SIMPLE_JWT = {
    ACCESS_TOKEN_LIFETIME:  7 дней,
    REFRESH_TOKEN_LIFETIME: 30 дней,
    ROTATE_REFRESH_TOKENS:  True,
}

REST_FRAMEWORK = {
    PAGE_SIZE: 20,
    DEFAULT_AUTHENTICATION: JWTAuthentication,
    DEFAULT_PERMISSION:     IsAuthenticated,
}

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE     = 'Europe/Moscow'
```

---

## 6. Mobile — React Native + Expo

### Точка входа (`App.tsx`)

Дерево провайдеров:

```
GestureHandlerRootView
  └── SafeAreaProvider
        └── ThemeProvider          ← нейро-палитры, dark/light/system
              └── AuthProvider     ← JWT-токены, состояние пользователя
                    └── PaperProvider (Material Design 3)
                          └── AppNavigator
```

### Навигация (`AppNavigator.tsx`)

```
Stack Navigator
├── [Неавторизован]
│   ├── LoginScreen
│   └── RegisterScreen
│
└── [Авторизован] → MainTabs (BottomTabNavigator)
    ├── CalculatorScreen   (иконка: brain)
    ├── HistoryScreen      (иконка: clipboard-text-clock-outline)
    ├── StatisticsScreen   (иконка: chart-bell-curve-cumulative)
    └── ProfileScreen      (иконка: account-circle-outline)
```

### Экраны

#### `LoginScreen`

- Линейный градиентный фон (`#070F1E → #0D1B35 → #0A2040`)
- Логотип: концентрические кольца с иконкой мозга
- TextInput (outlined): email, пароль с кнопкой показа
- Блок ошибки с иконкой `alert-circle-outline`
- Ссылка на регистрацию

#### `RegisterScreen`

- Аналогичный фон, кнопка "Назад"
- Поля: ФИО, email, пароль
- Индикатор силы пароля: 4 цветных полосы (слабый/средний/надёжный)
- Акцентный цвет кнопки: `secondary` (бирюза)

#### `CalculatorScreen` ← основной экран

**Структура:**

```
TopBar — Заголовок "Шкала NIHSS" + живой счётчик X/42
│
├── Секция "Данные пациента"
│   ├── TextInput: возраст (numeric)
│   └── TextInput: примечания (multiline)
│
├── Секция "Текущий счёт"
│   ├── Прогресс-бар с цветом степени тяжести
│   └── Метки шкалы: 0 / 4 / 15 / 20 / 42
│
├── Секция "Пункты шкалы NIHSS" (аккордеон, 15 элементов)
│   └── Каждый пункт:
│       ├── Заголовок: номер (1a/1б/.../11) + название + текущий балл-бадж
│       └── [Развёрнуто] варианты ответа с radio-точками и цветовой семантикой
│
├── Кнопки: [Рассчитать NIHSS] [Сброс]
│
└── ResultCard (после расчёта)
    ├── Градиентный заголовок с иконкой + суммарный балл + степень тяжести
    ├── Доменная статистика: Сознание / Движение / Речь / Зрение
    ├── Шкала 5 степеней с подсветкой текущей
    └── [Раскрываемое] Клиническое заключение
```

**Логика аккордеона:** одновременно открыт только один пункт. По умолчанию открыт `1a`. При выборе значения бадж пункта окрашивается в `colors.primary`.

**Цвет варианта ответа:**
- `0` (норма) → `colors.no_stroke` (зелёный)
- промежуточные → `colors.moderate` (янтарный)
- максимальный → `colors.severe` (красный)

#### `HistoryScreen`

- `FlatList` с `RefreshControl`
- Карточка записи:
  - Иконка степени тяжести (52×52, цветной фон)
  - Балл (крупный) + степень тяжести (бадж)
  - Тонкий прогресс-бар через всю ширину (цвет = степень)
  - Доменные значения: Сознание / Движение / Речь / Зрение
  - Дата и время создания
  - Кнопка удаления с Alert-подтверждением

#### `StatisticsScreen`

- Сводные карточки: кол-во оценок + средний балл
- `LineChart` — динамика последних 10 баллов по времени (bezier)
- Распределение по степеням тяжести: горизонтальные прогресс-бары с иконками
- Справочная таблица интерпретации

#### `ProfileScreen`

- Карточка пользователя с аватаром-инициалами на градиентном фоне
- `SegmentedButtons` для выбора темы: Тёмная / Светлая / Система
- Справочник NIHSS: шкала степеней + раскрываемый список всех 15 доменов
- Карточка «О приложении»: версия, стандарт, назначение
- Кнопка выхода с Alert-подтверждением

### Управление состоянием

#### `AuthContext`

```typescript
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login(email, password): Promise<void>
  register(email, password, fullName): Promise<void>
  logout(): Promise<void>
}
```

При запуске приложения `restoreSession()` читает токен из AsyncStorage и при успехе вызывает `/api/auth/me`. Неверный токен удаляется автоматически.

#### `ThemeContext`

```typescript
interface ThemeContextType {
  themeMode: 'dark' | 'light' | 'system'
  setThemeMode(mode): void
  paperTheme: MD3Theme         // для PaperProvider
  navigationTheme: NavTheme    // для NavigationContainer
  colors: NeuroColors          // кастомная палитра
  isDark: boolean
}
```

Предпочтение сохраняется в AsyncStorage (`theme_mode`). Режим `system` реагирует на `useColorScheme()`.

### API-клиент (`services/api.ts`)

```typescript
// Базовый URL
const BASE_URL = 'https://nihss-backend.onrender.com/api'

// Request interceptor: автоматически добавляет Bearer-токен
// Response interceptor: при 401 очищает токены из AsyncStorage

authAPI.register(email, password, full_name)
authAPI.login(email, password)
authAPI.me()

calculatorAPI.calculate(data)        // POST /calculations
calculatorAPI.list(page?)            // GET  /calculations?page=N
calculatorAPI.get(id)                // GET  /calculations/{id}
calculatorAPI.delete(id)             // DELETE /calculations/{id}
calculatorAPI.statistics()           // GET  /calculations/statistics
```

Timeout: 30 секунд (с учётом cold start Render.com).

### TypeScript-типы (`types/index.ts`)

```typescript
interface NIHSSScores { loc, loc_questions, loc_commands, best_gaze, visual,
  facial_palsy, motor_arm_left, motor_arm_right, motor_leg_left, motor_leg_right,
  limb_ataxia, sensory, best_language, dysarthria, extinction }

type SeverityLevel = 'no_stroke' | 'minor' | 'moderate' | 'moderate_severe' | 'severe'

interface NIHSSCalculation extends NIHSSScores {
  id, patient_age, patient_notes, total_score, severity,
  severity_display, interpretation, created_at }

interface Statistics {
  total_count, average_score,
  severity_distribution: Partial<Record<SeverityLevel, number>>,
  recent_scores: { date, score, severity }[] }

type ThemeMode = 'dark' | 'light' | 'system'
```

---

## 7. Дизайн-система

### Нейро-тёмная палитра (основная)

| Токен | Hex | Назначение |
|-------|-----|-----------|
| `background` | `#070F1E` | Фон приложения |
| `surface` | `#0D1B35` | Поверхность карточек, шапок |
| `surfaceVariant` | `#162040` | Вложенные блоки, варианты ответа |
| `card` | `#112035` | Карточки истории |
| `border` | `#1E3A5F` | Разделители и границы |
| `primary` | `#4F9CF9` | Электрик-синий: акцент, кнопки, ссылки |
| `primaryDark` | `#2563EB` | Нажатое состояние |
| `secondary` | `#06B6D4` | Бирюза: второстепенные акценты |
| `accent` | `#818CF8` | Индиго: заголовки секций |
| `text` | `#E8EEF8` | Основной текст |
| `textSecondary` | `#8BA3C7` | Подписи, метки |
| `placeholder` | `#4A6A8A` | Плейсхолдеры, неактивные элементы |

### Цвета степеней тяжести

| Степень | Тёмная тема | Светлая тема |
|---------|------------|-------------|
| no_stroke | `#10B981` | `#059669` |
| minor | `#3B82F6` | `#2563EB` |
| moderate | `#F59E0B` | `#D97706` |
| moderate_severe | `#F97316` | `#EA580C` |
| severe | `#EF4444` | `#DC2626` |

### Светлая палитра

| Токен | Hex |
|-------|-----|
| `background` | `#F0F4FF` |
| `surface` | `#FFFFFF` |
| `surfaceVariant` | `#E8EEFF` |
| `primary` | `#1D4ED8` |
| `secondary` | `#0891B2` |
| `text` | `#0A1628` |
| `border` | `#C7D7F0` |

### Система компонентов

| Компонент | Border Radius | Особенности |
|-----------|--------------|-------------|
| Карточки (section) | 20px | `borderWidth: 1`, цвет из `colors.border` |
| Карточки истории | 18px | overflow hidden для прогресс-бара |
| TextInput | 12px | outlined mode, `backgroundColor: surfaceVariant` |
| Кнопки основные | 14–16px | `height: 50–54`, `fontWeight: 700–800` |
| Иконки-обёртки | 10–14px | фон = `color + '22'`, граница = `color + '44'` |
| Аватар | 48px | кольцо 96px, инициалы 30px bold |
| Бадж балла | 8–12px | `color + '22'` фон |

### Типографика

| Роль | Размер | Weight |
|------|--------|--------|
| Название приложения | 38px | 800 + letterSpacing 6 |
| Заголовок экрана | 20px | 800 |
| Заголовок карточки | 22px | 700 |
| Суммарный балл (результат) | 42px | 900 |
| Суммарный балл (история) | 30px | 900 |
| Заголовок секции | 16px | 700 |
| Пункт NIHSS | 13px | 500 |
| Вариант ответа | 13px | 400 |
| Подписи | 11–12px | 400 |

### Градиентный фон Auth-экранов

```
['#070F1E', '#0D1B35', '#0A2040']  (вертикально)
```

### Градиенты результата по степени тяжести

| Степень | Градиент |
|---------|---------|
| no_stroke | `['#064E3B', '#065F46']` |
| minor | `['#1E3A5F', '#1D4ED8']` |
| moderate | `['#451A03', '#92400E']` |
| moderate_severe | `['#431407', '#9A3412']` |
| severe | `['#450A0A', '#991B1B']` |

---

## 8. API Reference

### Аутентификация

#### `POST /api/auth/register`

```json
// Request
{ "email": "doctor@hospital.ru", "full_name": "Иванов Иван", "password": "secure123" }

// Response 201
{
  "user": { "id": "uuid", "email": "...", "full_name": "...", "created_at": "..." },
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

#### `POST /api/auth/login`

```json
// Request
{ "email": "doctor@hospital.ru", "password": "secure123" }

// Response 200 — аналогично register
// Response 401
{ "detail": "Неверный email или пароль." }
```

#### `GET /api/auth/me`

```json
// Headers: Authorization: Bearer <access_token>
// Response 200
{ "id": "uuid", "email": "...", "full_name": "...", "created_at": "..." }
```

### Расчёты

#### `POST /api/calculations`

```json
// Request
{
  "patient_age": 67,
  "patient_notes": "Поступил через 2 часа после начала симптомов",
  "loc": 1, "loc_questions": 1, "loc_commands": 0,
  "best_gaze": 1, "visual": 1, "facial_palsy": 2,
  "motor_arm_left": 3, "motor_arm_right": 0,
  "motor_leg_left": 2, "motor_leg_right": 0,
  "limb_ataxia": 1, "sensory": 1,
  "best_language": 1, "dysarthria": 1, "extinction": 1
}

// Response 201
{
  "id": "uuid",
  "patient_age": 67,
  "patient_notes": "...",
  "loc": 1, "loc_questions": 1, ...,
  "total_score": 16,
  "severity": "moderate_severe",
  "severity_display": "Умеренно тяжёлый инсульт",
  "interpretation": "Суммарный балл NIHSS: 16/42 — Умеренно тяжёлый инсульт...",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `GET /api/calculations`

```json
// Response 200
{
  "count": 42,
  "next": "http://.../api/calculations?page=2",
  "previous": null,
  "results": [ { /* NIHSSCalculation */ }, ... ]
}
```

#### `DELETE /api/calculations/{uuid}`

```
Response 204 No Content
```

#### `GET /api/calculations/statistics`

```json
// Response 200
{
  "total_count": 42,
  "average_score": 11.4,
  "severity_distribution": {
    "no_stroke": 3,
    "minor": 10,
    "moderate": 18,
    "moderate_severe": 7,
    "severe": 4
  },
  "recent_scores": [
    { "date": "15.01", "score": 16, "severity": "moderate_severe" },
    { "date": "12.01", "score": 8,  "severity": "moderate" }
  ]
}
```

---

## 9. Схема базы данных

```sql
-- Таблица пользователей
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(254) UNIQUE NOT NULL,
  full_name  VARCHAR(150) NOT NULL,
  password   VARCHAR(255) NOT NULL,           -- Argon2-хеш
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  is_staff   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица оценок NIHSS
CREATE TABLE nihss_calculations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Параметры пациента
  patient_age      SMALLINT NOT NULL CHECK (patient_age > 0 AND patient_age <= 130),
  patient_notes    TEXT NOT NULL DEFAULT '',

  -- Пункты шкалы NIHSS
  loc              SMALLINT NOT NULL DEFAULT 0 CHECK (loc BETWEEN 0 AND 3),
  loc_questions    SMALLINT NOT NULL DEFAULT 0 CHECK (loc_questions BETWEEN 0 AND 2),
  loc_commands     SMALLINT NOT NULL DEFAULT 0 CHECK (loc_commands BETWEEN 0 AND 2),
  best_gaze        SMALLINT NOT NULL DEFAULT 0 CHECK (best_gaze BETWEEN 0 AND 2),
  visual           SMALLINT NOT NULL DEFAULT 0 CHECK (visual BETWEEN 0 AND 3),
  facial_palsy     SMALLINT NOT NULL DEFAULT 0 CHECK (facial_palsy BETWEEN 0 AND 3),
  motor_arm_left   SMALLINT NOT NULL DEFAULT 0 CHECK (motor_arm_left BETWEEN 0 AND 4),
  motor_arm_right  SMALLINT NOT NULL DEFAULT 0 CHECK (motor_arm_right BETWEEN 0 AND 4),
  motor_leg_left   SMALLINT NOT NULL DEFAULT 0 CHECK (motor_leg_left BETWEEN 0 AND 4),
  motor_leg_right  SMALLINT NOT NULL DEFAULT 0 CHECK (motor_leg_right BETWEEN 0 AND 4),
  limb_ataxia      SMALLINT NOT NULL DEFAULT 0 CHECK (limb_ataxia BETWEEN 0 AND 2),
  sensory          SMALLINT NOT NULL DEFAULT 0 CHECK (sensory BETWEEN 0 AND 2),
  best_language    SMALLINT NOT NULL DEFAULT 0 CHECK (best_language BETWEEN 0 AND 3),
  dysarthria       SMALLINT NOT NULL DEFAULT 0 CHECK (dysarthria BETWEEN 0 AND 2),
  extinction       SMALLINT NOT NULL DEFAULT 0 CHECK (extinction BETWEEN 0 AND 2),

  -- Вычисленные результаты
  total_score      SMALLINT NOT NULL CHECK (total_score BETWEEN 0 AND 42),
  severity         VARCHAR(20) NOT NULL,
  interpretation   TEXT NOT NULL DEFAULT '',

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nihss_user_created ON nihss_calculations (user_id, created_at DESC);
CREATE INDEX idx_nihss_severity ON nihss_calculations (severity);
```

---

## 10. Безопасность

| Аспект | Реализация |
|--------|-----------|
| Хеширование паролей | Argon2 (OWASP Top рекомендация), fallback PBKDF2 |
| Аутентификация | JWT Bearer (access 7 дней, refresh 30 дней, rotate on use) |
| HTTPS | Все коммуникации зашифрованы (Render.com обеспечивает TLS) |
| CORS | Разрешены только явно заданные origins; в DEBUG — все |
| Изоляция данных | `queryset.filter(user=request.user)` — пользователь видит только свои записи |
| UUID первичные ключи | Исключает перебор ID (IDOR-атаки) |
| Валидация | Двойная: TypeScript на клиенте + DRF serializers на сервере |
| Секреты | `.env` файл, исключён из git; SECRET_KEY генерируется Render.com |
| Обработка 401 | Response interceptor автоматически очищает токены при истечении |
| Защита от CSRF | Django CsrfViewMiddleware (для web-клиентов) |

---

## 11. Развёртывание

### Render.com (`render.yaml`)

```yaml
services:
  - type: web
    name: nihss-backend
    env: python
    buildCommand: |
      pip install -r backend/requirements.txt
      python backend/manage.py collectstatic --noinput
      python backend/manage.py migrate
    startCommand: gunicorn --chdir backend nihss.wsgi:application

databases:
  - name: nihss-db
    databaseName: nihss_db
    user: nihss_user
    plan: free
```

**Автоматически:** создаётся БД, применяются миграции, SECRET_KEY генерируется случайным образом.

### Переменные окружения (продакшен)

| Переменная | Описание |
|-----------|----------|
| `SECRET_KEY` | Автогенерация Render.com |
| `DEBUG` | `False` |
| `DATABASE_URL` | Автоподставляется из БД Render |
| `ALLOWED_HOSTS` | Домен Render + кастомные домены |
| `CORS_ALLOWED_ORIGINS` | URL мобильного приложения |

---

## 12. Установка и запуск

### Backend (локально)

```bash
cd nihss_calculator/backend

# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate          # Linux/macOS
# venv\Scripts\activate           # Windows

# Установить зависимости
pip install -r requirements.txt

# Настроить окружение
cp .env.example .env
# Отредактировать .env: DB_NAME, DB_USER, DB_PASSWORD

# Создать базу данных PostgreSQL
createdb nihss_db

# Применить миграции
python manage.py migrate

# Создать суперпользователя (опционально)
python manage.py createsuperuser

# Запустить сервер разработки
python manage.py runserver
# API доступен: http://localhost:8000/api/
# Admin: http://localhost:8000/admin/
```

### Mobile (локально)

```bash
cd nihss_calculator/mobile

# Установить зависимости
npm install

# В файле src/services/api.ts изменить BASE_URL:
# const BASE_URL = 'http://localhost:8000/api'  (для локального backend)

# Запустить Expo
npx expo start

# Открыть в симуляторе iOS / Android
# или отсканировать QR-код через Expo Go на устройстве
```

### Требования к окружению

| Инструмент | Минимальная версия |
|------------|-------------------|
| Python | 3.11 |
| Node.js | 18 |
| PostgreSQL | 14 |
| Xcode | 14 (для iOS симулятора) |
| Android Studio | 2023 (для Android эмулятора) |

---

## Лицензия и ответственность

> **Важно:** Данное приложение предназначено исключительно для профессионального медицинского использования. Оценка по шкале NIHSS должна выполняться квалифицированным медицинским персоналом. Результаты калькулятора не заменяют клиническое суждение врача.
