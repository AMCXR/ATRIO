import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { ESPACIO, MEDIDAS, TIPOGRAFIA } from '@/constants/theme';
import { EncabezadoPantalla } from '@/components/common/EncabezadoPantalla';
import { FilaOpcionPerfil } from '@/components/profile/FilaOpcionPerfil';
import { usePerfil } from '@/hooks/usePerfil';

export default function PantallaPerfil() {
  const {
    usuario,
    irAMisPedidos,
    irAFavoritos,
    irADirecciones,
    irAMetodosPago,
    irAConfiguracion,
    irACentroAyuda,
    cerrarSesion,
  } = usePerfil();

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <ScrollView>
        <EncabezadoPantalla titulo="Perfil" />

        <View style={styles.tarjetaUsuario}>
          <Text style={styles.nombre}>{usuario.nombre}</Text>
          <Text style={styles.dato}>{usuario.correo}</Text>
          <Text style={styles.dato}>{usuario.telefono}</Text>
        </View>

        <View style={styles.seccion}>
          <FilaOpcionPerfil icono="receipt-outline" texto="Mis pedidos" onPress={irAMisPedidos} />
          <FilaOpcionPerfil icono="heart-outline" texto="Favoritos" onPress={irAFavoritos} />
          <FilaOpcionPerfil icono="location-outline" texto="Direcciones" onPress={irADirecciones} />
          <FilaOpcionPerfil icono="card-outline" texto="Métodos de pago" onPress={irAMetodosPago} />
          <FilaOpcionPerfil icono="settings-outline" texto="Configuración" onPress={irAConfiguracion} />
          <FilaOpcionPerfil icono="help-circle-outline" texto="Centro de ayuda" onPress={irACentroAyuda} />
        </View>

        <View style={styles.seccion}>
          <FilaOpcionPerfil
            icono="log-out-outline"
            texto="Cerrar sesión"
            onPress={cerrarSesion}
            destructivo
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.papel },
  tarjetaUsuario: {
    paddingHorizontal: MEDIDAS.margenLateral,
    paddingBottom: ESPACIO.lg,
    gap: 2,
  },
  nombre: { fontFamily: TIPOGRAFIA.titulo, fontSize: 18, color: COLORS.tinta },
  dato: { fontFamily: TIPOGRAFIA.mono, fontSize: 12, color: COLORS.textoSecundario },
  seccion: { marginTop: ESPACIO.lg },
});