import { create } from "zustand";

// S-14o: micro-store de avisos flotantes (sin librerías). ProductCard y
// cualquier otra vista empujan un mensaje; <Toaster/> lo muestra abajo y lo
// retira solo, con colisión de repetición resuelta por key incremental.
export type Toast = {
  id: number;
  message: string;
};

type ToastState = {
  toast: Toast | null;
  show: (message: string) => void;
  dismiss: (id: number) => void;
};

let nextId = 0;

export const useToastStore = create<ToastState>()((set, get) => ({
  toast: null,
  show: (message) => set({ toast: { id: (nextId += 1), message } }),
  dismiss: (id) => {
    if (get().toast?.id === id) set({ toast: null });
  },
}));
