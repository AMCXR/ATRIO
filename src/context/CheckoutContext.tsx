import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

interface ValorCheckoutContext {
  direccionSeleccionadaId: string | null;
  metodoEntregaId: string | null;
  seleccionarDireccion: (id: string | null) => void;
  seleccionarMetodoEntrega: (id: string | null) => void;
  reiniciarCheckout: () => void;
}

export const CheckoutContext = createContext<ValorCheckoutContext | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState<string | null>(null);
  const [metodoEntregaId, setMetodoEntregaId] = useState<string | null>(null);

  const reiniciarCheckout = useCallback(() => {
    setDireccionSeleccionadaId(null);
    setMetodoEntregaId(null);
  }, []);

  const valor = useMemo<ValorCheckoutContext>(
    () => ({
      direccionSeleccionadaId,
      metodoEntregaId,
      seleccionarDireccion: setDireccionSeleccionadaId,
      seleccionarMetodoEntrega: setMetodoEntregaId,
      reiniciarCheckout,
    }),
    [direccionSeleccionadaId, metodoEntregaId, reiniciarCheckout],
  );

  return <CheckoutContext.Provider value={valor}>{children}</CheckoutContext.Provider>;
}
