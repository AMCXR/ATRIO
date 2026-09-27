import { useContext } from 'react';
import { CheckoutContext } from '@/context/CheckoutContext';

export function useSeleccionCheckout() {
  const contexto = useContext(CheckoutContext);
  if (!contexto) {
    throw new Error('useSeleccionCheckout debe usarse dentro de <CheckoutProvider>');
  }
  return contexto;
}
