import * as LocalAuthentication from 'expo-local-authentication';

export const servicioBiometria = {
  /** Revisa si el dispositivo tiene sensor biométrico Y algo registrado (huella/rostro) */
  async estaDisponible(): Promise<boolean> {
    const tieneHardware = await LocalAuthentication.hasHardwareAsync();
    const tieneRegistrada = await LocalAuthentication.isEnrolledAsync();
    return tieneHardware && tieneRegistrada;
  },

  /** Muestra el prompt biométrico del sistema y espera confirmación */
  async autenticar(mensaje = 'Confirma tu identidad'): Promise<boolean> {
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: mensaje,
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false, // permite usar PIN/patrón como respaldo si falla la huella
    });
    return resultado.success;
  },
};