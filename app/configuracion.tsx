import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { EncabezadoPantalla } from '@/components/common/EncabezadoPantalla';
import { FilaInterruptor } from '@/components/profile/FilaInterruptor';
import { useConfiguracion } from '@/hooks/useConfiguracion';

export default function PantallaConfiguracion() {
  const { preferencias, alternarPreferencia } = useConfiguracion();

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <ScrollView>
        <EncabezadoPantalla titulo="Configuración" conBotonVolver />

        <FilaInterruptor
          titulo="Notificaciones"
          descripcion="Alertas de pedidos y novedades"
          valor={preferencias.notificaciones}
          onCambiar={() => alternarPreferencia('notificaciones')}
        />
        <FilaInterruptor
          titulo="Modo oscuro"
          valor={preferencias.modoOscuro}
          onCambiar={() => alternarPreferencia('modoOscuro')}
        />
        <FilaInterruptor
          titulo="Correos promocionales"
          descripcion="Ofertas y descuentos por correo"
          valor={preferencias.correosPromocionales}
          onCambiar={() => alternarPreferencia('correosPromocionales')}
        />
        <FilaInterruptor
          titulo="Biometría"
          descripcion="Desbloquear con huella o rostro"
          valor={preferencias.biometria}
          onCambiar={() => alternarPreferencia('biometria')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.papel },
});