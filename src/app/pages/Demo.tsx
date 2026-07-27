import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw,
  TrendingUp, 
  Thermometer, 
  Droplets, 
  Wind, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Sparkles,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type RiskLevel = 'low' | 'medium' | 'high' | 'complete';

interface SimulationState {
  dryingProgress: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  riskLevel: RiskLevel;
  riskMessage: string;
  recommendation: string;
}

export default function Demo() {
  const [isRunning, setIsRunning] = useState(false);
  const [simulation, setSimulation] = useState<SimulationState>({
    dryingProgress: 0,
    timeElapsed: 0,
    estimatedTimeRemaining: 360,
    temperature: 32,
    humidity: 45,
    windSpeed: 12,
    riskLevel: 'low',
    riskMessage: 'Điều kiện tốt để phơi bánh',
    recommendation: 'Tiếp tục phơi. Dự kiến hoàn thành sau 6 giờ.'
  });

  const [scanningPhase, setScanningPhase] = useState(0);

  // AI Scanning animation
  useEffect(() => {
    if (isRunning) {
      const scanInterval = setInterval(() => {
        setScanningPhase((prev) => (prev + 1) % 3);
      }, 1500);
      return () => clearInterval(scanInterval);
    }
  }, [isRunning]);

  // Simulation logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimulation((prev) => {
        const newProgress = Math.min(prev.dryingProgress + 1, 100);
        const newTimeElapsed = prev.timeElapsed + 6; // 6 minutes per tick
        const newTimeRemaining = Math.max(0, 360 - newTimeElapsed);

        // Simulate environmental changes
        let newTemperature = prev.temperature;
        let newHumidity = prev.humidity;
        let newWindSpeed = prev.windSpeed;
        let newRiskLevel: RiskLevel = 'low';
        let newRiskMessage = '';
        let newRecommendation = '';

        // Phase 1: 0-30% - Good conditions
        if (newProgress <= 30) {
          newTemperature = 32 + Math.random() * 2;
          newHumidity = 45 + Math.random() * 3;
          newWindSpeed = 12 + Math.random() * 2;
          newRiskLevel = 'low';
          newRiskMessage = 'Điều kiện tốt để phơi bánh';
          newRecommendation = 'Tiếp tục phơi an toàn. Không có rủi ro.';
        }
        // Phase 2: 31-60% - Humidity starts increasing
        else if (newProgress <= 60) {
          newTemperature = 31 + Math.random() * 2;
          newHumidity = 50 + (newProgress - 30) * 0.5;
          newWindSpeed = 10 + Math.random() * 3;
          newRiskLevel = 'medium';
          newRiskMessage = 'Độ ẩm đang tăng dần';
          newRecommendation = 'Theo dõi sát sao. Dự kiến hoàn thành trong 2-3 giờ.';
        }
        // Phase 3: 61-89% - High risk, rain warning
        else if (newProgress <= 89) {
          newTemperature = 30 + Math.random() * 1.5;
          newHumidity = 65 + (newProgress - 60) * 0.8;
          newWindSpeed = 8 + Math.random() * 4;
          newRiskLevel = 'high';
          newRiskMessage = 'Cảnh báo: Nguy cơ mưa cao 70%';
          newRecommendation = 'Khẩn cấp: Thu bánh trong 30 phút hoặc che chắn ngay!';
        }
        // Phase 4: 90-100% - Complete
        else {
          newTemperature = 29 + Math.random() * 2;
          newHumidity = 75 + Math.random() * 5;
          newWindSpeed = 6 + Math.random() * 3;
          newRiskLevel = 'complete';
          newRiskMessage = 'Batch đã hoàn thành';
          newRecommendation = 'Thu hoạch ngay để đảm bảo chất lượng tốt nhất!';
        }

        // Stop when complete
        if (newProgress >= 100) {
          setIsRunning(false);
        }

        return {
          dryingProgress: newProgress,
          timeElapsed: newTimeElapsed,
          estimatedTimeRemaining: newTimeRemaining,
          temperature: parseFloat(newTemperature.toFixed(1)),
          humidity: parseFloat(newHumidity.toFixed(1)),
          windSpeed: parseFloat(newWindSpeed.toFixed(1)),
          riskLevel: newRiskLevel,
          riskMessage: newRiskMessage,
          recommendation: newRecommendation
        };
      });
    }, 1000); // Update every second (fast simulation)

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimulation({
      dryingProgress: 0,
      timeElapsed: 0,
      estimatedTimeRemaining: 360,
      temperature: 32,
      humidity: 45,
      windSpeed: 12,
      riskLevel: 'low',
      riskMessage: 'Điều kiện tốt để phơi bánh',
      recommendation: 'Tiếp tục phơi. Dự kiến hoàn thành sau 6 giờ.'
    });
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' };
      case 'medium':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', gradient: 'from-amber-500 to-amber-600' };
      case 'high':
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', gradient: 'from-rose-500 to-rose-600' };
      case 'complete':
        return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', gradient: 'from-cyan-500 to-cyan-600' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', gradient: 'from-gray-500 to-gray-600' };
    }
  };

  const getRiskLabel = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return 'Rủi ro thấp';
      case 'medium':
        return 'Cần chú ý';
      case 'high':
        return 'Rủi ro cao';
      case 'complete':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}p`;
    }
    return `${mins}p`;
  };

  const riskColors = getRiskColor(simulation.riskLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 py-3 md:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-lg h-9 w-9 md:h-10 md:w-10">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <h1 className="text-lg md:text-xl font-bold text-gray-900">LANGAI Demo</h1>
                <div className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 bg-gradient-to-r from-purple-100 to-purple-200 rounded-md">
                  <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-700" />
                  <span className="text-[9px] md:text-[10px] font-semibold text-purple-700">DEMO</span>
                </div>
              </div>
              <p className="text-[10px] md:text-xs text-gray-600 font-medium">Mô phỏng quá trình phơi bánh</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {isRunning && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-700 hidden sm:inline">Đang chạy</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 py-6 md:py-8 max-w-7xl">
        <div className="space-y-6 md:space-y-8">
          {/* Intro Section */}
          {simulation.dryingProgress === 0 && !isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/30 shadow-lg">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl">
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                    Chào mừng đến với Demo BatchGuard
                  </h2>
                  <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
                    Trải nghiệm mô phỏng thực tế của hệ thống AI theo dõi quá trình phơi bánh tráng. 
                    Xem cách BatchGuard giúp bạn kiểm soát tiến độ và dự đoán rủi ro theo thời gian thực.
                  </p>
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 h-12 md:h-14 px-8 md:px-10 text-sm md:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Bắt đầu mô phỏng
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
            {simulation.dryingProgress > 0 && (
              <>
                <Button
                  onClick={isRunning ? handlePause : handleStart}
                  size="lg"
                  className={`${
                    isRunning 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800' 
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                  } h-11 md:h-12 px-6 md:px-8 text-sm md:text-base font-semibold shadow-md`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                      Tạm dừng
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                      Tiếp tục
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  size="lg"
                  variant="outline"
                  className="border-2 h-11 md:h-12 px-6 md:px-8 text-sm md:text-base font-semibold hover:bg-gray-50"
                >
                  <RotateCcw className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                  Khởi động lại
                </Button>
              </>
            )}
          </div>

          {/* Main Dashboard */}
          {simulation.dryingProgress > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 md:space-y-8"
            >
              {/* AI Scanning Indicator */}
              <AnimatePresence>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-cyan-100/50 shadow-md">
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="relative w-8 h-8 md:w-10 md:h-10">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                              >
                                <Sparkles className="w-full h-full text-cyan-600" />
                              </motion.div>
                            </div>
                            <div>
                              <p className="text-xs md:text-sm font-semibold text-cyan-900">
                                AI Engine đang phân tích...
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    animate={{
                                      scale: scanningPhase === i ? 1.2 : 1,
                                      opacity: scanningPhase === i ? 1 : 0.3
                                    }}
                                    className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-600 rounded-full"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-cyan-600 text-white border-0 text-xs md:text-sm px-2 md:px-3">
                            <Activity className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
                            Live
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Card */}
              <Card className={`border-2 ${riskColors.border} bg-gradient-to-br from-white to-gray-50/30 shadow-lg overflow-hidden`}>
                <div className={`h-1.5 md:h-2 bg-gradient-to-r ${riskColors.gradient}`} />
                <CardContent className="p-5 md:p-8">
                  <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
                    {/* Left: Progress */}
                    <div className="space-y-5 md:space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
                          <h3 className="text-base md:text-lg font-semibold text-gray-700">Độ khô hiện tại</h3>
                        </div>
                        <Badge className={`${riskColors.bg} ${riskColors.text} border-2 ${riskColors.border} text-xs md:text-sm px-3 md:px-4 py-1 md:py-1.5 font-semibold`}>
                          {getRiskLabel(simulation.riskLevel)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-baseline gap-2 md:gap-3 mb-4 md:mb-5">
                        <span className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                          {simulation.dryingProgress}
                        </span>
                        <div>
                          <span className="text-2xl md:text-3xl font-semibold text-gray-600">%</span>
                          <div className="flex items-center gap-1 mt-1">
                            <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-600" />
                            <span className="text-[10px] md:text-xs text-emerald-600 font-medium">Dự đoán bởi AI</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Progress value={simulation.dryingProgress} className="h-4 md:h-5 bg-gray-200 shadow-inner" />
                        {isRunning && (
                          <motion.div
                            animate={{ x: [0, 100, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/4 rounded-full"
                          />
                        )}
                      </div>

                      {/* Countdown Timer */}
                      {simulation.estimatedTimeRemaining > 0 && simulation.dryingProgress < 100 && (
                        <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl border-2 border-cyan-200">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                              <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <span className="text-xs md:text-sm font-medium text-gray-700">Thời gian ước tính còn lại</span>
                          </div>
                          <span className="text-xl md:text-2xl font-bold text-cyan-700">
                            {formatTime(simulation.estimatedTimeRemaining)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Environmental Data */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 shadow-md">
                        <CardContent className="p-4 md:p-5">
                          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <div className="w-9 h-9 md:w-11 md:h-11 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
                              <Thermometer className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <span className="text-xs md:text-sm font-medium text-gray-700">Nhiệt độ</span>
                          </div>
                          <p className="text-3xl md:text-4xl font-bold text-orange-600">{simulation.temperature}°C</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 shadow-md">
                        <CardContent className="p-4 md:p-5">
                          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <div className="w-9 h-9 md:w-11 md:h-11 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                              <Droplets className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <span className="text-xs md:text-sm font-medium text-gray-700">Độ ẩm</span>
                          </div>
                          <p className="text-3xl md:text-4xl font-bold text-blue-600">{simulation.humidity}%</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-gray-200 col-span-2 shadow-md">
                        <CardContent className="p-4 md:p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-9 h-9 md:w-11 md:h-11 bg-gray-500 rounded-lg flex items-center justify-center shadow-md">
                                <Wind className="w-5 h-5 md:w-6 md:h-6 text-white" />
                              </div>
                              <span className="text-xs md:text-sm font-medium text-gray-700">Tốc độ gió</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xl md:text-2xl font-bold text-gray-900">{simulation.windSpeed} km/h</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Alert Box */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={simulation.riskLevel}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className={`border-2 ${riskColors.border} bg-gradient-to-br ${riskColors.bg} to-white/50 shadow-lg`}>
                    <CardHeader className={`border-b ${riskColors.border}`}>
                      <CardTitle className="flex items-center gap-3 text-base md:text-lg">
                        <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${riskColors.gradient} rounded-lg flex items-center justify-center shadow-md`}>
                          {simulation.riskLevel === 'complete' ? (
                            <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                          )}
                        </div>
                        <span className={riskColors.text}>Trạng thái hiện tại</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 md:p-6 space-y-4">
                      <div>
                        <p className={`text-base md:text-lg font-bold ${riskColors.text} mb-2`}>
                          {simulation.riskMessage}
                        </p>
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          <strong>Khuyến nghị:</strong> {simulation.recommendation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Completion Message */}
              {simulation.dryingProgress >= 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/30 shadow-xl">
                    <CardContent className="p-6 md:p-8 text-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl">
                        <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-emerald-900 mb-3 md:mb-4">
                        Mô phỏng hoàn tất!
                      </h3>
                      <p className="text-sm md:text-base text-emerald-800 mb-6 md:mb-8 max-w-2xl mx-auto">
                        Bạn đã thấy cách BatchGuard theo dõi tiến độ và cảnh báo rủi ro theo thời gian thực. 
                        Sẵn sàng trải nghiệm với dữ liệu thật?
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                        <Button
                          onClick={handleReset}
                          size="lg"
                          variant="outline"
                          className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 h-11 md:h-12 px-6 md:px-8 text-sm md:text-base font-semibold"
                        >
                          <RotateCcw className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                          Chạy lại Demo
                        </Button>
                        <Link to="/dashboard">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 h-11 md:h-12 px-6 md:px-8 text-sm md:text-base font-semibold shadow-lg"
                          >
                            Trải nghiệm Dashboard thật
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
