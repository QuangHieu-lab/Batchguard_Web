import { Batch } from './mockData';

export interface Farm {
  id: string;
  name: string;
  owner: string;
  location: string;
  address: string;
  status: 'active' | 'inactive' | 'maintenance';
  cameras: number;
  camerasOnline: number;
  activeBatches: number;
  totalBatches: number;
  completedBatches: number;
  failedBatches: number;
  successRate: number;
  monthlyRevenue: number;
  createdDate: string;
  lastActivity: string;
  operators: string[]; // user emails
  imageUrl: string;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastUpdate: string;
  activeBatches: number;
  imageUrl: string;
  farmId?: string; // Add farmId to link camera to farm
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
  batchesCreated: number;
}

export interface SystemMetrics {
  totalBatchesToday: number;
  activeBatches: number;
  completedBatches: number;
  failedBatches: number;
  successRate: number;
  avgDryingTime: number;
  camerasOnline: number;
  totalCameras: number;
}

export interface RiskAlert {
  id: string;
  batchId: string;
  batchName: string;
  type: 'weather' | 'humidity' | 'temperature' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  location: string;
  status: 'active' | 'resolved';
}

export interface DailyStats {
  date: string;
  totalBatches: number;
  completed: number;
  failed: number;
  successRate: number;
  avgDryingTime: number;
}

export interface AIConfig {
  dryingThreshold: number; // %
  humidityWarning: number; // %
  rainRiskThreshold: number; // %
  temperatureMin: number; // °C
  temperatureMax: number; // °C
  autoAlertEnabled: boolean;
  voiceNotificationEnabled: boolean;
  confidenceThreshold: number; // %
}

export const mockFarms: Farm[] = [
  {
    id: 'farm-01',
    name: 'Hộ A1',
    owner: 'Nguyễn Văn A',
    location: 'Hà Nội',
    address: '123 Đường A1, Hà Nội',
    status: 'active',
    cameras: 3,
    camerasOnline: 2,
    activeBatches: 5,
    totalBatches: 20,
    completedBatches: 10,
    failedBatches: 2,
    successRate: 80,
    monthlyRevenue: 15000000,
    createdDate: '2025-01-15',
    lastActivity: '2026-03-18T14:30:00',
    operators: ['operator1@mylongai.com', 'operator2@mylongai.com'],
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400'
  },
  {
    id: 'farm-02',
    name: 'Hộ B2',
    owner: 'Trần Thị B',
    location: 'Hà Nội',
    address: '456 Đường B2, Hà Nội',
    status: 'active',
    cameras: 4,
    camerasOnline: 3,
    activeBatches: 6,
    totalBatches: 25,
    completedBatches: 12,
    failedBatches: 3,
    successRate: 76,
    monthlyRevenue: 16000000,
    createdDate: '2025-02-20',
    lastActivity: '2026-03-18T14:29:55',
    operators: ['operator1@mylongai.com'],
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400'
  },
  {
    id: 'farm-03',
    name: 'Hộ C3',
    owner: 'Lê Văn C',
    location: 'Hà Nội',
    address: '789 Đường C3, Hà Nội',
    status: 'active',
    cameras: 2,
    camerasOnline: 2,
    activeBatches: 4,
    totalBatches: 15,
    completedBatches: 8,
    failedBatches: 1,
    successRate: 85,
    monthlyRevenue: 14000000,
    createdDate: '2025-03-10',
    lastActivity: '2026-03-18T14:30:02',
    operators: ['operator2@mylongai.com'],
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400'
  },
  {
    id: 'farm-04',
    name: 'Hộ A2',
    owner: 'Phạm Thị D',
    location: 'Hà Nội',
    address: '101 Đường A2, Hà Nội',
    status: 'active',
    cameras: 3,
    camerasOnline: 3,
    activeBatches: 3,
    totalBatches: 18,
    completedBatches: 9,
    failedBatches: 0,
    successRate: 100,
    monthlyRevenue: 17000000,
    createdDate: '2025-04-25',
    lastActivity: '2026-03-18T14:29:50',
    operators: ['operator1@mylongai.com'],
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400'
  },
  {
    id: 'farm-05',
    name: 'Hộ B1',
    owner: 'Nguyễn Văn E',
    location: 'Hà Nội',
    address: '202 Đường B1, Hà Nội',
    
    status: 'inactive',
    cameras: 2,
    camerasOnline: 0,
    activeBatches: 0,
    totalBatches: 10,
    completedBatches: 5,
    failedBatches: 2,
    successRate: 50,
    monthlyRevenue: 10000000,
    createdDate: '2025-05-30',
    lastActivity: '2026-03-18T13:15:00',
    operators: ['operator2@mylongai.com'],
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400'
  },
  {
    id: 'farm-06',
    name: 'Hộ D1',
    owner: 'Trần Thị F',
    location: 'Hà Nội',
    address: '303 Đường D1, Hà Nội',
    status: 'active',
    cameras: 5,
    camerasOnline: 5,
    activeBatches: 7,
    totalBatches: 30,
    completedBatches: 15,
    failedBatches: 5,
    successRate: 60,
    monthlyRevenue: 18000000,
    createdDate: '2025-06-15',
    lastActivity: '2026-03-18T14:30:01',
    operators: ['operator1@mylongai.com', 'operator2@mylongai.com'],
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400'
  }
];

export const mockCameras: Camera[] = [
  {
    id: 'cam-01',
    name: 'Camera A1',
    location: 'Sân phơi A1',
    status: 'online',
    lastUpdate: '2026-03-18T14:30:00',
    activeBatches: 2,
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
    farmId: 'farm-01'
  },
  {
    id: 'cam-02',
    name: 'Camera B2',
    location: 'Sân phơi B2',
    status: 'online',
    lastUpdate: '2026-03-18T14:29:55',
    activeBatches: 1,
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
    farmId: 'farm-02'
  },
  {
    id: 'cam-03',
    name: 'Camera C3',
    location: 'Sân phơi C3',
    status: 'online',
    lastUpdate: '2026-03-18T14:30:02',
    activeBatches: 1,
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
    farmId: 'farm-03'
  },
  {
    id: 'cam-04',
    name: 'Camera A2',
    location: 'Sân phơi A2',
    status: 'online',
    lastUpdate: '2026-03-18T14:29:50',
    activeBatches: 0,
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
    farmId: 'farm-04'
  },
  {
    id: 'cam-05',
    name: 'Camera B1',
    location: 'Sân phơi B1',
    status: 'offline',
    lastUpdate: '2026-03-18T13:15:00',
    activeBatches: 0,
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
    farmId: 'farm-05'
  },
  {
    id: 'cam-06',
    name: 'Camera D1',
    location: 'Sân phơi D1',
    status: 'online',
    lastUpdate: '2026-03-18T14:30:01',
    activeBatches: 1,
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
    farmId: 'farm-06'
  }
];

export const mockUsers: User[] = [
  {
    id: 'user-01',
    email: 'admin@mylongai.com',
    name: 'Nguyễn Văn A',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-03-18T14:00:00',
    batchesCreated: 45
  },
  {
    id: 'user-02',
    email: 'user@example.com',
    name: 'Trần Thị B',
    role: 'user',
    status: 'active',
    lastLogin: '2026-03-18T13:30:00',
    batchesCreated: 23
  },
  {
    id: 'user-03',
    email: 'operator1@mylongai.com',
    name: 'Lê Văn C',
    role: 'user',
    status: 'active',
    lastLogin: '2026-03-18T08:00:00',
    batchesCreated: 67
  },
  {
    id: 'user-04',
    email: 'operator2@mylongai.com',
    name: 'Phạm Thị D',
    role: 'user',
    status: 'active',
    lastLogin: '2026-03-17T16:45:00',
    batchesCreated: 34
  },
  {
    id: 'user-05',
    email: 'test@mylongai.com',
    name: 'Test User',
    role: 'user',
    status: 'inactive',
    lastLogin: '2026-03-10T10:00:00',
    batchesCreated: 5
  }
];

export const mockSystemMetrics: SystemMetrics = {
  totalBatchesToday: 12,
  activeBatches: 5,
  completedBatches: 6,
  failedBatches: 1,
  successRate: 85.7,
  avgDryingTime: 285, // minutes
  camerasOnline: 5,
  totalCameras: 6
};

export const mockRiskAlerts: RiskAlert[] = [
  {
    id: 'alert-01',
    batchId: '3',
    batchName: 'Batch #2024-003',
    type: 'weather',
    severity: 'critical',
    message: 'Nguy cơ mưa cao trong 1-2 giờ tới',
    timestamp: '2026-03-18T14:25:00',
    location: 'Sân phơi C3',
    status: 'active'
  },
  {
    id: 'alert-02',
    batchId: '2',
    batchName: 'Batch #2024-002',
    type: 'humidity',
    severity: 'medium',
    message: 'Độ ẩm cao 65%, theo dõi cẩn thận',
    timestamp: '2026-03-18T14:15:00',
    location: 'Sân phơi B2',
    status: 'active'
  },
  {
    id: 'alert-03',
    batchId: '1',
    batchName: 'Batch #2024-001',
    type: 'system',
    severity: 'low',
    message: 'Batch sắp hoàn thành, chuẩn bị thu bánh',
    timestamp: '2026-03-18T14:00:00',
    location: 'Sân phơi A1',
    status: 'active'
  },
  {
    id: 'alert-04',
    batchId: '103',
    batchName: 'Batch #2024-098',
    type: 'weather',
    severity: 'high',
    message: 'Batch bị hỏng do mưa bất ngờ',
    timestamp: '2026-03-02T11:30:00',
    location: 'Sân phơi C2',
    status: 'resolved'
  }
];

export const mockDailyStats: DailyStats[] = [
  {
    date: '2026-03-18',
    totalBatches: 12,
    completed: 6,
    failed: 1,
    successRate: 85.7,
    avgDryingTime: 285
  },
  {
    date: '2026-03-17',
    totalBatches: 15,
    completed: 13,
    failed: 2,
    successRate: 86.7,
    avgDryingTime: 290
  },
  {
    date: '2026-03-16',
    totalBatches: 10,
    completed: 9,
    failed: 1,
    successRate: 90.0,
    avgDryingTime: 275
  },
  {
    date: '2026-03-15',
    totalBatches: 14,
    completed: 12,
    failed: 2,
    successRate: 85.7,
    avgDryingTime: 295
  },
  {
    date: '2026-03-14',
    totalBatches: 11,
    completed: 10,
    failed: 1,
    successRate: 90.9,
    avgDryingTime: 280
  },
  {
    date: '2026-03-13',
    totalBatches: 13,
    completed: 11,
    failed: 2,
    successRate: 84.6,
    avgDryingTime: 300
  },
  {
    date: '2026-03-12',
    totalBatches: 9,
    completed: 9,
    failed: 0,
    successRate: 100.0,
    avgDryingTime: 270
  }
];

export const defaultAIConfig: AIConfig = {
  dryingThreshold: 95,
  humidityWarning: 70,
  rainRiskThreshold: 60,
  temperatureMin: 25,
  temperatureMax: 40,
  autoAlertEnabled: true,
  voiceNotificationEnabled: true,
  confidenceThreshold: 85
};

// Extended batch data for admin
export const allAdminBatches: Batch[] = [
  {
    id: '1',
    name: 'Batch #2024-001',
    startTime: '2026-03-18T06:00:00',
    location: 'Sân phơi A1',
    notes: 'Mẻ bánh chất lượng cao, thời tiết thuận lợi',
    dryingProgress: 85,
    estimatedTimeRemaining: 60,
    riskLevel: 'low',
    status: 'active',
    temperature: 32,
    humidity: 45,
    weatherRisk: 'Ổn định trong 4 giờ tới',
    createdBy: 'operator1@mylongai.com',
    farmId: 'farm-01'
  },
  {
    id: '2',
    name: 'Batch #2024-002',
    startTime: '2026-03-18T07:30:00',
    location: 'Sân phơi B2',
    notes: 'Theo dõi độ ẩm cẩn thận',
    dryingProgress: 65,
    estimatedTimeRemaining: 120,
    riskLevel: 'medium',
    status: 'active',
    temperature: 31,
    humidity: 52,
    weatherRisk: 'Độ ẩm có thể tăng trong 2 giờ tới',
    createdBy: 'operator2@mylongai.com',
    farmId: 'farm-02'
  },
  {
    id: '3',
    name: 'Batch #2024-003',
    startTime: '2026-03-18T08:00:00',
    location: 'Sân phơi C3',
    notes: 'Cần chuẩn bị thu bánh nếu có mưa',
    dryingProgress: 45,
    estimatedTimeRemaining: 240,
    riskLevel: 'high',
    status: 'active',
    temperature: 30,
    humidity: 65,
    weatherRisk: 'Nguy cơ mưa cao trong 1-2 giờ tới',
    createdBy: 'user@example.com',
    farmId: 'farm-03'
  },
  {
    id: '4',
    name: 'Batch #2024-004',
    startTime: '2026-03-18T09:00:00',
    location: 'Sân phơi D1',
    dryingProgress: 30,
    estimatedTimeRemaining: 300,
    riskLevel: 'low',
    status: 'active',
    temperature: 33,
    humidity: 48,
    weatherRisk: 'Ổn định',
    createdBy: 'operator1@mylongai.com',
    farmId: 'farm-06'
  },
  {
    id: '5',
    name: 'Batch #2024-005',
    startTime: '2026-03-18T10:00:00',
    location: 'Sân phơi A2',
    dryingProgress: 20,
    estimatedTimeRemaining: 360,
    riskLevel: 'low',
    status: 'active',
    temperature: 34,
    humidity: 42,
    weatherRisk: 'Tốt',
    createdBy: 'operator2@mylongai.com',
    farmId: 'farm-04'
  },
  {
    id: '6',
    name: 'Batch #2024-000',
    startTime: '2026-03-18T06:00:00',
    location: 'Sân phơi B1',
    dryingProgress: 100,
    estimatedTimeRemaining: 0,
    riskLevel: 'low',
    status: 'completed',
    temperature: 33,
    humidity: 40,
    weatherRisk: 'Hoàn thành',
    createdBy: 'operator1@mylongai.com',
    farmId: 'farm-01'
  },
  {
    id: '7',
    name: 'Batch #2024-099',
    startTime: '2026-03-17T06:30:00',
    location: 'Sân phơi C1',
    dryingProgress: 100,
    estimatedTimeRemaining: 0,
    riskLevel: 'low',
    status: 'completed',
    temperature: 32,
    humidity: 42,
    weatherRisk: 'Hoàn thành',
    createdBy: 'user@example.com',
    farmId: 'farm-02'
  },
  {
    id: '8',
    name: 'Batch #2024-098',
    startTime: '2026-03-17T07:00:00',
    location: 'Sân phơi D2',
    notes: 'Mưa bất ngờ, không kịp thu bánh',
    dryingProgress: 45,
    estimatedTimeRemaining: 0,
    riskLevel: 'high',
    status: 'failed',
    temperature: 28,
    humidity: 85,
    weatherRisk: 'Hỏng do mưa bất ngờ',
    createdBy: 'operator2@mylongai.com',
    farmId: 'farm-03'
  }
];

export const hourlyBatchData = [
  { hour: '06:00', active: 2, completed: 0, failed: 0 },
  { hour: '07:00', active: 3, completed: 0, failed: 0 },
  { hour: '08:00', active: 4, completed: 0, failed: 0 },
  { hour: '09:00', active: 5, completed: 0, failed: 0 },
  { hour: '10:00', active: 5, completed: 1, failed: 0 },
  { hour: '11:00', active: 4, completed: 2, failed: 0 },
  { hour: '12:00', active: 4, completed: 3, failed: 0 },
  { hour: '13:00', active: 5, completed: 4, failed: 0 },
  { hour: '14:00', active: 5, completed: 5, failed: 1 },
  { hour: '15:00', active: 5, completed: 6, failed: 1 }
];

// Revenue Data
export interface BatchRevenue {
  id: string;
  batchName: string;
  status: 'sold' | 'in_stock' | 'failed';
  qualityGrade: 'A' | 'B' | 'C' | 'failed';
  quantity: number; // kg
  pricePerKg: number; // VND
  totalRevenue: number; // VND
  completedDate: string;
  soldDate?: string;
  farmId?: string; // Add farmId to link to farm
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  batches: number;
  avgPrice: number;
}

export interface RevenueMetrics {
  today: number;
  week: number;
  month: number;
  avgPerBatch: number;
  conversionRate: number; // % batch thành công được bán
  growth: {
    today: number;
    week: number;
    month: number;
  };
}

export const mockBatchRevenue: BatchRevenue[] = [
  {
    id: '1',
    batchName: 'Batch #2024-001',
    status: 'sold',
    qualityGrade: 'A',
    quantity: 45,
    pricePerKg: 85000,
    totalRevenue: 3825000,
    completedDate: '2026-03-18T14:30:00',
    soldDate: '2026-03-18T15:00:00',
    farmId: 'farm-01'
  },
  {
    id: '6',
    batchName: 'Batch #2024-000',
    status: 'sold',
    qualityGrade: 'A',
    quantity: 50,
    pricePerKg: 85000,
    totalRevenue: 4250000,
    completedDate: '2026-03-18T12:00:00',
    soldDate: '2026-03-18T13:00:00',
    farmId: 'farm-01'
  },
  {
    id: '7',
    batchName: 'Batch #2024-099',
    status: 'sold',
    qualityGrade: 'B',
    quantity: 48,
    pricePerKg: 75000,
    totalRevenue: 3600000,
    completedDate: '2026-03-17T14:30:00',
    soldDate: '2026-03-17T16:00:00',
    farmId: 'farm-02'
  },
  {
    id: '8',
    batchName: 'Batch #2024-098',
    status: 'failed',
    qualityGrade: 'failed',
    quantity: 0,
    pricePerKg: 0,
    totalRevenue: 0,
    completedDate: '2026-03-17T11:30:00',
    farmId: 'farm-03'
  },
  {
    id: '9',
    batchName: 'Batch #2024-097',
    status: 'sold',
    qualityGrade: 'A',
    quantity: 52,
    pricePerKg: 85000,
    totalRevenue: 4420000,
    completedDate: '2026-03-16T13:00:00',
    soldDate: '2026-03-16T14:30:00',
    farmId: 'farm-02'
  },
  {
    id: '10',
    batchName: 'Batch #2024-096',
    status: 'sold',
    qualityGrade: 'B',
    quantity: 46,
    pricePerKg: 75000,
    totalRevenue: 3450000,
    completedDate: '2026-03-16T15:00:00',
    soldDate: '2026-03-16T16:00:00',
    farmId: 'farm-03'
  },
  {
    id: '11',
    batchName: 'Batch #2024-095',
    status: 'sold',
    qualityGrade: 'A',
    quantity: 49,
    pricePerKg: 85000,
    totalRevenue: 4165000,
    completedDate: '2026-03-15T12:30:00',
    soldDate: '2026-03-15T14:00:00',
    farmId: 'farm-04'
  },
  {
    id: '12',
    batchName: 'Batch #2024-094',
    status: 'sold',
    qualityGrade: 'C',
    quantity: 44,
    pricePerKg: 60000,
    totalRevenue: 2640000,
    completedDate: '2026-03-15T16:00:00',
    soldDate: '2026-03-15T17:00:00',
    farmId: 'farm-06'
  },
  {
    id: '13',
    batchName: 'Batch #2024-093',
    status: 'sold',
    qualityGrade: 'A',
    quantity: 51,
    pricePerKg: 85000,
    totalRevenue: 4335000,
    completedDate: '2026-03-14T13:00:00',
    soldDate: '2026-03-14T15:00:00',
    farmId: 'farm-01'
  },
  {
    id: '14',
    batchName: 'Batch #2024-092',
    status: 'sold',
    qualityGrade: 'B',
    quantity: 47,
    pricePerKg: 75000,
    totalRevenue: 3525000,
    completedDate: '2026-03-14T14:30:00',
    soldDate: '2026-03-14T16:00:00',
    farmId: 'farm-02'
  }
];

export const mockDailyRevenue: DailyRevenue[] = [
  { date: '2026-03-18', revenue: 8075000, batches: 2, avgPrice: 4037500 },
  { date: '2026-03-17', revenue: 3600000, batches: 1, avgPrice: 3600000 },
  { date: '2026-03-16', revenue: 7870000, batches: 2, avgPrice: 3935000 },
  { date: '2026-03-15', revenue: 6805000, batches: 2, avgPrice: 3402500 },
  { date: '2026-03-14', revenue: 7860000, batches: 2, avgPrice: 3930000 },
  { date: '2026-03-13', revenue: 9180000, batches: 3, avgPrice: 3060000 },
  { date: '2026-03-12', revenue: 8925000, batches: 3, avgPrice: 2975000 }
];

// Last 30 days revenue data
export const mockMonthlyRevenue: DailyRevenue[] = [
  { date: '2026-02-17', revenue: 7200000, batches: 2, avgPrice: 3600000 },
  { date: '2026-02-18', revenue: 8100000, batches: 2, avgPrice: 4050000 },
  { date: '2026-02-19', revenue: 7500000, batches: 2, avgPrice: 3750000 },
  { date: '2026-02-20', revenue: 9000000, batches: 3, avgPrice: 3000000 },
  { date: '2026-02-21', revenue: 8400000, batches: 2, avgPrice: 4200000 },
  { date: '2026-02-22', revenue: 7800000, batches: 2, avgPrice: 3900000 },
  { date: '2026-02-23', revenue: 8700000, batches: 3, avgPrice: 2900000 },
  { date: '2026-02-24', revenue: 9300000, batches: 3, avgPrice: 3100000 },
  { date: '2026-02-25', revenue: 8100000, batches: 2, avgPrice: 4050000 },
  { date: '2026-02-26', revenue: 7650000, batches: 2, avgPrice: 3825000 },
  { date: '2026-02-27', revenue: 8850000, batches: 3, avgPrice: 2950000 },
  { date: '2026-02-28', revenue: 9150000, batches: 3, avgPrice: 3050000 },
  { date: '2026-03-01', revenue: 8400000, batches: 2, avgPrice: 4200000 },
  { date: '2026-03-02', revenue: 7200000, batches: 2, avgPrice: 3600000 },
  { date: '2026-03-03', revenue: 8550000, batches: 3, avgPrice: 2850000 },
  { date: '2026-03-04', revenue: 9000000, batches: 3, avgPrice: 3000000 },
  { date: '2026-03-05', revenue: 7950000, batches: 2, avgPrice: 3975000 },
  { date: '2026-03-06', revenue: 8700000, batches: 2, avgPrice: 4350000 },
  { date: '2026-03-07', revenue: 9300000, batches: 3, avgPrice: 3100000 },
  { date: '2026-03-08', revenue: 8250000, batches: 2, avgPrice: 4125000 },
  { date: '2026-03-09', revenue: 7800000, batches: 2, avgPrice: 3900000 },
  { date: '2026-03-10', revenue: 8400000, batches: 3, avgPrice: 2800000 },
  { date: '2026-03-11', revenue: 9150000, batches: 3, avgPrice: 3050000 },
  { date: '2026-03-12', revenue: 8925000, batches: 3, avgPrice: 2975000 },
  { date: '2026-03-13', revenue: 9180000, batches: 3, avgPrice: 3060000 },
  { date: '2026-03-14', revenue: 7860000, batches: 2, avgPrice: 3930000 },
  { date: '2026-03-15', revenue: 6805000, batches: 2, avgPrice: 3402500 },
  { date: '2026-03-16', revenue: 7870000, batches: 2, avgPrice: 3935000 },
  { date: '2026-03-17', revenue: 3600000, batches: 1, avgPrice: 3600000 },
  { date: '2026-03-18', revenue: 8075000, batches: 2, avgPrice: 4037500 }
];

export const mockRevenueMetrics: RevenueMetrics = {
  today: 8075000,
  week: 52315000, // 7 days
  month: 246180000, // 30 days
  avgPerBatch: 3850000,
  conversionRate: 88.5, // % batch completed -> sold
  growth: {
    today: 124.3, // % vs yesterday
    week: 8.5, // % vs last week
    month: 12.3 // % vs last month
  }
};

// Year-over-Year comparison data
export interface MonthlyRevenueComparison {
  month: string;
  monthNumber: number;
  currentYear: number;
  previousYear: number;
  growth: number;
  batches2026: number;
  batches2025: number;
}

export const mockYearOverYearRevenue: MonthlyRevenueComparison[] = [
  { month: 'Tháng 1', monthNumber: 1, currentYear: 245600000, previousYear: 198500000, growth: 23.7, batches2026: 65, batches2025: 52 },
  { month: 'Tháng 2', monthNumber: 2, currentYear: 268900000, previousYear: 215300000, growth: 24.9, batches2026: 71, batches2025: 58 },
  { month: 'Tháng 3', monthNumber: 3, currentYear: 246180000, previousYear: 224700000, growth: 9.6, batches2026: 64, batches2025: 61 },
  { month: 'Tháng 4', monthNumber: 4, currentYear: 0, previousYear: 235800000, growth: 0, batches2026: 0, batches2025: 63 },
  { month: 'Tháng 5', monthNumber: 5, currentYear: 0, previousYear: 258900000, growth: 0, batches2026: 0, batches2025: 68 },
  { month: 'Tháng 6', monthNumber: 6, currentYear: 0, previousYear: 271200000, growth: 0, batches2026: 0, batches2025: 72 },
  { month: 'Tháng 7', monthNumber: 7, currentYear: 0, previousYear: 289500000, growth: 0, batches2026: 0, batches2025: 76 },
  { month: 'Tháng 8', monthNumber: 8, currentYear: 0, previousYear: 295600000, growth: 0, batches2026: 0, batches2025: 78 },
  { month: 'Tháng 9', monthNumber: 9, currentYear: 0, previousYear: 278300000, growth: 0, batches2026: 0, batches2025: 74 },
  { month: 'Tháng 10', monthNumber: 10, currentYear: 0, previousYear: 262400000, growth: 0, batches2026: 0, batches2025: 70 },
  { month: 'Tháng 11', monthNumber: 11, currentYear: 0, previousYear: 248900000, growth: 0, batches2026: 0, batches2025: 66 },
  { month: 'Tháng 12', monthNumber: 12, currentYear: 0, previousYear: 255700000, growth: 0, batches2026: 0, batches2025: 68 },
];

export const yearOverYearSummary = {
  totalRevenue2026: 760680000, // Jan + Feb + Mar
  totalRevenue2025: 3034800000, // Full year 2025
  ytdRevenue2025: 638500000, // Jan + Feb + Mar 2025
  ytdGrowth: 19.1, // % growth YTD
  totalBatches2026: 200,
  totalBatches2025: 806,
  ytdBatches2025: 171,
  avgRevenue2026: 3803400,
  avgRevenue2025: 3763934,
};