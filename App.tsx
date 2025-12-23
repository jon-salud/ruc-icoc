import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Video, Calendar, Users, Heart, Play, Search, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';
// @ts-ignore
import Papa from 'papaparse';
import { Language, Translation, Devotional } from './types';
import { CONTENT, MOCK_DEVOTIONALS } from './constants';
import { getYouTubeId, getThumbnailUrl } from './utils';

// *** CONFIGURATION ***
// Replace this URL with your actual Google Sheet CSV URL from "File > Share > Publish to Web > CSV"
// For now, we leave it empty to fallback to MOCK data so the app doesn't break immediately.
const GOOGLE_SHEET_CSV_URL = ""; 

// --- Contexts ---
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('tl');
  const t = CONTENT[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// --- Custom Hook for Data Fetching ---
const useDevotionals = () => {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no URL is configured, use Mock data after a short simulated delay
    if (!GOOGLE_SHEET_CSV_URL) {
      console.warn("No Google Sheet URL configured. Using Mock Data.");
      const timer = setTimeout(() => {
        setDevotionals(MOCK_DEVOTIONALS);
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }

    setLoading(true);
    fetch(GOOGLE_SHEET_CSV_URL)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch CSV');
        return response.text();
      })
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            const parsedData = results.data
              .filter((row: any) => row['Date'] && row['Title']) // Basic validation
              .map((row: any, index: number) => {
                const videoId = getYouTubeId(row['Video URL']) || '';
                
                return {
                  id: `sheet-${index}`,
                  date: row['Date'],
                  title: row['Title'],
                  speaker: row['Speaker'],
                  language: (row['Language']?.toLowerCase() === 'en' ? 'en' : 'tl') as Language,
                  scripture: row['Scripture'],
                  videoUrl: row['Video URL'],
                  thumbnailUrl: videoId 
                    ? getThumbnailUrl(videoId) 
                    : 'https://picsum.photos/800/600?grayscale', // Fallback image
                };
              });
            
            // Sort by date (newest first)
            const sortedData = parsedData.sort((a: Devotional, b: Devotional) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            setDevotionals(sortedData);
            setLoading(false);
          },
          error: (err: any) => {
            console.error('CSV Parse Error:', err);
            setError('Failed to parse data');
            setLoading(false);
          }
        });
      })
      .catch(err => {
        console.error('Fetch Error:', err);
        setError('Failed to load devotionals');
        // Fallback to mock data on error so the site isn't empty
        setDevotionals(MOCK_DEVOTIONALS); 
        setLoading(false);
      });
  }, []);

  return { devotionals, loading, error };
};

// --- Components ---

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-sm">
      <button
        onClick={() => setLanguage('tl')}
        className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
          language === 'tl'
            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
            : 'text-brand-200 hover:bg-white/10'
        }`}
        aria-label="Switch to Tagalog"
      >
        TL
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
          language === 'en'
            ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20'
            : 'text-brand-200 hover:bg-white/10'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
};

const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  className?: string;
  to?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}> = ({ children, variant = 'primary', className = '', to, onClick, icon }) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    // Primary: Gradient Orange
    primary: "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white shadow-lg shadow-accent-500/30 focus:ring-accent-500 border border-transparent",
    // Secondary: Gradient Blue
    secondary: "bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white shadow-lg shadow-brand-500/30 focus:ring-brand-500 border border-transparent",
    // Outline: Cyan Accent
    outline: "border-2 border-highlight-400/50 text-highlight-400 hover:bg-highlight-400/10 focus:ring-highlight-400",
    // Glass: Frosted
    glass: "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm focus:ring-white/30",
  };

  const content = (
    <>
      {children}
      {icon && <span className="ml-2">{icon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${baseStyle} ${variants[variant]} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {content}
    </button>
  );
};

const Navbar = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.about, path: '/about' },
    { name: t.nav.devotionals, path: '/devotionals' },
    { name: t.nav.joinLive, path: '/join' },
    { name: t.nav.getInvolved, path: '/get-involved' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-brand-950/80 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              {/* Logo Icon Gradient */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-800 to-accent-500 flex items-center justify-center text-white shadow-lg group-hover:shadow-accent-500/20 transition-all duration-300 border border-white/10">
                <Users size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl text-white tracking-tight leading-none">Rise Up</span>
                <span className="text-[10px] text-highlight-400 font-medium tracking-widest uppercase">Challenge</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path) 
                      ? 'text-white bg-white/10 shadow-sm' 
                      : 'text-brand-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <LanguageSwitcher />

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-brand-200 hover:text-white focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-brand-900/95 backdrop-blur-xl border-b border-white/10 animate-fade-in-down absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-lg text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-accent-500/20 to-transparent text-accent-100 border-l-2 border-accent-500'
                    : 'text-brand-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-black/40 border-t border-white/5 text-white py-16 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-900 to-black border border-white/10 flex items-center justify-center text-accent-500 shadow-inner">
                <Users size={24} />
              </div>
            <div className="text-left">
              <h3 className="font-serif font-bold text-xl text-white">Rise Up Challenge</h3>
              <p className="text-brand-300 text-sm mt-1">International Churches of Christ</p>
            </div>
          </div>
          <div className="flex gap-8 text-sm font-medium text-brand-300">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-accent-400 transition-colors">Facebook</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-accent-400 transition-colors">YouTube</a>
            <Link to="/contact" className="hover:text-accent-400 transition-colors">Contact</Link>
          </div>
        </div>
        <div className="mt-10 pt-10 border-t border-white/5 text-center text-sm text-brand-500">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
};

const DevotionalCard: React.FC<{ devotional: Devotional; btnText: string }> = ({ devotional, btnText }) => {
  return (
    <a href={devotional.videoUrl} target="_blank" rel="noreferrer" className="group bg-brand-900/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden hover:border-accent-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1 block">
      <div className="relative aspect-video bg-brand-950 overflow-hidden">
        <img 
          src={devotional.thumbnailUrl} 
          alt={devotional.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/20 to-transparent opacity-90" />
        
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-highlight-400 text-xs font-bold px-3 py-1 rounded-full">
           {new Date(devotional.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>

        <div className="absolute bottom-3 right-3 bg-accent-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg">
          {devotional.language}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="bg-accent-500/90 rounded-full p-4 text-white transform scale-90 group-hover:scale-100 transition-transform shadow-lg shadow-accent-500/20 backdrop-blur-sm">
              <Play fill="currentColor" size={24} />
           </div>
        </div>
      </div>
      <div className="p-6 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <h3 className="font-serif font-bold text-xl text-white mb-2 leading-tight line-clamp-2 group-hover:text-accent-300 transition-colors">
          {devotional.title}
        </h3>
        <p className="text-sm text-brand-200 mb-4 flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-brand-400"></span>
          {devotional.speaker}
        </p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <span className="inline-flex items-center text-xs font-medium text-brand-400 bg-brand-950/50 px-2 py-1 rounded border border-white/5">
            {devotional.scripture}
          </span>
          <span className="text-sm font-bold text-white hover:text-accent-400 flex items-center transition-colors">
             {btnText} <ChevronRight size={14} className="ml-1 text-accent-500" />
          </span>
        </div>
      </div>
    </a>
  );
};

// --- Pages ---

const HomePage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-brand-950">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-950 to-black"></div>
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-highlight-500/10 rounded-full blur-[80px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-highlight-400 text-sm font-medium mb-8 animate-fade-in-down">
            <span className="w-2 h-2 rounded-full bg-highlight-400 animate-pulse"></span>
            Daily Online Devotionals
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-brand-300 mb-8 whitespace-pre-line leading-tight drop-shadow-2xl">
            {t.home.hero.title}
          </h1>
          
          <p className="text-lg md:text-2xl text-brand-100/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {t.home.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button to="/join" variant="primary" icon={<Video size={20} />}>
              {t.home.hero.ctaJoin}
            </Button>
            <Button variant="glass" to="/devotionals" icon={<Play size={20} />}>
              {t.home.hero.ctaWatch}
            </Button>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-950 to-transparent pointer-events-none"></div>
      </section>

      {/* Scripture Section */}
      <section className="relative py-20 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/20 via-transparent to-brand-900/20"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <Heart className="w-12 h-12 text-accent-500 mx-auto mb-8 opacity-80" />
          <blockquote className="font-serif text-3xl md:text-4xl italic text-white leading-relaxed tracking-wide">
            {t.home.scripture.text}
          </blockquote>
          <cite className="block mt-8 text-highlight-400 font-bold not-italic uppercase tracking-widest text-sm">
            {t.home.scripture.ref}
          </cite>
        </div>
      </section>

      {/* How it started */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent-500 to-brand-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-brand-900 border border-white/10">
                <img src="https://picsum.photos/id/1059/800/600" alt="Community" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
                {t.home.started.title}
              </h2>
              <div className="w-20 h-1 bg-accent-500 mb-8"></div>
              <p className="text-lg text-brand-100 leading-relaxed mb-8 font-light">
                {t.home.started.body}
              </p>
              <Link to="/about" className="text-highlight-400 font-bold hover:text-white flex items-center group transition-colors">
                {t.nav.about} <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-24 bg-gradient-to-b from-brand-900/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">{t.home.whatWeDo.title}</h2>
            <p className="text-brand-200 max-w-2xl mx-auto">Connecting disciples globally through technology and faith.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Calendar className="w-8 h-8 text-highlight-400" />,
                title: t.home.whatWeDo.daily,
                desc: t.home.whatWeDo.dailyDesc
              },
              { 
                icon: <Globe className="w-8 h-8 text-highlight-400" />,
                title: t.home.whatWeDo.ledBy,
                desc: t.home.whatWeDo.ledByDesc
              },
              { 
                icon: <Video className="w-8 h-8 text-highlight-400" />,
                title: t.home.whatWeDo.accessible,
                desc: t.home.whatWeDo.accessibleDesc
              },
            ].map((item, i) => (
              <div key={i} className="group bg-white/5 p-8 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-highlight-500/30 hover:shadow-2xl hover:shadow-highlight-500/10 transition-all duration-300">
                <div className="w-16 h-16 bg-brand-950 rounded-xl shadow-inner flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-highlight-300 transition-colors">{item.title}</h3>
                <p className="text-brand-200/80 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const AboutPage = () => {
  const { t } = useLanguage();
  return (
    <div className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-200">
          {t.about.title}
        </h1>
        <div className="prose prose-lg prose-invert mx-auto">
          <p className="text-xl leading-relaxed mb-12 text-center text-brand-100 font-light">
            {t.about.intro}
          </p>
          
          <div className="bg-gradient-to-br from-brand-900/50 to-brand-950/50 backdrop-blur-md rounded-3xl p-10 border border-white/10 relative overflow-hidden shadow-2xl">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
            
            <h2 className="text-2xl font-serif font-bold text-white mb-4 flex items-center relative z-10">
              <Heart className="mr-3 text-accent-500" /> {t.about.missionTitle}
            </h2>
            <p className="text-lg text-brand-100 mb-10 relative z-10 pl-9 border-l border-white/10">{t.about.mission}</p>
            
            <h2 className="text-2xl font-serif font-bold text-white mb-4 flex items-center relative z-10">
              <Users className="mr-3 text-highlight-400" /> {t.about.visionTitle}
            </h2>
            <p className="text-lg text-brand-100 relative z-10 pl-9 border-l border-white/10">{t.about.vision}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DevotionalsPage = () => {
  const { t, language } = useLanguage();
  const { devotionals, loading, error } = useDevotionals();
  const [filter, setFilter] = useState<'all' | 'tl' | 'en'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDevotionals = devotionals.filter(d => {
    const matchesLang = filter === 'all' || d.language === filter;
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLang && matchesSearch;
  });

  return (
    <div className="py-24 min-h-screen bg-brand-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">{t.devotionals.title}</h1>
          <p className="text-lg text-brand-200 max-w-2xl mx-auto font-light">{t.devotionals.intro}</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="flex space-x-2">
            {[
              { id: 'all', label: t.devotionals.filterAll },
              { id: 'tl', label: t.devotionals.filterTl },
              { id: 'en', label: t.devotionals.filterEn },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  filter === f.id
                    ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/20'
                    : 'bg-transparent text-brand-200 hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={t.devotionals.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-black/20 border border-white/10 text-white placeholder-brand-500 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
            />
            <Search className="absolute left-4 top-3.5 text-brand-400" size={18} />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-accent-500 animate-spin mb-4" />
            <p className="text-brand-300">Loading devotionals...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
           <div className="flex flex-col items-center justify-center py-12 bg-red-500/10 rounded-2xl border border-red-500/20">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDevotionals.map((devotional) => (
              <DevotionalCard key={devotional.id} devotional={devotional} btnText={t.devotionals.watchBtn} />
            ))}
          </div>
        )}
        
        {!loading && filteredDevotionals.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-brand-300">No devotionals found matching your criteria.</p>
            </div>
        )}
      </div>
    </div>
  );
};

const JoinLivePage = () => {
  const { t } = useLanguage();
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">{t.joinLive.title}</h1>
        <p className="text-xl text-brand-200 mb-16 max-w-2xl mx-auto font-light">
          {t.joinLive.intro}
        </p>

        <div className="bg-gradient-to-b from-brand-900/40 to-black/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl max-w-2xl mx-auto relative overflow-hidden group hover:border-accent-500/30 transition-all duration-500">
          {/* Decorative blurred blob */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-highlight-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-highlight-500/20 transition-colors"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-800 to-brand-950 rounded-full flex items-center justify-center text-accent-500 shadow-xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
                 <Video size={48} />
              </div>
            </div>
            
            <div className="space-y-6 text-left inline-block mb-12 bg-black/20 p-8 rounded-2xl border border-white/5 w-full">
               <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-highlight-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-sm text-brand-400 block uppercase tracking-wider mb-1">When</span>
                    <span className="text-lg text-white font-medium">{t.joinLive.schedule}</span>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <Globe className="w-6 h-6 text-highlight-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-sm text-brand-400 block uppercase tracking-wider mb-1">Language</span>
                    <span className="text-lg text-white">{t.joinLive.language}</span>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <Video className="w-6 h-6 text-highlight-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-sm text-brand-400 block uppercase tracking-wider mb-1">Platform</span>
                    <span className="text-lg text-white">{t.joinLive.platform}</span>
                  </div>
               </div>
            </div>

            <div>
               <Button icon={<ExternalLink size={20} />}>
                 {t.joinLive.btn}
               </Button>
               <div className="mt-6 text-sm text-brand-300 bg-white/5 inline-block px-4 py-2 rounded-lg border border-white/5">
                 <span className="text-brand-400 font-bold">Meeting ID:</span> 812 3456 7890 <span className="mx-2">|</span> <span className="text-brand-400 font-bold">Passcode:</span> RISEUP
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GetInvolvedPage = () => {
  const { t } = useLanguage();
  return (
    <div className="py-24 min-h-screen bg-brand-950 relative">
      {/* Background flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[800px] bg-brand-800/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">{t.getInvolved.title}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { 
              icon: <Users className="w-10 h-10 text-accent-500" />,
              title: t.getInvolved.lead,
              desc: t.getInvolved.leadDesc,
              cta: 'Contact Us'
            },
            { 
              icon: <Video className="w-10 h-10 text-highlight-400" />,
              title: t.getInvolved.help,
              desc: t.getInvolved.helpDesc,
              cta: 'Volunteer'
            },
            { 
              icon: <Heart className="w-10 h-10 text-accent-500" />,
              title: t.getInvolved.connect,
              desc: t.getInvolved.connectDesc,
              cta: 'Join Facebook'
            },
          ].map((item, i) => (
            <div key={i} className="group bg-white/5 p-8 rounded-3xl shadow-lg border border-white/5 flex flex-col items-center text-center hover:bg-white/10 hover:border-accent-500/30 hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-brand-900 rounded-full flex items-center justify-center mb-8 shadow-xl border border-white/5 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-brand-200 mb-10 flex-grow font-light leading-relaxed">{item.desc}</p>
              <Button variant="outline" className="w-full">
                {item.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-brand-950 text-white selection:bg-accent-500/30 selection:text-white">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/devotionals" element={<DevotionalsPage />} />
          <Route path="/join" element={<JoinLivePage />} />
          <Route path="/get-involved" element={<GetInvolvedPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </HashRouter>
  );
};

export default App;