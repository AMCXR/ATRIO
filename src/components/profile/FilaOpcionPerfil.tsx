import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ESPACIO, MEDIDAS, TIPOGRAFIA } from '@/constants/theme';
import { useTema } from '@/hooks/useTema';

interface PropiedadesFilaOpcionPerfil {
  icono: keyof typeof Ionicons.glyphMap;
  texto: string;
  onPress: () => void;
  destructivo?: boolean;
}

export function FilaOpcionPerfil({ icono, texto, onPress, destructivo = false }: PropiedadesFilaOpcionPerfil) {
  const { colores } = useTema();
  const color = destructivo ? colores.arcilla : colores.tinta;

  return (
    <Pressable
      style={({ pressed }) => [styles.fila, { borderBottomColor: colores.borde }, pressed && styles.presionado]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.izquierda}>
        <Ionicons name={icono} size={20} color={color} />
        <Text style={[styles.texto, { color }]}>{texto}</Text>
      </View>
      {!destructivo && <Ionicons name="chevron-forward" size={18} color={colores.tinta35} />}
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
  },
  presionado: { opacity: 0.6 },
  izquierda: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.md },
  texto: { fontFamily: TIPOGRAFIA.cuerpo, fontSize: 14 },
});