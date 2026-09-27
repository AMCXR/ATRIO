import { CANTIDAD_MAXIMA, CANTIDAD_MINIMA } from '@/context/CarritoContext';
import type {
  DatosDireccion,
  Direccion,
  ItemCarrito,
  MetodoEntrega,
  ProblemaCheckout,
  Producto,
} from '@/types';

export function detectarProblemasSeleccion(
  items: ItemCarrito[],
  metodoEntrega: MetodoEntrega | null,
  direccion: Direccion | null,
): ProblemaCheckout[] {
  const problemas: ProblemaCheckout[] = [];
  if (items.length === 0) {
    problemas.push({ codigo: 'carrito-vacio', mensaje: 'Tu carrito está vacío.' });
  }
  if (!metodoEntrega) {
    problemas.push({ codigo: 'sin-metodo-entrega', mensaje: 'Elige un método de entrega.' });
  } else if (metodoEntrega.tipo === 'envio' && !direccion) {
    problemas.push({
      codigo: 'sin-direccion',
      mensaje: 'Agrega o elige una dirección para el envío.',
    });
  }
  return problemas;
}

export function detectarProblemasCantidad(items: ItemCarrito[]): ProblemaCheckout[] {
  return items
    .filter(
      (item) =>
        !Number.isInteger(item.cantidad) ||
        item.cantidad < CANTIDAD_MINIMA ||
        item.cantidad > CANTIDAD_MAXIMA,
    )
    .map((item) => ({
      codigo: 'cantidad-invalida' as const,
      mensaje: `Revisa la cantidad de «${item.producto.nombre}» (talla ${item.talla}): debe estar entre ${CANTIDAD_MINIMA} y ${CANTIDAD_MAXIMA}.`,
    }));
}

/**
 * Validación de stock solo para UX, con el modelo actual (Producto.stock + tallas[].disponible).
 * La validación definitiva se hará en la nube al confirmar la compra.
 * Cuando exista el modelo de variantes, este es el único lugar que hay que cambiar.
 */
export function detectarProblemasStock(
  items: ItemCarrito[],
  productosActuales: Map<string, Producto>,
): ProblemaCheckout[] {
  const problemas: ProblemaCheckout[] = [];
  const avisados = new Set<string>();
  const pedidoPorProducto = new Map<string, number>();
  for (const item of items) {
    const acumulado = pedidoPorProducto.get(item.producto.id) ?? 0;
    pedidoPorProducto.set(item.producto.id, acumulado + item.cantidad);
  }

  const avisar = (clave: string, mensaje: string) => {
    if (avisados.has(clave)) return;
    avisados.add(clave);
    problemas.push({ codigo: 'sin-stock', mensaje });
  };

  for (const item of items) {
    const nombre = item.producto.nombre;
    const actual = productosActuales.get(item.producto.id);
    if (!actual) {
      avisar(`${item.producto.id}:ausente`, `«${nombre}» ya no está disponible.`);
      continue;
    }
    const talla = actual.tallas.find((t) => t.talla === item.talla);
    if (!talla || !talla.disponible) {
      avisar(
        `${item.producto.id}:${item.talla}`,
        `«${nombre}» ya no está disponible en talla ${item.talla}.`,
      );
      continue;
    }
    const pedido = pedidoPorProducto.get(item.producto.id) ?? 0;
    if (pedido > actual.stock) {
      avisar(
        `${item.producto.id}:stock`,
        actual.stock <= 0
          ? `«${nombre}» está agotado.`
          : `Solo quedan ${actual.stock} unidades de «${nombre}».`,
      );
    }
  }
  return problemas;
}

export interface ErroresDireccion {
  direccion?: string;
  distrito?: string;
}

export function validarDatosDireccion(datos: DatosDireccion): ErroresDireccion {
  const errores: ErroresDireccion = {};
  if (datos.direccion.trim().length < 5) {
    errores.direccion = 'Ingresa una dirección de al menos 5 caracteres.';
  }
  if (datos.distrito.trim().length < 2) {
    errores.distrito = 'Ingresa el distrito.';
  }
  return errores;
}
