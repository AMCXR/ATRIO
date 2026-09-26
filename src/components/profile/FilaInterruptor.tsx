import { Switch, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { ESPACIO, MEDIDAS, TIPOGRAFIA } from '@/constants/theme';

interface PropiedadesFilaInterruptor {
  titulo: string;
  descripcion?: string;
  valor: boolean;
  onCambiar: (valor: boolean) => void;
}

export function FilaInterruptor({ titulo, descripcion, valor, onCambiar }: PropiedadesFilaInterruptor) {
  return (
    <View style={styles.fila}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {descripcion ? <Text style={styles.descripcion}>{descripcion}</Text> : null}
      </View>
      <Switch
        value={valor}
        onValueChange={onCambiar}
        trackColor={{ false: COLORS.tinta14, true: COLORS.tinta }}
        thumbColor={COLORS.papel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MEDIDAS.areaTactilMinima,
    paddingHorizontal: MEDIDAS.margenLateral,
    paddingVertical: ESPACIO.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borde,
    gap: ESPACIO.md,
  },
  textos: { flex: 1, gap: 2 },
  titulo: { fontFamily: TIPOGRAFIA.cuerpo, fontSize: 14, color: COLORS.tinta },
  descripcion: { fontFamily: TIPOGRAFIA.mono, fontSize: 11, color: COLORS.textoSecundario },
});