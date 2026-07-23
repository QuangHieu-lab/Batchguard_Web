import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Avatar, AvatarFallback } from '../components/ui/avatar'; // 🚀 Thêm import Avatar
import { TrendingUp, CloudRain, Target, BarChart3, Shield, CheckCircle2, ArrowRight, Sparkles, Zap, Eye, Brain, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext'; 

export default function Landing() {
  const navigate = useNavigate(); // 🚀 Dùng useNavigate để điều hướng
  const { isAuthenticated, user } = useAuth();

  // 🚀 Hàm lấy chữ cái đầu giống DashboardLayout
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName =   user?.name || 'Người dùng';

  return (
    <div className="min-h-screen bg-[#0A0E27] text-slate-100">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.1
        }} />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-400 rounded-2xl blur-md opacity-50" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-navy-950" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">MYLONGAI</h1>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-sky-400/20 border border-sky-400/30 rounded-lg">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span className="text-xs font-bold text-sky-400">AI</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">BatchGuard System</p>
            </div>
          </div>
          <nav className="flex gap-4 md:gap-8 items-center">
            <a href="#features" className="hidden md:block text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">Công nghệ</a>
            <a href="#technology" className="hidden md:block text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">Tính năng</a>
            
            {/* 🚀 LOGIC HIỂN THỊ AVATAR ĐỒNG BỘ VỚI DASHBOARD */}
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard/userprofile')}
                className="flex items-center gap-3 hover:bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 cursor-pointer transition-all hover:border-sky-500/50 h-auto"
              >
                <Avatar className="w-8 h-8 border-2 border-sky-400">
                  <AvatarFallback className="bg-gradient-to-br from-sky-400 to-cyan-400 text-navy-950 font-bold text-sm">
                    {user ? getUserInitials(displayName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white hidden md:block">
                  {displayName}
                </span>
              </Button>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-navy-950 font-semibold shadow-lg shadow-sky-500/30 border-0">
                  Đăng nhập
                </Button>
              </Link>
            )}

          </nav>
        </div>
      </header>

      {/* Hero Section - Asymmetric Layout */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-32 relative">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-7"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-400/10 border border-sky-400/30 rounded-full text-sm font-semibold mb-8 shadow-lg shadow-sky-400/10">
              <Zap className="w-4 h-4 text-sky-400" />
              <span className="text-sky-400">AI-Powered Vision System</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              From Experience to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 drop-shadow-[0_0_30px_rgba(56,189,248,0.5)]">
                Predictability
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
              Hệ thống Camera AI tự động phát hiện, theo dõi và dự đoán tiến độ phơi bánh tráng Mỹ Lồng với độ chính xác cao
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/login'}>
                <Button size="lg" className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-navy-950 h-14 px-8 text-base font-bold shadow-xl shadow-sky-500/30">
                  Trải nghiệm Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-sky-400/50 h-14 px-8 text-base font-semibold">
                Xem Demo
              </Button>
            </div>

            {/* Stats - Unique Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-16">
              <div className="relative group">
                <div className="absolute inset-0 bg-sky-400/10 rounded-2xl blur-xl group-hover:bg-sky-400/20 transition-all" />
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 text-center hover:border-sky-400/50 transition-all">
                  <div className="text-3xl sm:text-4xl font-bold text-sky-400 mb-1">95%</div>
                  <div className="text-xs text-slate-400 font-medium">Độ chính xác</div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-cyan-400/10 rounded-2xl blur-xl group-hover:bg-cyan-400/20 transition-all" />
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 text-center hover:border-cyan-400/50 transition-all">
                  <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-1">-40%</div>
                  <div className="text-xs text-slate-400 font-medium">Giảm rủi ro</div>
                </div>
              </div>
              <div className="relative group col-span-2 sm:col-span-1">
                <div className="absolute inset-0 bg-sky-400/10 rounded-2xl blur-xl group-hover:bg-sky-400/20 transition-all" />
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 text-center hover:border-sky-400/50 transition-all">
                  <div className="text-3xl font-bold text-sky-400 mb-1">24/7</div>
                  <div className="text-xs text-slate-400 font-medium">Giám sát</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-5"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-sky-400/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl shadow-sky-500/20">
                <ImageWithFallback
                  src="https://sidacsan.vn/wp-content/uploads/2022/05/banh-trang-dua-my-long-me-den-2.jpg"
                  alt="Bánh tráng đang phơi"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
                
                {/* AI Detection Overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-sky-400/90 backdrop-blur-sm rounded-xl shadow-lg">
                  <Eye className="w-4 h-4 text-navy-950" />
                  <span className="text-sm font-bold text-navy-950">AI Detecting...</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Features Grid - Asymmetric */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Công nghệ AI tiên tiến
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Hệ thống BatchGuard kết hợp Computer Vision và Machine Learning để giám sát tự động
            </p>
          </motion.div>

          {/* Asymmetric Grid */}
          <div className="grid md:grid-cols-12 gap-6">
            {/* Large Feature Card - Left */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="md:col-span-7"
            >
              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 hover:border-sky-400/50 transition-all duration-500 shadow-xl hover:shadow-sky-400/20 rounded-3xl h-full backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-400/30">
                      <Eye className="w-8 h-8 text-navy-950" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Tự động phát hiện</h3>
                      <p className="text-slate-400">Camera AI tự động phát hiện khi có bánh tráng được phơi</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                      <div className="text-3xl font-bold text-sky-400 mb-1">100%</div>
                      <div className="text-sm text-slate-400">Tự động hóa</div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                      <div className="text-3xl font-bold text-cyan-400 mb-1">&lt;2s</div>
                      <div className="text-sm text-slate-400">Phản hồi</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Two Stacked Cards - Right */}
            <div className="md:col-span-5 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 hover:border-cyan-400/50 transition-all duration-500 shadow-xl hover:shadow-cyan-400/20 rounded-3xl backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/30">
                        <Brain className="w-6 h-6 text-navy-950" />
                      </div>
                      <h3 className="text-xl font-bold text-white">AI dự đoán</h3>
                    </div>
                    <p className="text-slate-400 text-sm">Dự đoán thời gian hoàn thành và rủi ro mẻ bánh</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 hover:border-sky-400/50 transition-all duration-500 shadow-xl hover:shadow-sky-400/20 rounded-3xl backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-400/30">
                        <AlertTriangle className="w-6 h-6 text-navy-950" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Cảnh báo thông minh</h3>
                    </div>
                    <p className="text-slate-400 text-sm">Cảnh báo thông minh khi mẻ bánh có nguy cơ</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Three Column Cards */}
            {[
              { icon: TrendingUp, title: 'Theo dõi theo thời gian thực', desc: 'Theo dõi tiến độ phơi thời gian thực', color: 'sky' },
              { icon: CloudRain, title: 'Thời tiết đồng bộ', desc: 'Tích hợp dữ liệu thời tiết', color: 'cyan' },
              { icon: Shield, title: 'Phát hiện rủi ro', desc: 'Phân tích và cảnh báo rủi ro', color: 'sky' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * idx }}
                viewport={{ once: true }}
                className="md:col-span-4"
              >
                <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 hover:border-sky-400/50 transition-all duration-500 shadow-xl hover:shadow-sky-400/20 rounded-3xl h-full backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${feature.color}-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg mb-4`}>
                      <feature.icon className="w-6 h-6 text-navy-950" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="technology" className="py-24 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Lợi ích vượt trội
            </h2>
            <p className="text-xl text-slate-400">
              Chuyển đổi quy trình phơi bánh tráng với công nghệ AI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle2,
                title: 'Tự động hoàn toàn',
                desc: 'Không cần thao tác thủ công, AI tự động tạo mẻ bánh khi phát hiện bánh tráng',
                stat: '100%',
                label: 'Tự dộng'
              },
              {
                icon: Target,
                title: 'Dự đoán chính xác',
                desc: 'Machine Learning phân tích và dự đoán thời gian hoàn thành với độ chính xác cao',
                stat: '95%',
                label: 'Độ chính xác'
              },
              {
                icon: Shield,
                title: 'Giảm thiểu rủi ro',
                desc: 'Cảnh báo sớm các yếu tố ảnh hưởng đến chất lượng mẻ bánh',
                stat: '-40%',
                label: 'Giảm thiểu rủi ro'
              }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * idx }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 hover:border-sky-400/50 transition-all duration-500 shadow-xl hover:shadow-sky-400/20 rounded-3xl h-full backdrop-blur-sm group">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-400/30 mb-6 group-hover:scale-110 transition-transform">
                      <benefit.icon className="w-8 h-8 text-navy-950" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{benefit.title}</h3>
                    <p className="text-slate-400 mb-6 leading-relaxed">{benefit.desc}</p>
                    <div className="flex items-end gap-2 pt-4 border-t border-slate-700">
                      <div className="text-4xl font-bold text-sky-400">{benefit.stat}</div>
                      <div className="text-sm text-slate-500 mb-1">{benefit.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-cyan-500/10" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, #38BDF8 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Sẵn sàng chuyển đổi?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Trải nghiệm hệ thống AI monitoring cao cấp ngay hôm nay
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/dashboard') : '/login'}>
                <Button size="lg" className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-navy-950 h-16 px-10 text-lg font-bold shadow-2xl shadow-sky-500/30">
                  Khám phá Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-slate-600 text-slate-200 hover:bg-slate-800 hover:border-sky-400/50 h-16 px-10 text-lg font-semibold">
                Liên hệ triển khai
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800 text-slate-400 py-16 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-navy-950" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">MYLONGAI</h3>
                  <p className="text-xs text-slate-500">BatchGuard System</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Hệ thống AI hỗ trợ kiểm soát quá trình phơi bánh tráng Mỹ Lồng
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-base text-white">Sản phẩm</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-sky-400 transition-colors">Tính năng</a></li>
                <li><a href="#technology" className="hover:text-sky-400 transition-colors">Công nghệ</a></li>
                <li><Link to="/dashboard" className="hover:text-sky-400 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-base text-white">Công ty</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-base text-white">Hỗ trợ</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Tài liệu</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Hướng dẫn</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">FAQs</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© 2026 MYLONGAI BatchGuard System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}