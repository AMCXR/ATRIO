import type { ItemCarrito, ResumenCheckout, ResumenCompra } from '@/types';

export const TASA_IGV = 0.18;

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function calcularResumenCompra(
  items: ItemCarrito[],
  porcentajeDescuento = 0,
): ResumenCompra {
  const subtotal = redondear(
    items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0),
  );
  const descuento = redondear(subtotal * (porcentajeDescuento / 100));
  const total = redondear(subtotal - descuento);
  const igv = redondear(total * (TASA_IGV / (1 + TASA_IGV)));
  return { subtotal, descuento, igv, total };
}

// El envío es precio final con IGV incluido, igual que los productos.
export function calcularResumenCheckout(
  resumen: ResumenCompra,
  costoEnvio: number,
): ResumenCheckout {
  const igvEnvio = redondear(costoEnvio * (TASA_IGV / (1 + TASA_IGV)));
  return {
    ...resumen,
    envio: costoEnvio,
    igv: redondear(resumen.igv + igvEnvio),
    total: redondear(resumen.total + costoEnvio),
  };
}
