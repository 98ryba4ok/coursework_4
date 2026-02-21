import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class NIHSSGigaChatService:
    """Service for generating NIHSS interpretations using GigaChat API"""

    ITEM_DESCRIPTIONS = {
        'loc': 'Уровень сознания (1a)',
        'loc_questions': 'Ответы на вопросы — месяц/возраст (1б)',
        'loc_commands': 'Выполнение команд (1в)',
        'best_gaze': 'Взор (2)',
        'visual': 'Поля зрения (3)',
        'facial_palsy': 'Лицевой паралич (4)',
        'motor_arm_left': 'Двигательная функция левой руки (5а)',
        'motor_arm_right': 'Двигательная функция правой руки (5б)',
        'motor_leg_left': 'Двигательная функция левой ноги (6а)',
        'motor_leg_right': 'Двигательная функция правой ноги (6б)',
        'limb_ataxia': 'Атаксия конечностей (7)',
        'sensory': 'Чувствительность (8)',
        'best_language': 'Речь / Афазия (9)',
        'dysarthria': 'Дизартрия (10)',
        'extinction': 'Угасание и невнимательность (11)',
    }

    SEVERITY_RU = {
        'no_stroke': 'нет признаков инсульта',
        'minor': 'малый инсульт',
        'moderate': 'умеренный инсульт',
        'moderate_severe': 'умеренно тяжёлый инсульт',
        'severe': 'тяжёлый инсульт',
    }

    def __init__(self):
        self.credentials = getattr(settings, 'GIGACHAT_CREDENTIALS', '')
        self.client = None

    def _get_client(self):
        """Lazy initialization of GigaChat client"""
        if self.client is None and self.credentials:
            try:
                from gigachat import GigaChat
                self.client = GigaChat(
                    credentials=self.credentials,
                    scope="GIGACHAT_API_PERS",
                    model="GigaChat",
                    verify_ssl_certs=False,
                )
            except Exception as e:
                logger.error(f"Failed to initialize GigaChat client: {e}")
                self.client = None
        return self.client

    def generate_interpretation(
        self,
        scores: dict,
        total_score: int,
        severity: str,
        patient_age: int,
        patient_notes: str = '',
    ) -> str:
        """
        Generate detailed NIHSS interpretation using GigaChat API.
        Falls back to static interpretation if GigaChat is unavailable.
        """
        client = self._get_client()

        if not client:
            return self._get_fallback_interpretation(scores, total_score, severity)

        # Build score breakdown for affected items
        affected_items = [
            f"- {self.ITEM_DESCRIPTIONS[key]}: {value} балл(а)"
            for key, value in scores.items()
            if value > 0 and key in self.ITEM_DESCRIPTIONS
        ]
        affected_text = (
            "\n".join(affected_items)
            if affected_items
            else "Все показатели в норме (0 баллов)"
        )

        severity_ru = self.SEVERITY_RU.get(severity, severity)
        notes_section = f"\nПримечания врача: {patient_notes}" if patient_notes.strip() else ""

        prompt = f"""Ты — опытный невролог. Пациенту проведена оценка по шкале NIHSS (Шкала инсульта Национального института здоровья).

Данные пациента:
- Возраст: {patient_age} лет{notes_section}

Результаты NIHSS:
- Суммарный балл: {total_score} из 42
- Степень тяжести: {severity_ru}

Нарушенные показатели:
{affected_text}

Напиши краткое (4-6 предложений) клиническое заключение для врача. Укажи:
1. Что означает данный балл по шкале NIHSS
2. Какие неврологические домены наиболее поражены
3. Тактику ведения пациента (госпитализация, реперфузия, мониторинг)

Отвечай на русском языке, профессиональным медицинским языком, без лишних вводных фраз."""

        try:
            response = client.chat(prompt)
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"GigaChat API error: {e}")
            return self._get_fallback_interpretation(scores, total_score, severity)

    def _get_fallback_interpretation(self, scores: dict, total_score: int, severity: str) -> str:
        """Static fallback interpretation when GigaChat is unavailable"""
        from .services import NIHSSCalculator
        return NIHSSCalculator._generate_interpretation(total_score, severity, scores)


gigachat_service = NIHSSGigaChatService()
