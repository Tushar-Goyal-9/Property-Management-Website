import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, ShieldCheck, Zap, Sparkles, Building2, Eye } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import PropertyCard from '../components/property/PropertyCard';
import Spinner from '../components/common/Spinner';
import PageWrapper from '../components/common/PageWrapper';

const Home = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [luxury, setLuxury] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState({ city: '', listingType: '' });

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const [featuredRes, latestRes, luxuryRes, recommendedRes] = await Promise.all([
          api.get('/properties?featured=true&limit=4'),
          api.get('/properties?sortBy=newest&limit=4'),
          api.get('/properties?propertyType=Villa&limit=4'),
          api.get('/properties?hot=true&limit=4'),
        ]);

        setFeatured(featuredRes.data.properties || []);
        setLatest(latestRes.data.properties || []);
        setLuxury(luxuryRes.data.properties || []);
        setRecommended(recommendedRes.data.properties || []);
      } catch (error) {
        console.error('Failed to load homepage sections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery({ ...searchQuery, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchQuery).toString();
    navigate(`/properties?${params}`);
  };

  if (loading) return <Spinner />;

  return (
    <PageWrapper>
      <div className="bg-slate-50/50">

        {/* ── Hero Section (Glassmorphism & High-end Radial Glow) ── */}
        <section className="relative bg-slate-950 overflow-hidden border-b border-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(13,148,136,0.18),transparent)] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-32 text-center">
            {/* Elegant Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-3.5 py-1.5 rounded-full mb-6">
              <Sparkles size={13} className="text-teal-400 animate-pulse" />
              <span className="text-teal-400 text-xs font-semibold tracking-wide uppercase">
                Find Your Premium Sanctuary
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-outfit text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
              Luxury Living,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-500">
                Redefined
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Discover verified real estate selected for quality and exceptional style.
            </p>

            {/* Search Card */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-10 max-w-3xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-2.5 shadow-2xl flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-grow flex items-center gap-3 px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-teal-500/25 focus-within:border-teal-500 transition-all">
                <MapPin size={16} className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city or locality..."
                  value={searchQuery.city}
                  onChange={handleSearchChange}
                  className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
                />
              </div>

              <div className="sm:w-48 flex items-center px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-teal-500/25 focus-within:border-teal-500 transition-all">
                <select
                  name="listingType"
                  value={searchQuery.listingType}
                  onChange={handleSearchChange}
                  className="w-full bg-transparent text-sm text-slate-300 outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-950 text-slate-300">Buy or Rent</option>
                  <option value="Sale" className="bg-slate-950 text-slate-300">For Sale</option>
                  <option value="Rent" className="bg-slate-950 text-slate-300">For Rent</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/10"
              >
                <Search size={15} />
                Explore
              </button>
            </form>
          </div>
        </section>

        {/* ── Section 1: Featured Properties (Light Neutral Slate-50) ── */}
        {featured.length > 0 && (
          <section className="bg-slate-50/60 py-20 border-b border-slate-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500">Hand-picked Excellence</p>
                  </div>
                  <h2 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">Featured Collection</h2>
                </div>
                <Link
                  to="/properties?featured=true"
                  className="group flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Browse all <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Section 2: Latest Listings (Alternating: Warm White) ── */}
        {latest.length > 0 && (
          <section className="bg-white py-20 border-b border-slate-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-teal-500">New Arrivals</p>
                  </div>
                  <h2 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">Latest Listings</h2>
                </div>
                <Link
                  to="/properties?sortBy=newest"
                  className="group flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Browse new <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {latest.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Section 3: Luxury Collection (Contrast Dark Premium Section) ── */}
        {luxury.length > 0 && (
          <section className="bg-slate-950 py-24 text-white relative overflow-hidden border-b border-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(13,148,136,0.06),transparent_50%)] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400">Luxury Collection</p>
                  </div>
                  <h2 className="font-outfit text-3xl font-extrabold tracking-tight">Exclusive Villas</h2>
                </div>
                <Link
                  to="/properties?propertyType=Villa"
                  className="group flex items-center gap-1 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Browse luxury <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Grid of Villas cards (themed cleanly with a glass backdrop fallback) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {luxury.map((property) => (
                  <div key={property._id} className="text-slate-900">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Section 4: Recommended Listings (Alternating: Clean Slate-50) ── */}
        {recommended.length > 0 && (
          <section className="bg-slate-50/50 py-20 border-b border-slate-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-rose-500">Trending Now</p>
                  </div>
                  <h2 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">Recommended Properties</h2>
                </div>
                <Link
                  to="/properties?hot=true"
                  className="group flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Browse trending <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommended.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Premium Platform Core Features (Non-fake static overview) ── */}
        <section className="bg-white py-20 border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">Designed for Direct Connection</h2>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                Connect directly with property owners and listed agency agents with transparent pricing and verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50/60 border border-slate-200/50 rounded-2xl p-8 hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300">
                <div className="h-12 w-12 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                  <ShieldCheck size={22} strokeWidth={1.5} />
                </div>
                <h3 className="font-outfit text-lg font-bold text-slate-900 mb-2">Verified Agents</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Every listed agent has registered details and active listings checked for verification.
                </p>
              </div>

              <div className="bg-slate-50/60 border border-slate-200/50 rounded-2xl p-8 hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300">
                <div className="h-12 w-12 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                  <Zap size={22} strokeWidth={1.5} />
                </div>
                <h3 className="font-outfit text-lg font-bold text-slate-900 mb-2">Direct Contact Flow</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Inquire directly on any property detail page to deliver your contact message directly.
                </p>
              </div>

              <div className="bg-slate-50/60 border border-slate-200/50 rounded-2xl p-8 hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300">
                <div className="h-12 w-12 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                  <Building2 size={22} strokeWidth={1.5} />
                </div>
                <h3 className="font-outfit text-lg font-bold text-slate-900 mb-2">Detailed Inventories</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Explore properties with high-resolution image uploads, area specs, and full description records.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Premium Call To Action (Minimal and High-End) ── */}
        {(!user || user.role === 'user') && (
          <section className="bg-slate-950 py-24 border-t border-slate-900">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
              <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Partner with Property Dunia Today
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                Explore real estate or register an account to list new properties in the system.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-2">
                <Link
                  to="/properties"
                  className="bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
                >
                  Browse Directory <Eye size={15} />
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 font-semibold text-sm px-8 py-3.5 rounded-xl border border-slate-800 transition-all duration-200 inline-flex items-center justify-center"
                >
                  Become an Agent
                </Link>
              </div>
            </div>
          </section>
        )}

      </div>
    </PageWrapper>
  );
};

export default Home;