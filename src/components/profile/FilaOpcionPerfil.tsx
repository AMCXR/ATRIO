import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { ESPACIO, MEDIDAS, TIPOGRAFIA } from '@/constants/theme';

interface PropiedadesFilaOpcionPerfil {
  icono: keyof typeof Ionicons.glyphMap;
  texto: string;
  onPress: () => void;
  destructivo?: boolean;
}

export function FilaOpcionPerfil({ icono, texto, onPress, destructivo = false }: PropiedadesFilaOpcionPerfil) {
  const color = destructivo ? COLORS.arcilla : COLORS.tinta;

  return (
    <Pressable
      style={({ pressed }) => [styles.fila, pressed && styles.presionado]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.izquierda}>
        <Ionicons name={icono} size={20} color={color} />
        <Text style={[styles.texto, { color }]}>{texto}</Text>
      </View>
      {!destructivo && <Ionicons name="chevron-forward" size={18} color={COLORS.tinta35} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MEDIDAS.areaTactilMinima,
    paddingHorizontal: MEDIDAS.margenLateral,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borde,
  },
  presionado: { opacity: 0.6 },
  izquierda: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md },
  texto: { fontFamily: TIPOGRAFIA.cuerpo, fontSize: 14 },
});