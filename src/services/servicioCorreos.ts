import { Alert, Linking } from 'react-native';

const CORREO_DESTINO = 'promociones@atrio.pe';

function construirUrlCorreo(asunto: string, cuerpo: string) {
  return `mailto:${CORREO_DESTINO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

async function abrirCorreo(url: string): Promise<boolean> {
  const puedeAbrir = await Linking.canOpenURL(url);
  if (!puedeAbrir) {
    Alert.alert(
      'Sin app de correo',
      'No encontramos una aplicación de correo configurada en este dispositivo.',
    );
    return false;
  }
  await Linking.openURL(url);
  return true;
}

export const servicioCorreos = {
  async suscribir(correoUsuario: string): Promise<boolean> {
    const url = construirUrlCorreo(
      'Quiero suscribirme a promociones de ATRIO',
      `Hola,\n\nQuiero suscribirme para recibir correos promocionales y ofertas de ATRIO.\n\nMi correo: ${correoUsuario}`,
    );
    return abrirCorreo(url);
  },

  async cancelarSuscripcion(correoUsuario: string): Promise<boolean> {
    const url = construirUrlCorreo(
      'Darme de baja de promociones de ATRIO',
      `Hola,\n\nQuiero dejar de recibir correos promocionales de ATRIO.\n\nMi correo: ${correoUsuario}`,
    );
    return abrirCorreo(url);
  },
};