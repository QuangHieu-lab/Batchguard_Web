import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  condition: string;
}

interface VoiceNotificationProps {
  weatherData: WeatherData;
}

export function VoiceNotification({ weatherData }: VoiceNotificationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tính toán mức độ rủi ro mưa để gọi đúng API level
  const getRainLevel = (): 'low' | 'medium' | 'high' => {
    if (weatherData.rainChance > 60) return 'high';
    if (weatherData.rainChance > 30) return 'medium';
    return 'low';
  };

  const speakWeather = async () => {
    // Nếu đang phát thì bấm vào sẽ dừng
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      const level = getRainLevel();
      
      // 🚀 COPY CHÍNH XÁC REQUEST URL TỪ SWAGGER VÀO ĐÂY
      const audioUrl = `https://mylongaiv2.onrender.com/voice/alert?level=${level}`;

      // Gắn thẳng URL vào thẻ Audio mặc định của HTML5
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Khi âm thanh đã tải xong và bắt đầu phát được
      audio.oncanplaythrough = () => {
        setIsLoading(false);
      };

      // Khi phát xong thì tắt trạng thái
      audio.onended = () => {
        setIsPlaying(false);
      };

      // Nếu link hỏng hoặc mạng lỗi
      audio.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
        toast.error("Không thể tải âm thanh (Vui lòng kiểm tra lại link API)!");
      };

      // Ra lệnh phát
      await audio.play();
      setIsPlaying(true);
      toast.success("Đang phát thông báo thời tiết!");

    } catch (error: any) {
      console.error("Lỗi phát âm thanh:", error);
      toast.error("Trình duyệt chặn phát âm thanh tự động!");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={speakWeather}
      disabled={isLoading}
      className={`
        ${isPlaying
          ? 'bg-gradient-to-r from-red-500 to-rose-600'
          : 'bg-gradient-to-r from-cyan-500 to-blue-600'}
        text-white shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all
        border border-white/10 px-5 py-2.5 rounded-xl font-medium
        flex items-center gap-2
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải âm thanh...</span>
        </>
      ) : isPlaying ? (
        <>
          <VolumeX className="w-5 h-5 animate-pulse" />
          <span>Dừng phát</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5" />
          <span>Phát loa cảnh báo (AI)</span>
        </>
      )}
    </Button>
  );
}