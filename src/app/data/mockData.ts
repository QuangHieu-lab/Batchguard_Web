export interface Batch {
  id: string;
  name: string;
  startTime: string;
  location?: string;
  notes?: string;
  dryingProgress: number; // 0-100
  estimatedTimeRemaining: number; // in minutes
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'failed';
  temperature: number;
  humidity: number;
  weatherRisk: string;
  createdBy?: string;
  farmId?: string; // Link to farm
}

export interface HistoricalData {
  time: string;
  progress: number;
  humidity: number;
  temperature: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  time: string;
  actionRequired: string;
}

export const mockBatches: Batch[] = [
  {
    id: '1',
    name: 'Batch #2024-001',
    startTime: '2026-03-05T06:00:00',
    location: 'Sân phơi A1',
    notes: 'Mẻ bánh chất lượng cao, thời tiết thuận lợi',
    dryingProgress: 75,
    estimatedTimeRemaining: 90,
    riskLevel: 'low',
    status: 'active',
    temperature: 32,
    humidity: 45,
    weatherRisk: 'Ổn định trong 4 giờ tới',
    createdBy: 'user@example.com'
  },
  {
    id: '2',
    name: 'Batch #2024-002',
    startTime: '2026-03-05T07:30:00',
    location: 'Sân phơi B2',
    notes: 'Theo dõi độ ẩm cẩn thận',
    dryingProgress: 55,
    estimatedTimeRemaining: 180,
    riskLevel: 'medium',
    status: 'active',
    temperature: 31,
    humidity: 52,
    weatherRisk: 'Độ ẩm có thể tăng trong 2 giờ tới',
    createdBy: 'user@example.com'
  },
  {
    id: '3',
    name: 'Batch #2024-003',
    startTime: '2026-03-05T08:00:00',
    location: 'Sân phơi C3',
    notes: 'Cần chuẩn bị thu bánh nếu có mưa',
    dryingProgress: 30,
    estimatedTimeRemaining: 300,
    riskLevel: 'high',
    status: 'active',
    temperature: 30,
    humidity: 65,
    weatherRisk: 'Nguy cơ mưa cao trong 1-2 giờ tới',
    createdBy: 'user@example.com'
  },
  {
    id: '4',
    name: 'Batch #2024-000',
    startTime: '2026-03-04T06:00:00',
    location: 'Sân phơi A1',
    dryingProgress: 100,
    estimatedTimeRemaining: 0,
    riskLevel: 'low',
    status: 'completed',
    temperature: 33,
    humidity: 40,
    weatherRisk: 'Hoàn thành',
    createdBy: 'user@example.com'
  }
];

export const mockHistoricalData: HistoricalData[] = [
  { time: '06:00', progress: 0, humidity: 75, temperature: 28 },
  { time: '07:00', progress: 12, humidity: 70, temperature: 29 },
  { time: '08:00', progress: 25, humidity: 65, temperature: 30 },
  { time: '09:00', progress: 38, humidity: 60, temperature: 31 },
  { time: '10:00', progress: 48, humidity: 55, temperature: 32 },
  { time: '11:00', progress: 58, humidity: 50, temperature: 33 },
  { time: '12:00', progress: 68, humidity: 48, temperature: 34 },
  { time: '13:00', progress: 75, humidity: 45, temperature: 32 },
  { time: '14:00', progress: 82, humidity: 43, temperature: 31 },
  { time: '15:00', progress: 90, humidity: 42, temperature: 30 },
  { time: '16:00', progress: 100, humidity: 40, temperature: 29 },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    message: 'Độ ẩm dự kiến tăng lên 65% trong 2 giờ tới',
    time: '14:30',
    actionRequired: 'Theo dõi tiến độ khô, chuẩn bị thu bánh nếu cần'
  },
  {
    id: '2',
    type: 'info',
    message: 'Batch đạt 75% tiến độ khô',
    time: '13:45',
    actionRequired: 'Có thể thu bánh trong 90 phút tới'
  }
];

export const completedBatches: Batch[] = [
  {
    id: '101',
    name: 'Batch #2024-000',
    startTime: '2026-03-04T06:00:00',
    location: 'Sân phơi A1',
    dryingProgress: 100,
    estimatedTimeRemaining: 0,
    riskLevel: 'low',
    status: 'completed',
    temperature: 33,
    humidity: 40,
    weatherRisk: 'Hoàn thành thành công',
    createdBy: 'user@example.com'
  },
  {
    id: '102',
    name: 'Batch #2024-099',
    startTime: '2026-03-03T06:30:00',
    location: 'Sân phơi B1',
    dryingProgress: 100,
    estimatedTimeRemaining: 0,
    riskLevel: 'low',
    status: 'completed',
    temperature: 32,
    humidity: 42,
    weatherRisk: 'Hoàn thành thành công',
    createdBy: 'user@example.com'
  },
  {
    id: '103',
    name: 'Batch #2024-098',
    startTime: '2026-03-02T07:00:00',
    location: 'Sân phơi C2',
    notes: 'Mưa bất ngờ, không kịp thu bánh',
    dryingProgress: 45,
    estimatedTimeRemaining: 0,
    riskLevel: 'high',
    status: 'failed',
    temperature: 28,
    humidity: 85,
    weatherRisk: 'Hỏng do mưa bất ngờ',
    createdBy: 'user@example.com'
  },
  {
    id: '104',
    name: 'Batch #2024-097',
    startTime: '2026-03-01T06:00:00',
    location: 'Sân phơi A2',
    dryingProgress: 100,
    estimatedTimeRemaining: 0,
    riskLevel: 'low',
    status: 'completed',
    temperature: 34,
    humidity: 38,
    weatherRisk: 'Hoàn thành thành công',
    createdBy: 'user@example.com'
  },
  {
    id: '105',
    name: 'Batch #2024-096',
    startTime: '2026-02-29T08:00:00',
    location: 'Sân phơi B3',
    notes: 'Độ ẩm cao nhưng vẫn hoàn thành',
    dryingProgress: 100,
    estimatedTimeRemaining: 0,
    riskLevel: 'medium',
    status: 'completed',
    temperature: 31,
    humidity: 48,
    weatherRisk: 'Hoàn thành với cảnh báo độ ẩm',
    createdBy: 'user@example.com'
  }
];