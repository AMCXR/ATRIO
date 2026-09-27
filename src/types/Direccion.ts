export interface Direccion {
  id: string;
  usuarioId: string | null;
  etiqueta?: string;
  direccion: string;
  distrito: string;
  referencia?: string;
  predeterminada: boolean;
}

export type DatosDireccion = Omit<Direccion, 'id' | 'usuarioId'>;
