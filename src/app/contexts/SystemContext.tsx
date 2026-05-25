import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Batch {
  id: string;
  startTime: Date;
  location: string;
  dryness: number;
  estimatedCompletion: Date;
  risk: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'warning';
  temperature: number;
  humidity: number;
  timeRemaining: number; // in minutes
  completionDuration?: number; // in minutes - for completed batches
  outcome?: 'success' | 'early_collection' | 'warning_completed'; // for completed batches
  notes?: string; // special notes
}

interface SystemContextType {
  isOnline: boolean;
  lastSync: Date | null;
  cameraStatus: 'online' | 'offline';
  isDetecting: boolean;
  activeBatch: Batch | null;
  batchHistory: Batch[];
  setIsAnalyzing: (value: boolean) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

// Generate realistic mock data
function generateBatch(location: string): Batch {
  const now = new Date();
  const completionTime = new Date(now.getTime() + (180 + Math.random() * 120) * 60000); // 3-5 hours
  const timeRemaining = Math.floor((completionTime.getTime() - now.getTime()) / 60000);
  const dryness = Math.floor(Math.random() * 15); // Start at 0-15%
  
  // Risk based on time of day and weather simulation
  const hour = now.getHours();
  let risk: 'low' | 'medium' | 'high' = 'low';
  if (hour > 16 || hour < 8) risk = 'high'; // Late afternoon or early morning
  else if (hour > 14) risk = 'medium'; // Afternoon
  
  return {
    id: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    startTime: now,
    location,
    dryness,
    estimatedCompletion: completionTime,
    risk,
    status: 'active',
    temperature: 28 + Math.random() * 8, // 28-36°C
    humidity: 45 + Math.random() * 20, // 45-65%
    timeRemaining,
  };
}

// Generate initial historical data for realistic prototype
function generateHistoricalBatches(): Batch[] {
  const batches: Batch[] = [];
  const now = new Date();
  
  // Create batches for the last 7 days
  const batchData: Array<{
    day: number;
    time: string;
    duration: number;
    risk: 'low' | 'medium' | 'high';
    outcome: 'success' | 'early_collection' | 'warning_completed';
    location: string;
    temp: number;
    hum: number;
    notes?: string;
  }> = [
    { day: 0, time: '06:30', duration: 260, risk: 'low', outcome: 'success', location: 'Khu vực A', temp: 32, hum: 42 },
    { day: 0, time: '08:15', duration: 310, risk: 'medium', outcome: 'success', location: 'Khu vực B', temp: 31, hum: 48, notes: 'Độ ẩm tăng nhẹ buổi chiều' },
    { day: 1, time: '07:00', duration: 245, risk: 'low', outcome: 'success', location: 'Khu vực C', temp: 33, hum: 40 },
    { day: 1, time: '09:30', duration: 195, risk: 'high', outcome: 'early_collection', location: 'Khu vực A', temp: 30, hum: 62, notes: 'Thu sớm do dự báo mưa' },
    { day: 2, time: '06:15', duration: 285, risk: 'medium', outcome: 'success', location: 'Khu vực D', temp: 31, hum: 51 },
    { day: 2, time: '08:45', duration: 270, risk: 'low', outcome: 'success', location: 'Khu vực B', temp: 33, hum: 44 },
    { day: 3, time: '07:30', duration: 255, risk: 'low', outcome: 'success', location: 'Khu vực A', temp: 32, hum: 43 },
    { day: 4, time: '06:00', duration: 320, risk: 'high', outcome: 'warning_completed', location: 'Khu vực C', temp: 29, hum: 65, notes: 'Hoàn thành dù độ ẩm cao' },
    { day: 4, time: '09:00', duration: 240, risk: 'low', outcome: 'success', location: 'Khu vực B', temp: 34, hum: 38 },
    { day: 5, time: '07:15', duration: 265, risk: 'medium', outcome: 'success', location: 'Khu vực D', temp: 31, hum: 49 },
    { day: 6, time: '06:45', duration: 280, risk: 'low', outcome: 'success', location: 'Khu vực A', temp: 33, hum: 41 },
    { day: 6, time: '08:30', duration: 295, risk: 'low', outcome: 'success', location: 'Khu vực C', temp: 32, hum: 45 },
  ];
  
  batchData.forEach((data, index) => {
    const batchDate = new Date(now);
    batchDate.setDate(batchDate.getDate() - data.day);
    const [hours, minutes] = data.time.split(':').map(Number);
    batchDate.setHours(hours, minutes, 0, 0);
    
    const completionDate = new Date(batchDate.getTime() + data.duration * 60000);
    
    batches.push({
      id: `BATCH-${(now.getTime() - data.day * 86400000 - index * 1000).toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      startTime: batchDate,
      location: data.location,
      dryness: 100,
      estimatedCompletion: completionDate,
      risk: data.risk,
      status: 'completed',
      temperature: data.temp,
      humidity: data.hum,
      timeRemaining: 0,
      completionDuration: data.duration,
      outcome: data.outcome,
      notes: data.notes,
    });
  });
  
  return batches.reverse(); // Most recent first
}

export function SystemProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(new Date());
  const [cameraStatus, setCameraStatus] = useState<'online' | 'offline'>('online');
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [batchHistory, setBatchHistory] = useState<Batch[]>(generateHistoricalBatches());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulate camera detection cycles
  useEffect(() => {
    // Camera stays online
    setCameraStatus('online');

    const timeouts: number[] = [];

    // Simulate AI detection cycles
    const detectionCycle = window.setInterval(() => {
      setIsDetecting(true);
      
      // After 2-4 seconds of detecting, decide if batch is found
      const detectTimeout = window.setTimeout(() => {
        setIsDetecting(false);
        
        // 70% chance to detect a batch if no active batch
        setActiveBatch(current => {
          if (!current && Math.random() > 0.3) {
            const locations = ['Khu vực A', 'Khu vực B', 'Khu vực C', 'Khu vực D'];
            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            return generateBatch(randomLocation);
          }
          return current;
        });
      }, 2000 + Math.random() * 2000);
      
      timeouts.push(detectTimeout);
    }, 15000); // Check every 15 seconds

    return () => {
      clearInterval(detectionCycle);
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Update active batch progress
  useEffect(() => {
    const updateInterval = window.setInterval(() => {
      setActiveBatch(prev => {
        if (!prev) return null;

        const newDryness = Math.min(100, prev.dryness + 0.5 + Math.random() * 1);
        const now = new Date();
        const timeRemaining = Math.floor((prev.estimatedCompletion.getTime() - now.getTime()) / 60000);

        // Update risk based on progress and conditions
        let newRisk = prev.risk;
        if (newDryness > 85 && timeRemaining > 30) newRisk = 'high';
        else if (newDryness > 70 && timeRemaining > 60) newRisk = 'medium';
        else if (newDryness < 50) newRisk = 'low';

        const newStatus: Batch['status'] = newDryness >= 100 ? 'completed' : 
                         newRisk === 'high' ? 'warning' : 'active';

        const updated: Batch = {
          ...prev,
          dryness: newDryness,
          timeRemaining: Math.max(0, timeRemaining),
          risk: newRisk,
          status: newStatus,
          temperature: prev.temperature + (Math.random() - 0.5) * 2,
          humidity: Math.max(30, Math.min(80, prev.humidity + (Math.random() - 0.5) * 3)),
        };

        // If completed, move to history
        if (newDryness >= 100) {
          window.setTimeout(() => {
            const completedBatch: Batch = {
              ...updated,
              status: 'completed',
              completionDuration: Math.floor((updated.estimatedCompletion.getTime() - updated.startTime.getTime()) / 60000),
              outcome: updated.risk === 'high' ? 'early_collection' : 
                       updated.risk === 'medium' ? 'warning_completed' : 'success',
            };
            setBatchHistory(history => [completedBatch, ...history]);
            setActiveBatch(null);
          }, 1000);
        }

        return updated;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(updateInterval);
  }, []);

  // Handle online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate periodic sync
    const syncInterval = window.setInterval(() => {
      setLastSync(new Date());
    }, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  return (
    <SystemContext.Provider
      value={{
        isOnline,
        lastSync,
        cameraStatus,
        isDetecting,
        activeBatch,
        batchHistory,
        setIsAnalyzing,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}
