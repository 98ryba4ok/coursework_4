# NIHSS Калькулятор — Оценка тяжести инсульта

Мобильное приложение для оценки тяжести инсульта по шкале NIH Stroke Scale (NIHSS).

## Технологии

| Слой | Технологии |
|------|-----------|
| Backend | Django 5, Django REST Framework, PostgreSQL, JWT (simplejwt) |
| Mobile | React Native 0.76 + Expo 54, TypeScript |
| UI | React Native Paper (Material Design 3), expo-linear-gradient |
| Charts | react-native-chart-kit |
| Deploy | Render.com |

## Шкала NIHSS (15 пунктов)

| Пункт | Название | Макс. балл |
|-------|----------|-----------|
| 1a | Уровень сознания | 3 |
| 1б | Ответы на вопросы | 2 |
| 1в | Выполнение команд | 2 |
| 2 | Взор | 2 |
| 3 | Поля зрения | 3 |
| 4 | Лицевой паралич | 3 |
| 5а/б | Двигательные функции рук (лев/прав) | 4+4 |
| 6а/б | Двигательные функции ног (лев/прав) | 4+4 |
| 7 | Атаксия конечностей | 2 |
| 8 | Чувствительность | 2 |
| 9 | Речь / Афазия | 3 |
| 10 | Дизартрия | 2 |
| 11 | Угасание и невнимательность | 2 |
| | **Итого** | **42** |

## Интерпретация

| Баллы | Степень тяжести |
|-------|----------------|
| 0 | Нет признаков инсульта |
| 1–4 | Малый инсульт |
| 5–15 | Умеренный инсульт |
| 16–20 | Умеренно тяжёлый инсульт |
| 21–42 | Тяжёлый инсульт |

## Дизайн

Нейро-тёмная тема: глубокий тёмно-синий (#070F1E), электрик-синий (#4F9CF9), бирюза (#06B6D4), индиго (#818CF8). Поддержка светлой темы и системных настроек.

## Установка

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # настройте БД
python manage.py migrate
python manage.py runserver
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Вход (JWT) |
| GET | /api/auth/me | Профиль |
| POST | /api/calculations | Создать оценку |
| GET | /api/calculations | История оценок |
| DELETE | /api/calculations/{id} | Удалить оценку |
| GET | /api/calculations/statistics | Статистика |
