import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Sun
} from 'lucide-react';
import bannerWealth from '../../assets/images/am_banner_wealth_1789634276093.jpg';
import bannerEnergy from '../../assets/images/am_banner_energy_1789634296298.jpg';
import bannerIndustry from '../../assets/images/am_banner_industry_1789634315597.jpg';

interface BannerSlide {
  id: string;
  image: string;
  badge: string;
  badgeIcon: React.ElementType;
  badgeColor: string;
  title: string;
  subtitle: string;
  highlight: string;
  guaranteeText: string;
  actionText: string;
  targetTab: 'normal' | 'vip' | 'flash' | 'high_return';
}

interface HomeImageBannerProps {
  onSelectTab: (tab: 'normal' | 'vip' | 'flash' | 'high_return') => void;
  onOpenRecharge: () => void;
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'wealth',
    image: bannerWealth,
    badge: 'AM Official Industrial Portfolio',
    badgeIcon: TrendingUp,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    title: 'Strong Bonds.\nStronger Returns.',
    subtitle: 'Backed by high-grade industrial assets & rapid automated turnarounds.',
    highlight: 'Instant UPI Payouts',
    guaranteeText: 'Daily Settlement 100% Guaranteed',
    actionText: '⚡ Flash Plans',
    targetTab: 'flash'
  },
  {
    id: 'energy',
    image: bannerEnergy,
    badge: 'Clean Energy Infrastructure',
    badgeIcon: Sun,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    title: 'Solar & Wind Energy\nHigh-Yield Dividends',
    subtitle: 'Government-supported solar farms generating stable, passive daily payouts.',
    highlight: 'Fixed Daily ROI',
    guaranteeText: 'Zero-Risk Capital Protection',
    actionText: '🌱 Stable Energy',
    targetTab: 'normal'
  },
  {
    id: 'industry',
    image: bannerIndustry,
    badge: 'Automated Robotics & AI Systems',
    badgeIcon: Cpu,
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    title: 'Precision Robotics &\nMicrochip Production',
    subtitle: 'State-of-the-art semiconductor lines with premium investor profit sharing.',
    highlight: 'VIP Multiplier Yields',
    guaranteeText: 'Automated Credit Every 24h',
    actionText: '👑 VIP Portfolios',
    targetTab: 'vip'
  }
];

export const HomeImageBanner: React.FC<HomeImageBannerProps> = ({ onSelectTab, onOpenRecharge }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diff = touchStartXRef.current - touchEndXRef.current;
      if (diff > 45) {
        nextSlide();
      } else if (diff < -45) {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const current = BANNER_SLIDES[currentIndex];
  const BadgeIcon = current.badgeIcon;

  return (
    <div 
      className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-700/60 bg-slate-950 select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Image Container with 16:9 Aspect Ratio */}
      <div className="relative w-full aspect-[16/8.8] sm:aspect-[16/7.5] overflow-hidden">
        {BANNER_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              {/* Background Photo */}
              <img
                src={slide.image}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform scale-105 transition-transform duration-7000 ease-out"
                style={{
                  transform: isActive ? 'scale(1)' : 'scale(1.08)'
                }}
              />

              {/* Multi-stage High-Contrast Gradient Overlays for Absolute Legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/35" />
            </div>
          );
        })}

        {/* Dynamic Foreground Content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-3.5 sm:p-4 text-white">
          
          {/* Top Section: Badge + Live Pulse Indicator */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold border backdrop-blur-md shadow-sm ${current.badgeColor}`}>
              <BadgeIcon className="w-2.5 h-2.5" />
              <span className="uppercase tracking-wider">{current.badge}</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{current.highlight}</span>
            </div>
          </div>

          {/* Center Section: Main Title & Subtitle */}
          <div className="my-auto py-1">
            <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight font-['Outfit'] leading-snug drop-shadow-md text-white whitespace-pre-line">
              {current.title}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-200/90 line-clamp-2 max-w-[85%] mt-1 leading-normal drop-shadow-sm font-medium">
              {current.subtitle}
            </p>
          </div>

          {/* Bottom Section: Guarantee and Action Button */}
          <div className="flex items-center justify-between pt-2 border-t border-white/15">
            <div className="flex items-center space-x-1 text-[9.5px] text-slate-300 font-medium truncate mr-2">
              <ShieldCheck className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="truncate">{current.guaranteeText}</span>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab(current.targetTab)}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 text-[10px] font-black flex items-center space-x-1 shadow-md shadow-amber-500/25 hover:brightness-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
            >
              <span>{current.actionText}</span>
              <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
            </button>
          </div>

        </div>

        {/* Carousel Prev/Next Buttons (Subtle on mobile, visible on desktop hover) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous Slide"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-30 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm opacity-60 group-hover:opacity-100 transition-opacity active:scale-90 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next Slide"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-30 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm opacity-60 group-hover:opacity-100 transition-opacity active:scale-90 cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Pagination Indicator Dots */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1.5 pointer-events-none">
          {BANNER_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 pointer-events-auto cursor-pointer rounded-full ${
                  isActive 
                    ? 'w-4 h-1.5 bg-amber-400 shadow-sm shadow-amber-400/50' 
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
