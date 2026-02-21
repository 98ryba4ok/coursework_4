import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { colors } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Заполните все поля');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(email.trim().toLowerCase(), password, fullName.trim());
    } catch (e: any) {
      const detail = e?.response?.data;
      if (typeof detail === 'object') {
        const msg = Object.values(detail).flat().join(' ');
        setError(msg);
      } else {
        setError('Ошибка регистрации. Попробуйте ещё раз.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#070F1E', '#0D1B35', '#0A2040']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.iconRing, { borderColor: colors.secondary + '40' }]}>
              <View style={[styles.iconInner, { backgroundColor: colors.secondary + '20' }]}>
                <MaterialCommunityIcons name="account-plus-outline" size={44} color={colors.secondary} />
              </View>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Регистрация</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Создайте аккаунт для работы с калькулятором NIHSS
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              label="ФИО / Имя"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              autoCapitalize="words"
              left={<TextInput.Icon icon="account-outline" color={colors.textSecondary} />}
              outlineStyle={styles.inputOutline}
              style={[styles.input, { backgroundColor: colors.surfaceVariant }]}
              textColor={colors.text}
              theme={{ colors: { primary: colors.secondary, outline: colors.border } }}
            />

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
              theme={{ colors: { primary: colors.secondary, outline: colors.border } }}
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
              theme={{ colors: { primary: colors.secondary, outline: colors.border } }}
            />

            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          password.length >= i * 2
                            ? i <= 2
                              ? colors.moderate
                              : colors.no_stroke
                            : colors.border,
                      },
                    ]}
                  />
                ))}
                <Text style={[styles.strengthLabel, { color: colors.textSecondary }]}>
                  {password.length < 4 ? 'Слабый' : password.length < 8 ? 'Средний' : 'Надёжный'}
                </Text>
              </View>
            )}

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.severe + '18', borderColor: colors.severe + '40' }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.severe} />
                <Text style={[styles.errorText, { color: colors.severe }]}>{error}</Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerBtn}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
              buttonColor={colors.secondary}
            >
              Создать аккаунт
            </Button>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
              <Text style={[styles.linkText, { color: colors.textSecondary }]}>Уже есть аккаунт? </Text>
              <Text style={[styles.linkAccent, { color: colors.primary }]}>Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 28, position: 'relative' },
  backBtn: {
    position: 'absolute', left: 0, top: 0,
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  iconRing: {
    width: 104, height: 104, borderRadius: 52,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  iconInner: {
    width: 82, height: 82, borderRadius: 41,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  card: { borderRadius: 24, padding: 24, borderWidth: 1 },
  input: { marginBottom: 12, borderRadius: 12 },
  inputOutline: { borderRadius: 12 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, width: 60, textAlign: 'right' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12,
  },
  errorText: { fontSize: 13, flex: 1 },
  registerBtn: { borderRadius: 14, marginTop: 4 },
  btnContent: { height: 50 },
  btnLabel: { fontSize: 16, fontWeight: '700' },
  loginLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  linkText: { fontSize: 14 },
  linkAccent: { fontSize: 14, fontWeight: '700' },
});
