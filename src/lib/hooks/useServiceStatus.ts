import { create } from 'zustand';

interface ServiceStatusStore {
  showServiceIssue: boolean;
  setShowServiceIssue: (show: boolean) => void;
}

export const useServiceStatus = create<ServiceStatusStore>((set) => ({
  showServiceIssue: false,
  setShowServiceIssue: (show) => set({ showServiceIssue: show }),
})); 