import { router } from 'expo-router';
import { usuarioMock } from '@/data/usuarioMock';
import { servicioAlmacenamiento } from '@/services/storageService';

export function usePerfil() {
  const usuario = usuarioMock; // TODO(alexander-auth): reemplazar por el usuario real del AuthContext

  const irAMisPedidos = () => router.push('/pedidos');
  const irAFavoritos = () => router.push('/(tabs)/favoritos');
  const irADirecciones = () => router.push('/direcciones');
  const irAMetodosPago = () => router.push('/metodos-pago');
  const irAConfiguracion = () => router.push('/configuracion');
  const irACentroAyuda = () => router.push('/centro-ayuda');

  const cerrarSesion = async () => {
    await servicioAlmacenamiento.eliminarTokenSesion();
    router.replace('/(auth)/login');
  };

  return {
    usuario,
    irAMisPedidos,
    irAFavoritos,
    irADirecciones,
    irAMetodosPago,
    irAConfiguracion,
    irACentroAyuda,
    cerrarSesion,
  };
}