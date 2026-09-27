import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { servicioAlmacenamiento } from '@/services/storageService';

// Tipos de la BD: cuando exista el esquema real, generarlos con la CLI
// (npx supabase gen types typescript --project-id <ID> > src/types/database.ts)
// y pasar el tipo Database a createClient<Database>().

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && anonKey);

const almacenamientoSesion = {
  getItem: (clave: string) => servicioAlmacenamiento.obtenerSecreto(clave),
  setItem: (clave: string, valor: string) => servicioAlmacenamiento.guardarSecreto(clave, valor),
  removeItem: (clave: string) => servicioAlmacenamiento.eliminarSecreto(clave),
};

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: almacenamientoSesion,
        storageKey: 'atrio.supabase.auth',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
