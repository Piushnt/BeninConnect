import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { usePageContent } from '../hooks/usePageContent';
import { motion } from 'motion/react';
import { 
  FileText, 
  Users, 
  Building2, 
  TrendingUp, 
  ChevronRight, 
  Download, 
  CheckCircle2, 
  MapPin,
  Map,
  Clock,
  Calendar,
  MessageSquare,
  Vote,
  Briefcase,
  Gavel,
  Coins
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NewsSlider } from '../components/NewsSlider';
import { DynamicPoll } from '../components/DynamicPoll';
import { PartnerTicker } from '../components/PartnerTicker';

export const LocalHome: React.FC = () => {
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const { sections } = usePageContent('home');

  const budgetContent = sections.budget || {
    title: "Budget Participatif",
    description: "Participez aux décisions de la commune. Votre avis compte pour l'orientation du budget et des projets locaux.",
    button_text: "Participer maintenant",
    amount: "500 millions FCFA"
  };

  const iconMap: Record<string, any> = {
    'Arrondissements': MapPin,
    'Habitants': Users,
    'Projets': TrendingUp,
    'Satisfaction': CheckCircle2,
    'Villages': Map,
    'Services': Clock
  };

  const defaultStats = [
    { label: 'Arrondissements', value: '8', icon: MapPin },
    { label: 'Habitants', value: '132K+', icon: Users },
    { label: 'Projets', value: '12+', icon: TrendingUp },
    { label: 'Satisfaction', value: '94%', icon: CheckCircle2 },
  ];

  const stats = sections.stats ? (sections.stats as any[]).map((s: any) => ({
    ...s,
    icon: iconMap[s.label] || TrendingUp
  })) : defaultStats;

  const heroContent = sections.hero || {
    title: "Rapports & \nDocuments Officiels",
    subtitle: "Consultez les derniers comptes-rendus de sessions, les arrêtés municipaux et les rapports d'activités pour rester informé de la gestion de votre commune.",
    badge: "Transparence Municipale",
    image_url: null
  };

  const essentialIconMap: Record<string, any> = {
    'Users': Users,
    'Building2': Building2,
    'Briefcase': Briefcase,
    'Coins': Coins,
    'FileText': FileText
  };

  const defaultEssentials = [
    { 
      title: 'ÉTAT CIVIL', 
      desc: 'Demandez vos actes de naissance, mariage ou décès en ligne.',
      category: 'ADMINISTRATIF',
      icon: Users,
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      path: `/${tenant?.slug}/services?category=État Civil`
    },
    { 
      title: 'URBANISME & FONCIER', 
      desc: 'Consultez le plan cadastral et demandez vos permis de construire.',
      category: 'SERVICES',
      icon: Building2,
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      path: `/${tenant?.slug}/services?category=Urbanisme`
    },
    { 
      title: 'MARCHÉS PUBLICS', 
      desc: 'Consultez les appels d\'offres et opportunités d\'affaires.',
      category: 'ÉCONOMIE',
      icon: Briefcase,
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      path: `/${tenant?.slug}/opportunites?type=marche_public`
    },
    { 
      title: 'TAXES LOCALES', 
      desc: 'Payez vos taxes de voirie et de développement local en toute sécurité.',
      category: 'FISCALITÉ',
      icon: Coins,
      color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      path: `/${tenant?.slug}/simulateur`
    },
  ];

  const essentials = sections.essentials ? (sections.essentials as any[]).map((e: any) => ({
    ...e,
    icon: essentialIconMap[e.icon] || FileText,
    path: `/${tenant?.slug}${e.path_suffix}`
  })) : defaultEssentials;

  return (
    <div className="space-y-0 dark:bg-gray-950">
      {/* News Slider */}
      <NewsSlider />

      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900 overflow-hidden py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-[#008751] dark:text-green-400 font-bold text-[10px] uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008751] dark:bg-green-400" />
                {heroContent.badge}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] uppercase tracking-tight whitespace-pre-line">
                {heroContent.title}
              </h1>
              <div className="w-14 h-1.5 bg-[#EBB700]" />
              <p className="text-base text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
                {heroContent.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3.5 bg-[#008751] dark:bg-green-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#006b40] transition-all shadow-lg shadow-[#008751]/20 active:scale-95">
                  ACCÉDER AUX ARCHIVES
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl p-8 max-w-md mx-auto relative z-10">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-[#008751] dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Rapport de session</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Session Communale • 2026-04-07</p>
                <button className="text-[#008751] dark:text-green-400 font-bold text-sm flex items-center gap-2 hover:underline">
                  TÉLÉCHARGER
                  <Download className="w-4 h-4" />
                </button>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 rounded-full blur-3xl -z-10 opacity-50" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 dark:bg-gray-950 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center space-y-1.5"
              >
                <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Essentials Section */}
      <section className="py-16 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-black text-[#004d2c] dark:text-green-400 uppercase tracking-tight">Essentiels</h2>
            <div className="w-20 h-1.5 bg-[#EBB700] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {essentials.map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -6 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.color)}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.2em]">{item.category}</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight leading-tight group-hover:text-[#008751] dark:group-hover:text-green-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-medium">
                  {item.desc}
                </p>
                <button 
                  onClick={() => navigate(item.path)}
                  className="text-[#008751] dark:text-green-400 font-bold text-[9px] flex items-center gap-2 uppercase tracking-widest border-b-2 border-[#EBB700] w-fit pb-1 group-hover:gap-3 transition-all"
                >
                  Voir les procédures
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Citizen Voice Section (Budget Participatif & Poll) */}
      <section className="py-24 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="text-[10px] font-bold text-[#008751] dark:text-green-400 uppercase tracking-[0.3em]">Démocratie Participative</div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                {budgetContent.title}
              </h2>
              <div className="w-20 h-1.5 bg-[#EBB700]" />
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                {budgetContent.description}
              </p>
              
              <div className="bg-[#006b40] dark:bg-[#004d2c] p-8 rounded-[40px] text-white space-y-6 relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black opacity-60 uppercase tracking-widest">Enveloppe Globale</div>
                      <div className="text-3xl font-black tracking-tighter text-[#EBB700]">{budgetContent.amount}</div>
                    </div>
                    <Coins className="w-10 h-10 text-[#EBB700] opacity-40" />
                  </div>
                  <Link 
                    to={`/${tenant?.slug}/budget-participatif`}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#EBB700] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all"
                  >
                    {budgetContent.button_text}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-green-50 dark:bg-green-900/10 rounded-[56px] blur-2xl -z-10" />
              <DynamicPoll />
            </div>
          </div>
        </div>
      </section>
      <PartnerTicker />
    </div>
  );
};
