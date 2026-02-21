"""
NIHSS Calculator Service
Шкала инсульта Национального института здоровья (NIHSS)
Максимальный балл: 42
"""


class NIHSSCalculator:
    """
    Вычисляет суммарный балл по шкале NIHSS и определяет степень тяжести инсульта.

    Пункты шкалы:
    1a  loc              0-3  Уровень сознания
    1b  loc_questions    0-2  Ответы на вопросы
    1c  loc_commands     0-2  Выполнение команд
    2   best_gaze        0-2  Взор
    3   visual           0-3  Поля зрения
    4   facial_palsy     0-3  Лицевой паралич
    5a  motor_arm_left   0-4  Двигательные функции: левая рука
    5b  motor_arm_right  0-4  Двигательные функции: правая рука
    6a  motor_leg_left   0-4  Двигательные функции: левая нога
    6b  motor_leg_right  0-4  Двигательные функции: правая нога
    7   limb_ataxia      0-2  Атаксия конечностей
    8   sensory          0-2  Чувствительность
    9   best_language    0-3  Речь (афазия)
    10  dysarthria       0-2  Дизартрия
    11  extinction       0-2  Угасание и невнимательность
    """

    SCORE_ITEMS = [
        'loc', 'loc_questions', 'loc_commands',
        'best_gaze', 'visual', 'facial_palsy',
        'motor_arm_left', 'motor_arm_right',
        'motor_leg_left', 'motor_leg_right',
        'limb_ataxia', 'sensory',
        'best_language', 'dysarthria', 'extinction',
    ]

    MAX_SCORES = {
        'loc': 3, 'loc_questions': 2, 'loc_commands': 2,
        'best_gaze': 2, 'visual': 3, 'facial_palsy': 3,
        'motor_arm_left': 4, 'motor_arm_right': 4,
        'motor_leg_left': 4, 'motor_leg_right': 4,
        'limb_ataxia': 2, 'sensory': 2,
        'best_language': 3, 'dysarthria': 2, 'extinction': 2,
    }  # Итого макс: 42

    SEVERITY_THRESHOLDS = [
        (0, 0, 'no_stroke'),
        (1, 4, 'minor'),
        (5, 15, 'moderate'),
        (16, 20, 'moderate_severe'),
        (21, 42, 'severe'),
    ]

    SEVERITY_LABELS = {
        'no_stroke': 'Нет признаков инсульта',
        'minor': 'Малый инсульт',
        'moderate': 'Умеренный инсульт',
        'moderate_severe': 'Умеренно тяжёлый инсульт',
        'severe': 'Тяжёлый инсульт',
    }

    @staticmethod
    def calculate(scores: dict) -> tuple:
        """
        Возвращает (total_score, severity, interpretation).
        scores — словарь {item_name: int_value}
        """
        total = 0
        for item in NIHSSCalculator.SCORE_ITEMS:
            value = int(scores.get(item, 0))
            max_v = NIHSSCalculator.MAX_SCORES[item]
            total += max(0, min(value, max_v))

        severity = NIHSSCalculator._classify(total)
        interpretation = NIHSSCalculator._generate_interpretation(total, severity, scores)
        return total, severity, interpretation

    @staticmethod
    def _classify(total: int) -> str:
        for low, high, label in NIHSSCalculator.SEVERITY_THRESHOLDS:
            if low <= total <= high:
                return label
        return 'severe'

    @staticmethod
    def _generate_interpretation(total: int, severity: str, scores: dict) -> str:
        label = NIHSSCalculator.SEVERITY_LABELS[severity]
        lines = [f'Суммарный балл NIHSS: {total}/42 — {label}.']

        # Анализ ключевых доменов
        consciousness = int(scores.get('loc', 0))
        if consciousness > 0:
            levels = {1: 'нарушено (сомнолентность)', 2: 'значительно нарушено (сопор)', 3: 'кома/ареактивность'}
            lines.append(f'Уровень сознания: {levels.get(consciousness, "нарушено")}.')

        language = int(scores.get('best_language', 0))
        if language > 0:
            lang_map = {1: 'лёгкая или умеренная афазия', 2: 'тяжёлая афазия', 3: 'мутизм/глобальная афазия'}
            lines.append(f'Речь: {lang_map.get(language, "нарушена")}.')

        arm_l = int(scores.get('motor_arm_left', 0))
        arm_r = int(scores.get('motor_arm_right', 0))
        leg_l = int(scores.get('motor_leg_left', 0))
        leg_r = int(scores.get('motor_leg_right', 0))
        motor_total = arm_l + arm_r + leg_l + leg_r
        if motor_total > 0:
            lines.append(f'Двигательный дефицит: суммарно {motor_total}/16 баллов.')

        visual = int(scores.get('visual', 0))
        if visual > 0:
            vis_map = {1: 'частичная гемианопия', 2: 'полная гемианопия', 3: 'двусторонняя слепота'}
            lines.append(f'Нарушения зрения: {vis_map.get(visual, "выявлены")}.')

        # Рекомендации по тяжести
        recommendations = {
            'no_stroke': 'Признаки острого инсульта отсутствуют. Рекомендуется динамическое наблюдение.',
            'minor': (
                'Малый инсульт или ТИА. Рекомендовано срочное обследование (МРТ/КТ), '
                'госпитализация, антиагрегантная терапия, контроль сосудистых рисков.'
            ),
            'moderate': (
                'Умеренный инсульт. Экстренная госпитализация в инсультный центр. '
                'Оценка возможности тромболизиса (rt-PA) в течение 4,5 ч, '
                'механической тромбэктомии при окклюзии крупных сосудов.'
            ),
            'moderate_severe': (
                'Умеренно тяжёлый инсульт. Срочная госпитализация в нейрореанимацию. '
                'Мониторинг витальных функций, нейровизуализация, рассмотрение '
                'реперфузионной терапии, нейропротекция.'
            ),
            'severe': (
                'Тяжёлый инсульт. Немедленная госпитализация в нейрореанимацию. '
                'ИВЛ при необходимости, интенсивный мониторинг, многопрофильная бригада, '
                'рассмотрение хирургического вмешательства (декомпрессивная краниоэктомия).'
            ),
        }
        lines.append(recommendations.get(severity, ''))

        return ' '.join(lines)
