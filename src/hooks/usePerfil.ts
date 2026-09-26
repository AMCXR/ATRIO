import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export function usePerfil() {
  const { usuario, cerrarSesion: cerrarSesionAuth } = useAuth();

  const irAMisPedidos = () => router.push('/pedidos');
  const irAFavoritos = () => router.push('/(tabs)/favoritos');
  const irADirecciones = () => router.push('/direcciones');
  const irAMetodosPago = () => router.push('/metodos-pago');
  const irAConfiguracion = () => router.push('/configuracion');
  const irACentroAyuda = () => router.push('/centro-ayuda');

  const cerrarSesion = async () => {
    await cerrarSesionAuth();
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