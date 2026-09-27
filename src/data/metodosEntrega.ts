import type { MetodoEntrega } from '@/types';

// Costos provisionales: pendientes de confirmar con la propietaria.
export const metodosEntrega: MetodoEntrega[] = [
  { id: 'estandar', nombre: 'Envío estándar', descripcion: 'Entrega en 24–48 h', costo: 10, tipo: 'envio' },
  // Express aún no es un requisito confirmado: para quitarlo basta borrar este objeto.
  { id: 'express', nombre: 'Envío express', descripcion: 'Entrega el mismo día', costo: 20, tipo: 'envio' },
  { id: 'retiro', nombre: 'Retiro en tienda', descripcion: 'Las Pirias, Chirinos · sin costo', costo: 0, tipo: 'retiro' },
];
