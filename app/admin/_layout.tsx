import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LayoutAdmin() {
  const { usuario, listo } = useAuth();
  const esPropietaria = usuario?.rol === 'propietaria';

  useEffect(() => {
    if (!listo) return;
    if (!usuario) router.replace('/(auth)/login');
    else if (!esPropietaria) router.replace('/(tabs)');
  }, [esPropietaria, listo, usuario]);

  if (!listo || !esPropietaria) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
