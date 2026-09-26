export type RolUsuario = 'cliente' | 'propietaria';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  celular: string;
  rol: RolUsuario;
}