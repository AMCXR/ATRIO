import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CarritoProvider } from '@/context/CarritoContext';
import { FavoritosProvider } from '@/context/FavoritosContext';
import { ConfiguracionProvider } from '@/context/ConfiguracionContext';
import { useFuentesApp } from '@/hooks/useFuentesApp';
import { useTema } from '@/hooks/useTema';

function ContenidoApp() {
  const { colores, esOscuro } = useTema();

  return (
    <>
      <StatusBar style={esOscuro ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colores.papel },
        }}
      />
    </>
  );
}

export default function LayoutRaiz() {
  const fuentesListas = useFuentesApp();

  if (!fuentesListas) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ConfiguracionProvider>
          <FavoritosProvider>
            <CarritoProvider>
              <ContenidoApp />
            </CarritoProvider>
          </FavoritosProvider>
        </ConfiguracionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}