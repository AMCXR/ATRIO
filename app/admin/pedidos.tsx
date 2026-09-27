import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EncabezadoPantalla } from '@/components/common/EncabezadoPantalla';
import { FilaPedidoReciente } from '@/components/admin/FilaPedidoReciente';
import { BotonCerrarSesionAdmin, NavegacionAdmin } from '@/components/admin/NavegacionAdmin';
import { ESPACIO, MEDIDAS, TIPOGRAFIA } from '@/constants/theme';
import { useTema } from '@/hooks/useTema';
import { servicioAdmin } from '@/services/servicioAdmin';
import type { PedidoReciente } from '@/types';

// TODO(hans-pedidos): esta pantalla consume PedidoReciente de forma
// desacoplada (vía servicioAdmin). Cuando exista el módulo real de
// pedidos/ventas, solo cambia la fuente de datos — no esta UI.
export default function PantallaPedidosAdmin() {
  const { colores } = useTema();
  const [pedidos, setPedidos] = useState<PedidoReciente[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    servicioAdmin.obtenerPedidosRecientes(50).then((datos) => {
      if (cancelado) return;
      setPedidos(datos);
      setCargando(false);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <SafeAreaView style={[styles.pantalla, { backgroundColor: colores.papel }]} edges={['top']}>
      <EncabezadoPantalla titulo="Pedidos" subtitulo="VENTAS Y ESTADOS" derecha={<BotonCerrarSesionAdmin />} />
      <NavegacionAdmin />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {cargando ? (
          <Text style={[styles.estado, { color: colores.textoSecundario }]}>Cargando pedidos…</Text>
        ) : pedidos.length === 0 ? (
          <Text style={[styles.estado, { color: colores.textoSecundario }]}>
            Aún no hay pedidos registrados. Esta pantalla ya está conectada al servicio de datos;
            se completará cuando el módulo de pedidos (Hans) empiece a generarlos.
          </Text>
        ) : (
          <View style={[styles.tarjetaLista, { backgroundColor: colores.blanco, borderColor: colores.borde }]}>
            {pedidos.map((pedido) => (
              <FilaPedidoReciente key={pedido.id} pedido={pedido} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: {
    paddingHorizontal: MEDIDAS.margenLateral,
    paddingTop: ESPACIO.base,
    paddingBottom: ESPACIO.xxl,
  },
  tarjetaLista: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  estado: {
    fontFamily: TIPOGRAFIA.cuerpo,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: ESPACIO.xl,
  },
});
