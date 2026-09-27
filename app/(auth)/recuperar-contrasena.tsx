import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { servicioAutenticacion } from '@/services/servicioAutenticacion';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PantallaRecuperarContrasena() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar() {
    const emailLimpio = email.trim();
    if (!CORREO_VALIDO.test(emailLimpio)) {
      setMensaje('Ingresa un correo válido.');
      return;
    }
    setCargando(true);
    setMensaje('');
    try {
      await servicioAutenticacion.solicitarRecuperacion(emailLimpio);
      setMensaje('Solicitud simulada. La recuperación por correo estará disponible cuando conectemos el servicio.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.pantalla}>
      <KeyboardAvoidingView style={styles.flexible} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.contenido, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.marca}>ATRIO</Text>
          <Text style={styles.titulo}>Recupera tu contraseña</Text>
          <Text style={styles.subtitulo}>Ingresa el correo asociado a tu cuenta.</Text>
          {mensaje ? <Text style={styles.mensaje} accessibilityLiveRegion="polite">{mensaje}</Text> : null}
          <Text style={styles.etiqueta}>CORREO</Text>
          <TextInput
            style={styles.entrada}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@correo.com"
            placeholderTextColor={COLORS.tinta35}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!cargando}
            returnKeyType="send"
            onSubmitEditing={enviar}
          />
          <Pressable style={({ pressed }) => [styles.boton, pressed && !cargando && styles.presionado]} onPress={enviar} disabled={cargando} accessibilityRole="button">
            {cargando ? <ActivityIndicator color={COLORS.papel} /> : <Text style={styles.botonTexto}>CONTINUAR</Text>}
          </Pressable>
          <Pressable style={styles.enlace} onPress={() => router.replace('/(auth)/login')} accessibilityRole="link">
            <Text style={styles.enlaceTexto}>Volver a iniciar sesión</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.papel },
  flexible: { flex: 1 },
  contenido: { flexGrow: 1, paddingHorizontal: 26 },
  marca: { fontFamily: 'Archivo_900Black', fontSize: 26, color: COLORS.tinta },
  titulo: { marginTop: 40, fontFamily: 'Archivo_600SemiBold', fontSize: 20, color: COLORS.tinta },
  subtitulo: { marginTop: 8, marginBottom: 24, fontFamily: 'Archivo_400Regular', fontSize: 13, lineHeight: 19, color: COLORS.textoSecundario },
  mensaje: { marginBottom: 14, padding: 12, borderRadius: 6, backgroundColor: COLORS.arcilla10, fontFamily: 'Archivo_500Medium', fontSize: 12, lineHeight: 17, color: COLORS.arcilla },
  etiqueta: { marginBottom: 6, fontFamily: 'IBMPlexMono_600SemiBold', fontSize: 9.5, color: COLORS.tinta50 },
  entrada: { height: 50, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.tinta14, borderRadius: 8, backgroundColor: COLORS.blanco, fontFamily: 'Archivo_400Regular', fontSize: 14, color: COLORS.tinta },
  boton: { height: 54, marginTop: 22, borderRadius: 8, backgroundColor: COLORS.tinta, alignItems: 'center', justifyContent: 'center' },
  presionado: { backgroundColor: COLORS.arcilla },
  botonTexto: { fontFamily: 'Archivo_600SemiBold', fontSize: 13, color: COLORS.papel },
  enlace: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  enlaceTexto: { fontFamily: 'Archivo_500Medium', fontSize: 12.5, color: COLORS.tinta60, textDecorationLine: 'underline' },
});
