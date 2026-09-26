import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { MEDIDAS, TIPOGRAFIA, ESPACIO } from '@/constants/theme';
import { EncabezadoPantalla } from '@/components/common/EncabezadoPantalla';

export default function PantallaCentroAyuda() {
  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <EncabezadoPantalla titulo="Centro de ayuda" conBotonVolver />
        <Text style={styles.pregunta}>¿Cómo hago un pedido?</Text>
        <Text style={styles.respuesta}>
          Agrega productos al carrito desde el catálogo y sigue los pasos del checkout.
        </Text>
        <Text style={styles.pregunta}>¿Cómo contacto soporte?</Text>
        <Text style={styles.respuesta}>Escríbenos a soporte@atrio.pe.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.papel },
  contenido: { paddingHorizontal: MEDIDAS.margenLateral, paddingBottom: ESPACIO.xxl, gap: ESPACIO.xs },
  pregunta: { fontFamily: TIPOGRAFIA.titulo, fontSize: 14, color: COLORS.tinta, marginTop: ESPACIO.md },
  respuesta: { fontFamily: TIPOGRAFIA.cuerpo, fontSize: 13, color: COLORS.textoSecundario, lineHeight: 19 },
});