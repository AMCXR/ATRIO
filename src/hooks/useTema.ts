import { COLORS } from '@/constants/colors';
import { COLORS_OSCURO } from '@/constants/coloresOscuro';
import { useConfiguracion } from './useConfiguracion';

export function useTema() {
  const { preferencias } = useConfiguracion();
  const colores = preferencias.modoOscuro ? COLORS_OSCURO : COLORS;
  return { colores, esOscuro: preferencias.modoOscuro };
}