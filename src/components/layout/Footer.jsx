
import React from 'react';
import { ShieldCheck, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-brand-primary dark:bg-slate-900 text-brand-light dark:text-slate-400 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ShieldCheck className="h-8 w-8 text-brand-secondary" />
              <span className="font-heading text-2xl font-bold">ConsentLens</span>
            </div>
            <p className="text-sm">AI-Powered Privacy & Consent Tracker. Bringing transparency to your digital life.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-heading">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-brand-secondary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-secondary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-brand-secondary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-brand-secondary transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-heading">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-brand-secondary transition-colors"><Twitter size={24} /></a>
              <a href="#" className="hover:text-brand-secondary transition-colors"><Linkedin size={24} /></a>
              <a href="#" className="hover:text-brand-secondary transition-colors"><Github size={24} /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-brand-light/20 dark:border-slate-700 text-center text-sm">
          <p>&copy; {currentYear} ConsentLens. All rights reserved. Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
