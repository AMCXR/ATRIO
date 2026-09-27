import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MEDIDAS, TIPOGRAFIA, ESPACIO } from '@/constants/theme';
import { EncabezadoPantalla } from '@/components/common/EncabezadoPantalla';
import { useTema } from '@/hooks/useTema';

export default function PantallaCentroAyuda() {
  const { colores } = useTema();

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.papel }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <EncabezadoPantalla titulo="Centro de ayuda" conBotonVolver />
        <Text style={[styles.pregunta, { color: colores.tinta }]}>¿Cómo hago un pedido?</Text>
        <Text style={[styles.respuesta, { color: colores.textoSecundario }]}>
          Agrega productos al carrito desde el catálogo y sigue los pasos del checkout.
        </Text>
        <Text style={[styles.pregunta, { color: colores.tinta }]}>¿Cómo contacto soporte?</Text>
        <Text style={[styles.respuesta, { color: colores.textoSecundario }]}>Escríbenos a soporte@atrio.pe.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  contenido: { paddingHorizontal: MEDIDAS.margenLateral, paddingBottom: ESPACIO.xxl, gap: ESPACIO.xs },
  pregunta: { fontFamily: TIPOGRAFIA.titulo, fontSize: 14, marginTop: ESPACIO.md },
  respuesta: { fontFamily: TIPOGRAFIA.cuerpo, fontSize: 13, lineHeight: 19 },
});