import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotonCerrarSesionAdmin, NavegacionAdmin } from '@/components/admin/NavegacionAdmin';
import { PantallaEnConstruccion } from '@/components/common/PantallaEnConstruccion';
import { COLORS } from '@/constants/colors';
import { ESPACIO, MEDIDAS } from '@/constants/theme';

// Solo se agrega la navegación principal + logout (responsabilidad de
// Segundo). El contenido de esta pantalla es de Yeiner (productos/variantes)
// y no se toca.
export default function PantallaGestindeproductos() {
  return (
    <View style={styles.pantalla}>
      <SafeAreaView edges={['top']} style={styles.barraSuperior}>
        <BotonCerrarSesionAdmin />
      </SafeAreaView>
      <NavegacionAdmin />
      <PantallaEnConstruccion titulo="Gestión de productos" />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.papel },
  barraSuperior: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: MEDIDAS.margenLateral,
    paddingTop: ESPACIO.sm,
  },
});
