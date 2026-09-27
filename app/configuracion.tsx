import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EncabezadoPantalla } from '@/components/common/EncabezadoPantalla';
import { FilaInterruptor } from '@/components/profile/FilaInterruptor';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import { useTema } from '@/hooks/useTema';
import { servicioNotificaciones } from '@/services/servicioNotificaciones';
import { servicioCorreos } from '@/services/servicioCorreos';
import { usuarioMock } from '@/data/usuarioMock';

export default function PantallaConfiguracion() {
  const { preferencias, alternarPreferencia } = useConfiguracion();
  const { colores } = useTema();

  const manejarNotificaciones = async (activar: boolean) => {
    if (activar) {
      const concedido = await servicioNotificaciones.solicitarPermiso();
      if (!concedido) {
        Alert.alert(
          'Permiso denegado',
          'Activa las notificaciones desde los ajustes del sistema para recibir alertas de ATRIO.',
        );
        return;
      }
      await servicioNotificaciones.programarNotificacionPrueba();
    } else {
      await servicioNotificaciones.cancelarTodas();
    }
    alternarPreferencia('notificaciones');
  };

  const manejarCorreosPromocionales = async (activar: boolean) => {
    const exito = activar
      ? await servicioCorreos.suscribir(usuarioMock.correo)
      : await servicioCorreos.cancelarSuscripcion(usuarioMock.correo);

    if (exito) {
      alternarPreferencia('correosPromocionales');
    }
  };

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: colores.papel }]} edges={['top']}>
      <ScrollView>
        <EncabezadoPantalla titulo="Configuración" conBotonVolver />

        <FilaInterruptor
          titulo="Notificaciones"
          descripcion="Alertas de pedidos y novedades"
          valor={preferencias.notificaciones}
          onCambiar={manejarNotificaciones}
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
          onCambiar={manejarCorreosPromocionales}
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
  contenedor: { flex: 1 },
});