import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

export default function PantallaPerfil() {
  const { usuario, cerrarSesion } = useAuth();
  const [cerrando, setCerrando] = useState(false);

  async function salir() {
    setCerrando(true);
    await cerrarSesion();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.pantalla}>
      <Text style={styles.marca}>ATRIO</Text>
      <Text style={styles.titulo}>Mi cuenta</Text>
      <View style={styles.detalles}>
        <Text style={styles.nombre}>{usuario?.nombre ?? 'Usuario'}</Text>
        <Text style={styles.email}>{usuario?.email}</Text>
        <Text style={styles.rol}>{usuario?.rol === 'propietaria' ? 'PROPIETARIA' : 'CLIENTE'}</Text>
      </View>
      <Pressable style={styles.boton} onPress={salir} disabled={cerrando} accessibilityRole="button">
        {cerrando ? <ActivityIndicator color={COLORS.arcilla} /> : <Text style={styles.botonTexto}>CERRAR SESIÓN</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, paddingHorizontal: 26, paddingTop: 32, backgroundColor: COLORS.papel },
  marca: { fontFamily: 'Archivo_900Black', fontSize: 26, color: COLORS.tinta },
  titulo: { marginTop: 34, fontFamily: 'Archivo_600SemiBold', fontSize: 20, color: COLORS.tinta },
  detalles: { marginTop: 24, paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.borde },
  nombre: { fontFamily: 'Archivo_600SemiBold', fontSize: 17, color: COLORS.tinta },
  email: { marginTop: 6, fontFamily: 'Archivo_400Regular', fontSize: 13, color: COLORS.textoSecundario },
  rol: { marginTop: 16, fontFamily: 'IBMPlexMono_500Medium', fontSize: 10, color: COLORS.arcilla },
  boton: { height: 52, marginTop: 24, borderWidth: 1, borderColor: COLORS.arcilla, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  botonTexto: { fontFamily: 'Archivo_600SemiBold', fontSize: 12, color: COLORS.arcilla },
});
