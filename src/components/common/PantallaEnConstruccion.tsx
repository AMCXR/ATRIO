import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { ESPACIO, TIPOGRAFIA } from '@/constants/theme';
import { useTema } from '@/hooks/useTema';

interface PropiedadesPantallaEnConstruccion {
  titulo: string;
}

export function PantallaEnConstruccion({ titulo }: PropiedadesPantallaEnConstruccion) {
  const { colores } = useTema();

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.papel }]}>
      <View style={styles.centro}>
        <Text style={[styles.titulo, { color: colores.tinta }]}>{titulo}</Text>
        <Text style={[styles.nota, { color: colores.textoSecundario }]}>EN CONSTRUCCIÓN</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: ESPACIO.sm },
  titulo: { fontFamily: TIPOGRAFIA.titulo, fontSize: 20 },
  nota: {
    fontFamily: TIPOGRAFIA.mono,
    fontSize: 10,
    letterSpacing: 1.5,
  },
});