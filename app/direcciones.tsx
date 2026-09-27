import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EncabezadoPantalla } from '@/components/common/EncabezadoPantalla';
import { EstadoVacio } from '@/components/common/EstadoVacio';
import { BotonPrimario } from '@/components/common/BotonPrimario';
import { FormularioDireccion } from '@/components/checkout/FormularioDireccion';
import { TarjetaDireccion } from '@/components/checkout/TarjetaDireccion';
import { COLORS } from '@/constants/colors';
import { ESPACIO, MEDIDAS } from '@/constants/theme';
import { useDirecciones } from '@/hooks/useDirecciones';
import type { DatosDireccion, Direccion } from '@/types';

type Modo = { tipo: 'lista' } | { tipo: 'crear' } | { tipo: 'editar'; direccion: Direccion };

export default function PantallaDirecciones() {
  const { direcciones, cargando, direccionSeleccionada, seleccionarDireccion, crear, actualizar } =
    useDirecciones();
  const [modo, setModo] = useState<Modo>({ tipo: 'lista' });
  const [guardando, setGuardando] = useState(false);

  const volverALista = () => setModo({ tipo: 'lista' });

  const guardarNueva = async (datos: DatosDireccion) => {
    setGuardando(true);
    try {
      const nueva = await crear(datos);
      // Se selecciona explícitamente: si no fuera la predeterminada, igual debe quedar activa.
      seleccionarDireccion(nueva.id);
      volverALista();
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async (id: string, datos: DatosDireccion) => {
    setGuardando(true);
    try {
      await actualizar(id, datos);
      volverALista();
    } finally {
      setGuardando(false);
    }
  };

  if (modo.tipo === 'crear' || modo.tipo === 'editar') {
    const inicial = modo.tipo === 'editar' ? modo.direccion : undefined;
    return (
      <SafeAreaView style={styles.pantalla} edges={['top']}>
        <EncabezadoPantalla
          titulo={modo.tipo === 'editar' ? 'Editar dirección' : 'Nueva dirección'}
          conBotonVolver
        />
        <ScrollView
          contentContainerStyle={styles.contenidoFormulario}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormularioDireccion
            inicial={inicial}
            yaEsPredeterminada={inicial?.predeterminada ?? false}
            guardando={guardando}
            textoBoton={modo.tipo === 'editar' ? 'Guardar cambios' : 'Guardar dirección'}
            alGuardar={(datos) =>
              modo.tipo === 'editar' ? guardarEdicion(modo.direccion.id, datos) : guardarNueva(datos)
            }
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const sinDirecciones = !cargando && direcciones.length === 0;

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <EncabezadoPantalla titulo="Direcciones" conBotonVolver />

      {sinDirecciones ? (
        <EstadoVacio
          titulo="Aún no tienes direcciones"
          descripcion="Agrega una dirección para recibir tus pedidos."
          textoBoton="AGREGAR DIRECCIÓN"
          alPresionarBoton={() => setModo({ tipo: 'crear' })}
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
            {direcciones.map((direccion) => (
              <TarjetaDireccion
                key={direccion.id}
                direccion={direccion}
                mostrarSeleccion
                seleccionada={direccion.id === direccionSeleccionada?.id}
                alPresionar={() => {
                  seleccionarDireccion(direccion.id);
                  router.back();
                }}
                alEditar={() => setModo({ tipo: 'editar', direccion })}
              />
            ))}
          </ScrollView>
          <View style={styles.barraInferior}>
            <BotonPrimario
              texto="AGREGAR NUEVA DIRECCIÓN"
              variante="contorno"
              onPress={() => setModo({ tipo: 'crear' })}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.papel },
  contenido: {
    paddingHorizontal: MEDIDAS.margenLateral,
    paddingTop: ESPACIO.sm,
    paddingBottom: ESPACIO.xxl,
    gap: ESPACIO.base,
  },
  contenidoFormulario: {
    paddingHorizontal: MEDIDAS.margenLateral,
    paddingTop: ESPACIO.sm,
    paddingBottom: ESPACIO.xxl,
  },
  barraInferior: {
    paddingHorizontal: MEDIDAS.margenLateral,
    paddingTop: ESPACIO.md,
    paddingBottom: ESPACIO.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borde,
    backgroundColor: COLORS.papel,
  },
});
