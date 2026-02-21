from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, NIHSSCalculation
from .services import NIHSSCalculator


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('email', 'full_name', 'password')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует.')
        return value.lower()

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'created_at')
        read_only_fields = fields


class NIHSSCalculationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NIHSSCalculation
        fields = (
            'patient_age', 'patient_notes',
            'loc', 'loc_questions', 'loc_commands',
            'best_gaze', 'visual', 'facial_palsy',
            'motor_arm_left', 'motor_arm_right',
            'motor_leg_left', 'motor_leg_right',
            'limb_ataxia', 'sensory',
            'best_language', 'dysarthria', 'extinction',
        )

    def validate_patient_age(self, value):
        if not (0 < value <= 130):
            raise serializers.ValidationError('Возраст должен быть от 1 до 130 лет.')
        return value

    def _validate_score(self, value, field_name, max_score):
        if not (0 <= value <= max_score):
            raise serializers.ValidationError(
                f'Значение {field_name} должно быть от 0 до {max_score}.'
            )
        return value

    def validate(self, data):
        for item, max_v in NIHSSCalculator.MAX_SCORES.items():
            if item in data:
                self._validate_score(data[item], item, max_v)
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        scores = {k: validated_data.get(k, 0) for k in NIHSSCalculator.SCORE_ITEMS}
        total, severity, interpretation = NIHSSCalculator.calculate(scores)
        return NIHSSCalculation.objects.create(
            user=user,
            total_score=total,
            severity=severity,
            interpretation=interpretation,
            **validated_data,
        )


class NIHSSCalculationSerializer(serializers.ModelSerializer):
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)

    class Meta:
        model = NIHSSCalculation
        fields = (
            'id', 'patient_age', 'patient_notes',
            'loc', 'loc_questions', 'loc_commands',
            'best_gaze', 'visual', 'facial_palsy',
            'motor_arm_left', 'motor_arm_right',
            'motor_leg_left', 'motor_leg_right',
            'limb_ataxia', 'sensory',
            'best_language', 'dysarthria', 'extinction',
            'total_score', 'severity', 'severity_display',
            'interpretation', 'created_at',
        )
        read_only_fields = ('id', 'total_score', 'severity', 'severity_display', 'interpretation', 'created_at')
