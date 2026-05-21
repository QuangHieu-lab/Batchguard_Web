import { createContext, useContext, useState, ReactNode } from 'react';

interface FarmContextType {
  selectedFarmId: string | null;
  setSelectedFarmId: (farmId: string | null) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  return (
    <FarmContext.Provider value={{ selectedFarmId, setSelectedFarmId }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
