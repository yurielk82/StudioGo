import { create } from 'zustand';

type WizardStep = 'studio' | 'date' | 'time' | 'services' | 'confirm';

interface ServiceSelection {
  serviceId: string;
  serviceName: string;
  quantity: number;
  memo: string;
}

interface ReservationWizardState {
  step: WizardStep;
  studioId: string | null;
  studioName: string | null;
  date: string | null;
  timeSlotId: string | null;
  startTime: string | null;
  endTime: string | null;
  holdToken: string | null;
  holdExpiresAt: string | null;
  services: ServiceSelection[];
  memo: string;

  // 액션
  setStudio: (id: string, name: string) => void;
  setDate: (date: string) => void;
  setTimeSlot: (slotId: string, start: string, end: string) => void;
  setHold: (token: string, expiresAt: string) => void;
  addService: (service: ServiceSelection) => void;
  removeService: (serviceId: string) => void;
  updateServiceQuantity: (serviceId: string, quantity: number) => void;
  setMemo: (memo: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: WizardStep) => void;
  reset: () => void;
}

const STEP_ORDER: WizardStep[] = ['studio', 'date', 'time', 'services', 'confirm'];

const INITIAL_STATE = {
  step: 'studio' as WizardStep,
  studioId: null,
  studioName: null,
  date: null,
  timeSlotId: null,
  startTime: null,
  endTime: null,
  holdToken: null,
  holdExpiresAt: null,
  services: [] as ServiceSelection[],
  memo: '',
};

export const useReservationWizardStore = create<ReservationWizardState>((set, get) => ({
  ...INITIAL_STATE,

  setStudio: (id, name) => set({ studioId: id, studioName: name }),
  setDate: (date) => set({ date, timeSlotId: null, startTime: null, endTime: null, holdToken: null }),
  setTimeSlot: (slotId, start, end) => set({ timeSlotId: slotId, startTime: start, endTime: end }),
  setHold: (token, expiresAt) => set({ holdToken: token, holdExpiresAt: expiresAt }),

  addService: (service) =>
    set((state) => ({
      services: [...state.services.filter((s) => s.serviceId !== service.serviceId), service],
    })),
  removeService: (serviceId) =>
    set((state) => ({
      services: state.services.filter((s) => s.serviceId !== serviceId),
    })),
  updateServiceQuantity: (serviceId, quantity) =>
    set((state) => ({
      services: state.services.map((s) =>
        s.serviceId === serviceId ? { ...s, quantity } : s,
      ),
    })),
  setMemo: (memo) => set({ memo }),

  nextStep: () => {
    const current = STEP_ORDER.indexOf(get().step);
    if (current < STEP_ORDER.length - 1) {
      set({ step: STEP_ORDER[current + 1] });
    }
  },
  prevStep: () => {
    const current = STEP_ORDER.indexOf(get().step);
    if (current > 0) {
      set({ step: STEP_ORDER[current - 1] });
    }
  },
  goToStep: (step) => set({ step }),
  reset: () => set(INITIAL_STATE),
}));
