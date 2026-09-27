import { useCallback, useEffect, useState } from 'react';
import { servicioAdmin } from '@/services/servicioAdmin';
import type { PedidoReciente, ProductoStockBajo, ResumenDashboardAdmin } from '@/types';

interface EstadoAdminDashboard {
  cargando: boolean;
  error: string | null;
  resumen: ResumenDashboardAdmin | null;
  stockBajo: ProductoStockBajo[];
  pedidosRecientes: PedidoReciente[];
  recargar: () => void;
}

// Concentra todo el estado del Dashboard: la pantalla solo lee esto, no
// llama a servicioAdmin directamente.
export function useAdminDashboard(): EstadoAdminDashboard {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<ResumenDashboardAdmin | null>(null);
  const [stockBajo, setStockBajo] = useState<ProductoStockBajo[]>([]);
  const [pedidosRecientes, setPedidosRecientes] = useState<PedidoReciente[]>([]);
  const [version, setVersion] = useState(0);

  const recargar = useCallback(() => setVersion((actual) => actual + 1), []);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    Promise.all([
      servicioAdmin.obtenerResumenDashboard(),
      servicioAdmin.obtenerProductosStockBajo(),
      servicioAdmin.obtenerPedidosRecientes(),
    ])
      .then(([resumenObtenido, stockBajoObtenido, pedidosObtenidos]) => {
        if (cancelado) return;
        setResumen(resumenObtenido);
        setStockBajo(stockBajoObtenido);
        setPedidosRecientes(pedidosObtenidos);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard.');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [version]);

  return { cargando, error, resumen, stockBajo, pedidosRecientes, recargar };
}
