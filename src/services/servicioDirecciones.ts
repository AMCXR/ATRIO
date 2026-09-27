import { CLAVES_ALMACENAMIENTO, servicioAlmacenamiento } from '@/services/storageService';
import type { DatosDireccion, Direccion } from '@/types';

// Hoy las direcciones viven en el dispositivo (sin usuario). Cuando exista la tabla
// `direcciones` en Supabase, solo cambia el cuerpo de estas funciones.

function generarId(): string {
  return `dir-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function leer(): Promise<Direccion[]> {
  const guardadas = await servicioAlmacenamiento.obtenerDato<Direccion[]>(
    CLAVES_ALMACENAMIENTO.direcciones,
  );
  return guardadas ?? [];
}

async function escribir(lista: Direccion[]): Promise<void> {
  await servicioAlmacenamiento.guardarDato(CLAVES_ALMACENAMIENTO.direcciones, lista);
}

function conUnaPredeterminada(lista: Direccion[], idPredeterminada: string): Direccion[] {
  return lista.map((direccion) => ({
    ...direccion,
    predeterminada: direccion.id === idPredeterminada,
  }));
}

export const servicioDirecciones = {
  async obtenerDirecciones(): Promise<Direccion[]> {
    return leer();
  },

  async crearDireccion(datos: DatosDireccion): Promise<Direccion> {
    const lista = await leer();
    const nueva: Direccion = {
      ...datos,
      id: generarId(),
      usuarioId: null,
      predeterminada: datos.predeterminada || lista.length === 0,
    };
    const siguiente = nueva.predeterminada
      ? conUnaPredeterminada([...lista, nueva], nueva.id)
      : [...lista, nueva];
    await escribir(siguiente);
    return siguiente.find((direccion) => direccion.id === nueva.id) ?? nueva;
  },

  async actualizarDireccion(id: string, datos: DatosDireccion): Promise<Direccion> {
    const lista = await leer();
    const existente = lista.find((direccion) => direccion.id === id);
    if (!existente) throw new Error('La dirección no existe.');

    // La predeterminada actual solo deja de serlo cuando otra pasa a serlo.
    const predeterminada = existente.predeterminada || datos.predeterminada;
    const actualizada: Direccion = { ...existente, ...datos, predeterminada };
    const reemplazada = lista.map((direccion) => (direccion.id === id ? actualizada : direccion));
    const siguiente = predeterminada ? conUnaPredeterminada(reemplazada, id) : reemplazada;
    await escribir(siguiente);
    return siguiente.find((direccion) => direccion.id === id) ?? actualizada;
  },
};
