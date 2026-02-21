import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Заполните все поля');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Ошибка входа. Проверьте данные.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#070F1E', '#0D1B35', '#0A2040']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Лого / Заголовок */}
          <View style={styles.header}>
            <View style={[styles.iconRing, { borderColor: colors.primary + '40' }]}>
              <View style={[styles.iconInner, { backgroundColor: colors.primary + '20' }]}>
                <MaterialCommunityIcons name="brain" size={52} color={colors.primary} />
              </View>
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>NIHSS</Text>
            <Text style={[styles.appSub, { color: colors.secondary }]}>
              Шкала оценки тяжести инсульта
            </Text>
          </View>

          {/* Карточка формы */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Вход в систему</Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email-outline" color={colors.textSecondary} />}
              outlineStyle={styles.inputOutline}
              style={[styles.input, { backgroundColor: colors.surfaceVariant }]}
              textColor={colors.text}
              placeholderTextColor={colors.placeholder}
              theme={{ colors: { primary: colors.primary, outline: colors.border } }}
            />

            <TextInput
              label="Пароль"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock-outline" color={colors.textSecondary} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  color={colors.textSecondary}
                  onPress={() => setShowPassword((v) => !v)}
                />
              }
              outlineStyle={styles.inputOutline}
              style={[styles.input, { backgroundColor: colors.surfaceVariant }]}
              textColor={colors.text}
              theme={{ colors: { primary: colors.primary, outline: colors.border } }}
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.severe + '18', borderColor: colors.severe + '40' }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.severe} />
                <Text style={[styles.errorText, { color: colors.severe }]}>{error}</Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginBtn}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
              buttonColor={colors.primary}
            >
              Войти
            </Button>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.placeholder }]}>или</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
              <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                Нет аккаунта?{' '}
              </Text>
              <Text style={[styles.registerTextAccent, { color: colors.primary }]}>
                Зарегистрироваться
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: colors.placeholder }]}>
            NIHSS — National Institutes of Health Stroke Scale
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconRing: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  iconInner: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
  },
  appName: { fontSize: 38, fontWeight: '800', letterSpacing: 6, marginBottom: 6 },
  appSub: { fontSize: 13, fontWeight: '500', letterSpacing: 0.5, textAlign: 'center' },
  card: {
    borderRadius: 24, padding: 24, borderWidth: 1,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  input: { marginBottom: 12, borderRadius: 12 },
  inputOutline: { borderRadius: 12 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12,
  },
  errorText: { fontSize: 13, flex: 1 },
  loginBtn: { borderRadius: 14, marginTop: 4 },
  btnContent: { height: 50 },
  btnLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  registerLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 14 },
  registerTextAccent: { fontSize: 14, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 11, marginTop: 24, letterSpacing: 0.3 },
});
