import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { ESPACIO, RADIO, TIPOGRAFIA } from '@/constants/theme';
import { useTema } from '@/hooks/useTema';

interface PropiedadesTarjetaIndicador {
  titulo: string;
  valor: string;
  icono: keyof typeof Ionicons.glyphMap;
  descripcion?: string;
}

export function TarjetaIndicador({ titulo, valor, icono, descripcion }: PropiedadesTarjetaIndicador) {
  const { colores } = useTema();

  return (
    <View style={[styles.contenedor, { backgroundColor: colores.blanco, borderColor: colores.borde }]}>
      <View style={styles.encabezado}>
        <Ionicons name={icono} size={16} color={colores.tinta50} />
        <Text style={[styles.titulo, { color: colores.textoSecundario }]}>{titulo}</Text>
      </View>
      <Text style={[styles.valor, { color: colores.tinta }]}>{valor}</Text>
      {descripcion ? (
        <Text style={[styles.descripcion, { color: colores.textoSecundario }]}>{descripcion}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: RADIO.resumen,
    padding: ESPACIO.base,
    gap: ESPACIO.xs,
  },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.xs },
  titulo: {
    fontFamily: TIPOGRAFIA.mono,
    fontSize: 9.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  valor: { fontFamily: TIPOGRAFIA.monoFuerte, fontSize: 19 },
  descripcion: { fontFamily: TIPOGRAFIA.cuerpo, fontSize: 11 },
});
