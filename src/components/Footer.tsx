import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ExternalLink, Shield, Globe, Award } from 'lucide-react';

import { BRANDING } from '../constants';

export const Footer: React.FC = () => {
  const { tenant } = useTenant();
  const { slug } = useParams();

  return (
    <footer className="bg-[#0A1629] dark:bg-gray-950 text-white pt-20 pb-10 border-t border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: National Branding & Main Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img 
                  src={BRANDING.NATIONAL.COAT_OF_ARMS} 
                  alt="Armoiries du Bénin" 
                  className="h-16 w-auto"
                  referrerPolicy="no-referrer"
                />
                <div className="h-12 w-px bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{BRANDING.NATIONAL.NAME}</span>
                  <span className="text-lg font-black uppercase tracking-tight">{BRANDING.NATIONAL.GOVERNMENT_NAME}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">
                La plateforme nationale d'e-gouvernance centralise les services publics des 77 communes pour une administration moderne, transparente et accessible à tous les citoyens.
              </p>
            </div>
            
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Instagram, href: "#" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="w-10 h-10 bg-white/5 hover:bg-[#008751] rounded-xl flex items-center justify-center transition-all hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Institution */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EBB700]">Institution</h3>
              <ul className="space-y-4">
                <li><Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">Portail National</Link></li>
                <li><Link to="/actualites" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">Actualités Nationales</Link></li>
                <li><Link to="/mon-espace" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">Espace Citoyen</Link></li>
                <li><a href="https://service-public.bj" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">Service-Public.bj <ExternalLink className="w-3 h-3" /></a></li>
              </ul>
            </div>

            {/* Column 2: Services */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EBB700]">Services</h3>
              <ul className="space-y-4">
                <li><Link to={slug ? `/${slug}/services` : "#"} className="text-sm text-gray-400 hover:text-white transition-colors">Catalogue des Services</Link></li>
                <li><Link to={slug ? `/${slug}/suivi-dossier` : "#"} className="text-sm text-gray-400 hover:text-white transition-colors">Suivi de Dossier</Link></li>
                <li><Link to={slug ? `/${slug}/signalement` : "#"} className="text-sm text-gray-400 hover:text-white transition-colors">Signalement Urbain</Link></li>
                <li><Link to={slug ? `/${slug}/simulateur` : "#"} className="text-sm text-gray-400 hover:text-white transition-colors">Simulateur de Taxes</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact & Support */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EBB700]">Support</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <Phone className="w-4 h-4 text-[#008751] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-xs">Centre d'appel</p>
                    <p>136 (Numéro Vert)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <Mail className="w-4 h-4 text-[#008751] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-xs">Email Support</p>
                    <p>support@mairie.bj</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Middle Section: Partners & Certifications */}
        <div className="py-10 border-y border-white/5 flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Shield className="w-5 h-5 text-[#008751]" />
            Sécurisé par l'ANSSI
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Globe className="w-5 h-5 text-[#EBB700]" />
            Interopérabilité PND
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Award className="w-5 h-5 text-blue-500" />
            Certifié ISO 27001
          </div>
        </div>

        {/* Bottom Section: Legal & Copyright */}
        <div className="pt-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} {BRANDING.NATIONAL.NAME} • {BRANDING.NATIONAL.MINISTRY}
            </p>
            <p className="text-[10px] text-gray-600 font-medium">
              Plateforme développée par l'{BRANDING.NATIONAL.AGENCY} pour la modernisation de l'administration territoriale.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { label: "Mentions Légales", to: "/mentions-legales" },
              { label: "Confidentialité", to: "/confidentialite" },
              { label: "Cookies", to: "/cookies" },
              { label: "Accessibilité", to: "/accessibilite" }
            ].map((link, i) => (
              <Link 
                key={i} 
                to={link.to} 
                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#EBB700] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
