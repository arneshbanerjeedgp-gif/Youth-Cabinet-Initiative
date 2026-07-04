'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lightbulb, 
  Users, 
  CheckCircle, 
  Award, 
  BookOpen, 
  Flame, 
  Heart, 
  Cpu, 
  Briefcase, 
  Scale, 
  Globe, 
  Megaphone, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown, 
  Mail, 
  Menu, 
  X, 
  ExternalLink,
  ChevronUp,
  FileCheck,
  Check,
  MessageSquare
} from 'lucide-react';

// Interfaces for structured data
interface MemberInterest {
  fullName: string;
  admissionNumber: string;
  className: string;
  section: string;
  email: string;
  timestamp: string;
}

interface ContactMessage {
  name: string;
  email: string;
  role: string;
  message: string;
  timestamp: string;
}

export default function Home() {
  // Mobile navigation and view controllers
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'about'>('home');
  
  // Interactive state lists
  const [interestForm, setInterestForm] = useState({
    fullName: '',
    admissionNumber: '',
    className: 'IX',
    section: 'A',
    email: '',
  });
  const [interestErrors, setInterestErrors] = useState<Record<string, string>>({});
  const [interestDbError, setInterestDbError] = useState('');
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [interestCount, setInterestCount] = useState<number>(24); // Starting default mock community interests

  // Load actual interests count on mount to avoid SSR hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yc_interest_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInterestCount(parsed.length);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    role: 'Student',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Accordion active keys
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
    0: true, // first open by default
  });

  // Animated counters state (increment from 0 to targets)
  const [stats, setStats] = useState({
    students: 0,
    sections: 0,
    ministries: 0,
    ideas: 0,
  });

  // Increment stats on page load
  useEffect(() => {
    const duration = 1200; // ms
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setStats({
        students: Math.min(Math.round((300 / steps) * currentStep), 300),
        sections: Math.min(Math.round((10 / steps) * currentStep), 10),
        ministries: Math.min(Math.round((10 / steps) * currentStep), 10),
        ideas: currentStep === steps ? 9999 : Math.round((currentStep / steps) * 100),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Form handlers
  const handleInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    setInterestDbError('');

    const { fullName, admissionNumber, className, section, email } = interestForm;

    // Required fields validation
    if (!fullName.trim()) {
      errors.fullName = "Full Name is required.";
    }

    if (!admissionNumber) {
      errors.admissionNumber = "Admission Number is required.";
    } else {
      // Must contain exactly 5 digits. Only numeric characters (0-9).
      const digitsOnly = /^\d+$/;
      if (!digitsOnly.test(admissionNumber) || admissionNumber.length !== 5) {
        errors.admissionNumber = "Admission Number must be exactly 5 digits.";
      }
    }

    if (!className) {
      errors.className = "Class is required.";
    }

    if (!section) {
      errors.section = "Section is required.";
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "Email Address is required.";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
      setInterestErrors(errors);
      return;
    }

    setInterestErrors({});

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yc_interest_list') || '[]';
      try {
        const parsed: MemberInterest[] = JSON.parse(saved);
        
        // Check for duplicate response using Admission Number
        const exists = parsed.some(
          (item) => item.admissionNumber === admissionNumber
        );

        if (exists) {
          setInterestDbError("A response has already been submitted using this Admission Number. Only one response per student is allowed.");
          return;
        }

        // Add new unique record
        const newRecord: MemberInterest = {
          fullName: fullName.trim(),
          admissionNumber,
          className,
          section,
          email: email.trim(),
          timestamp: new Date().toISOString()
        };

        parsed.push(newRecord);
        localStorage.setItem('yc_interest_list', JSON.stringify(parsed));
        setInterestCount(parsed.length);
        setInterestSubmitted(true);

        // Submit to Formspree
        fetch('https://formspree.io/f/xqevwoer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            "Full Name": fullName.trim(),
            "Admission Number": admissionNumber,
            "Class": className,
            "Section": section,
            "Email Address": email.trim(),
            "Submission Date": newRecord.timestamp
          })
        }).catch(err => {
          console.error("Formspree submission error:", err);
        });
        
        // Reset form
        setInterestForm({
          fullName: '',
          admissionNumber: '',
          className: 'IX',
          section: 'A',
          email: '',
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yc_contact_messages') || '[]';
      try {
        const parsed: ContactMessage[] = JSON.parse(saved);
        parsed.push({
          ...contactForm,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('yc_contact_messages', JSON.stringify(parsed));
      } catch (err) {
        console.error(err);
      }
    }

    setContactSubmitted(true);
    setContactForm({ name: '', email: '', role: 'Student', message: '' });
    setTimeout(() => {
      setContactSubmitted(false);
    }, 6000);
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Nav scroll helper
  const navigateToSection = (sectionId: string, page: 'home' | 'about') => {
    setActiveTab(page);
    setIsMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#070A13] bg-radial from-slate-950 via-[#070A13] to-slate-950 flex flex-col items-center justify-center py-0 sm:py-8 px-0 sm:px-4 text-slate-100 select-none antialiased">
      
      {/* Outer Aesthetic Framework - ONLY visible on Desktop */}
      <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col space-y-4 max-w-[320px] text-white/80 select-none">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 mb-4">
            ● Pre-Implementation Proposal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            🛡️ Youth Cabinet
          </h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            This workspace displays a high-fidelity preview of the Youth Cabinet portal, optimised strictly for mobile device standards.
          </p>
          <div className="border-t border-white/10 my-4 pt-4 space-y-2 text-xs">
            <p className="flex justify-between"><span className="text-slate-400">Target Width:</span> <span className="font-mono text-white">480px (Max)</span></p>
            <p className="flex justify-between"><span className="text-slate-400">Environment:</span> <span className="font-mono text-white">Next.js 15 Standalone</span></p>
            <p className="flex justify-between"><span className="text-slate-400">Primary Color:</span> <span className="font-mono text-[#3B82F6]">#3B82F6</span></p>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Interactive Stats</p>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Interest Registry:</span>
              <span className="bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-white">{interestCount} Entries</span>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1">Submit interest inside the app to see values increment in real-time.</p>
          </div>
        </div>
      </div>

      {/* Main Responsive Mobile Container */}
      <div className="w-full sm:max-w-[460px] min-h-screen sm:min-h-[880px] sm:rounded-[32px] bg-[#090D16] shadow-[0_0_80px_rgba(0,0,0,0.8)] relative flex flex-col overflow-y-auto no-scrollbar sm:border-8 sm:border-slate-800/80 transition-all duration-300">
        
        {/* Sticky Header Navigation */}
        <header className="sticky top-0 z-50 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/50 flex items-center justify-between px-5 py-4 shadow-sm">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex flex-col items-start focus:outline-none group text-left"
          >
            <span className="font-bold text-base text-slate-100 flex items-center gap-1.5 transition-colors group-hover:text-blue-400">
              <Shield className="w-5 h-5 text-amber-500 fill-amber-500/20" /> 
              Youth Cabinet
            </span>
            <span className="text-[9px] text-slate-400 font-medium tracking-widest uppercase mt-0.5">
              Leadership • Service • Innovation
            </span>
          </button>

          {/* Navigation Trigger */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-200 transition-all active:scale-95"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Expanded Navigation Drawer */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-[#090D16]/95 backdrop-blur-lg border-b border-slate-850 shadow-xl px-6 py-6 flex flex-col space-y-3 z-40"
              >
                <button
                  onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}
                  className={`w-full py-3 px-4 rounded-xl text-left font-medium text-sm flex items-center justify-between transition-all ${
                    activeTab === 'home' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'hover:bg-slate-800/60 text-slate-100'
                  }`}
                >
                  <span>Home</span>
                  {activeTab === 'home' && <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setActiveTab('about'); setIsMenuOpen(false); }}
                  className={`w-full py-3 px-4 rounded-xl text-left font-medium text-sm flex items-center justify-between transition-all ${
                    activeTab === 'about' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'hover:bg-slate-800/60 text-slate-100'
                  }`}
                >
                  <span>Learn More (About)</span>
                  {activeTab === 'about' && <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => navigateToSection('faq-section', activeTab)}
                  className="w-full py-3 px-4 rounded-xl text-left font-medium text-sm text-slate-100 hover:bg-slate-800/60 transition-all flex items-center justify-between"
                >
                  <span>FAQ</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => navigateToSection('contact-section', activeTab)}
                  className="w-full py-3 px-4 rounded-xl text-left font-medium text-sm text-slate-100 hover:bg-slate-800/60 transition-all flex items-center justify-between"
                >
                  <span>Contact</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Dynamic Inner Container Pages */}
        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              
              /* ================= PAGE 1: HOME VIEW ================= */
              <motion.div
                key="home-page"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-10 pb-16 px-6 bg-gradient-to-b from-blue-950/20 via-slate-900/10 to-transparent">
                  
                  {/* Floating abstract decorative graphics */}
                  <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-blue-500/10 blur-2xl animate-pulse" />
                  <div className="absolute top-1/2 -left-20 w-48 h-48 rounded-full bg-amber-500/5 blur-2xl" />

                  <div className="relative z-10 text-center flex flex-col items-center">
                    <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-950/50 text-[#60A5FA] mb-4 shadow-sm border border-blue-800/30">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                      Student-Led Initiative
                    </span>
                    
                    <h2 className="text-[28px] font-extrabold text-[#F8FAFC] leading-[1.2] tracking-tight max-w-[340px]">
                      Building the Next Generation of <span className="bg-gradient-to-r from-blue-400 to-[#3B82F6] bg-clip-text text-transparent">Student Leaders</span>
                    </h2>
                    
                    <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-[380px]">
                      Youth Cabinet is a student-led leadership initiative that aims to promote leadership, innovation, service, teamwork, and positive change within the school community.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-[320px]">
                      <button
                        onClick={() => {
                          const el = document.getElementById('interest-card');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="w-full py-3.5 px-6 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {"I'm Interested"}
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('about')}
                        className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        Learn More <ArrowRight className="w-4 h-4 text-[#3B82F6]" />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Interest Glassmorphism Card */}
                <section id="interest-card" className="px-5 py-6 relative">
                  <div className="glass-panel rounded-2xl p-6 shadow-premium relative overflow-hidden border border-slate-800/80 bg-slate-900/40">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-3xl" />
                    
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-900/30">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100">Join the Youth Cabinet Interest List</h3>
                        <p className="text-xs text-slate-400">Register your support for this student leadership proposal</p>
                      </div>
                    </div>

                    {interestSubmitted ? (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 rounded-2xl p-5 text-center space-y-4"
                      >
                        <div className="mx-auto w-12 h-12 bg-emerald-900/40 border border-emerald-700/30 rounded-full flex items-center justify-center text-emerald-400">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-slate-100">Thank you! Your interest has been recorded successfully.</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Your response has been securely saved. Only one submission per student is permitted. We appreciate your interest in Youth Cabinet. Updates about this student leadership initiative will be shared if the project moves forward.
                          </p>
                        </div>
                        <button
                          onClick={() => setInterestSubmitted(false)}
                          className="text-[11px] font-semibold text-[#3B82F6] hover:underline"
                        >
                          Submit another response
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleInterestSubmit} id="yc-interest-form" className="space-y-4 text-left">
                        
                        {/* 1. Full Name */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-300">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            id="yc-interest-fullname"
                            placeholder="Enter your full name"
                            value={interestForm.fullName}
                            onChange={(e) => setInterestForm({ ...interestForm, fullName: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                          />
                          {interestErrors.fullName && (
                            <p className="text-[10px] text-red-400 font-medium mt-0.5">{interestErrors.fullName}</p>
                          )}
                        </div>

                        {/* 2. Admission Number */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-300">
                            Admission Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            id="yc-interest-admission"
                            placeholder="e.g. 2456"
                            value={interestForm.admissionNumber}
                            onChange={(e) => setInterestForm({ ...interestForm, admissionNumber: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                          />
                          {interestErrors.admissionNumber && (
                            <p className="text-[10px] text-red-400 font-medium mt-0.5">{interestErrors.admissionNumber}</p>
                          )}
                        </div>

                        {/* 3. Class */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-300">
                            Class <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="yc-interest-class"
                            value={interestForm.className}
                            onChange={(e) => setInterestForm({ ...interestForm, className: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all appearance-none"
                          >
                            <option value="IX">IX</option>
                          </select>
                          {interestErrors.className && (
                            <p className="text-[10px] text-red-400 font-medium mt-0.5">{interestErrors.className}</p>
                          )}
                        </div>

                        {/* 4. Section */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-300">
                            Section <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="yc-interest-section"
                            value={interestForm.section}
                            onChange={(e) => setInterestForm({ ...interestForm, section: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all appearance-none"
                          >
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((sec) => (
                              <option key={sec} value={sec}>{sec}</option>
                            ))}
                          </select>
                          {interestErrors.section && (
                            <p className="text-[10px] text-red-400 font-medium mt-0.5">{interestErrors.section}</p>
                          )}
                        </div>

                        {/* 5. Email Address */}
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-300">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            id="yc-interest-email"
                            placeholder="Enter your email address"
                            value={interestForm.email}
                            onChange={(e) => setInterestForm({ ...interestForm, email: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                          />
                          {interestErrors.email && (
                            <p className="text-[10px] text-red-400 font-medium mt-0.5">{interestErrors.email}</p>
                          )}
                        </div>

                        {/* Duplicate or database error */}
                        {interestDbError && (
                          <div className="bg-red-950/40 border border-red-800/40 text-red-400 p-3.5 rounded-xl text-xs font-medium leading-relaxed mt-2">
                            ⚠️ {interestDbError}
                          </div>
                        )}

                        <button
                          type="submit"
                          id="yc-interest-submit-btn"
                          className="w-full py-3.5 mt-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {"✅ I'm Interested"}
                        </button>
                      </form>
                    )}

                    <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/50 pt-3">
                      <span>⚡ Proposed platform initiative</span>
                      <span className="font-semibold text-slate-200">{interestCount} supporters registered</span>
                    </div>
                  </div>
                </section>

                {/* Trust Section */}
                <section className="px-5 py-8 bg-[#0B1329]/40">
                  <div className="text-center mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B82F6]">Core Directives</h3>
                    <h4 className="text-lg font-extrabold text-[#F8FAFC] mt-1">Our Pillars of Growth</h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Pillar 1 */}
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 shadow-premium flex items-start gap-4 hover:shadow-premium-hover transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center text-[#3B82F6] shrink-0 group-hover:scale-105 transition-transform border border-blue-900/30">
                        <Shield className="w-5 h-5 fill-blue-500/10" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-[#F8FAFC]">Leadership</h5>
                        <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                          Develop communication, strategy, and comprehensive leadership skills to prepare students for real-world impact.
                        </p>
                      </div>
                    </div>

                    {/* Pillar 2 */}
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 shadow-premium flex items-start gap-4 hover:shadow-premium-hover transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-amber-950 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-105 transition-transform border border-amber-900/30">
                        <Lightbulb className="w-5 h-5 fill-amber-500/10" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-[#F8FAFC]">Innovation</h5>
                        <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                          Encourage AI literacy, coding clubs, student startups, and structured academic research.
                        </p>
                      </div>
                    </div>

                    {/* Pillar 3 */}
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 shadow-premium flex items-start gap-4 hover:shadow-premium-hover transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-105 transition-transform border border-emerald-900/30">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-[#F8FAFC]">Community</h5>
                        <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                          Work together seamlessly to launch positive projects, tutoring systems, and school events.
                        </p>
                      </div>
                    </div>

                    {/* Pillar 4 */}
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 shadow-premium flex items-start gap-4 hover:shadow-premium-hover transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform border border-indigo-900/30">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-[#F8FAFC]">Integrity</h5>
                        <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                          Promote complete transparency, ethics, personal accountability, and collaborative decision making.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Statistics Section */}
                <section className="bg-gradient-to-r from-[#0B1224] via-blue-950/40 to-[#0B1224] text-white py-10 px-6 relative overflow-hidden border-y border-slate-800/50">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.02),transparent_50%)]" />
                  
                  <div className="relative z-10 text-center mb-8">
                    <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Impact Metrics</span>
                    <h3 className="text-xl font-bold mt-1 text-slate-100">Proposed Scale & Potential</h3>
                  </div>

                  <div className="relative z-10 grid grid-cols-2 gap-4">
                    {/* Stat 1 */}
                    <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/60 text-center backdrop-blur-sm">
                      <span className="block text-2xl font-black text-slate-100">{stats.students}+</span>
                      <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">Students Supported</span>
                    </div>

                    {/* Stat 2 */}
                    <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/60 text-center backdrop-blur-sm">
                      <span className="block text-2xl font-black text-slate-100">{stats.sections}</span>
                      <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">Active Sections</span>
                    </div>

                    {/* Stat 3 */}
                    <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/60 text-center backdrop-blur-sm">
                      <span className="block text-2xl font-black text-slate-100">{stats.ministries}</span>
                      <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">Ministries Specified</span>
                    </div>

                    {/* Stat 4 */}
                    <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/60 text-center backdrop-blur-sm">
                      <span className="block text-2xl font-black text-amber-400">∞</span>
                      <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">Innovative Ideas</span>
                    </div>
                  </div>
                </section>

              </motion.div>
            ) : (
              
              /* ================= PAGE 2: ABOUT VIEW ================= */
              <motion.div
                key="about-page"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                {/* About Hero */}
                <section className="relative overflow-hidden pt-10 pb-8 px-6 bg-gradient-to-b from-blue-950/20 to-transparent text-center">
                  <div className="absolute -top-10 right-1/4 w-36 h-36 rounded-full bg-blue-500/5 blur-xl" />
                  
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-950/50 text-amber-400 mb-3 border border-amber-900/30">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Student Leadership Proposal
                  </span>

                  <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                    About Youth Cabinet
                  </h2>
                  <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed max-w-[380px] mx-auto">
                    A comprehensive student leadership structure designed to encourage real-world responsibility, modern innovation, and continuous service among students.
                  </p>
                </section>

                {/* Important Disclaimer Card */}
                <section className="px-5 pb-6">
                  <div className="bg-amber-950/15 border-l-4 border-amber-500 rounded-r-xl p-4 shadow-sm border border-y-amber-900/10 border-r-amber-900/10">
                    <div className="flex gap-2.5">
                      <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-left">
                        <span className="block text-xs font-bold text-amber-400 uppercase tracking-wider">Formal Notice</span>
                        <p className="text-[11px] text-amber-300 mt-1 leading-relaxed">
                          This is currently a student-led proposal intended to encourage leadership and participation. It is not an official governing body and would require school approval before any formal implementation.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Vision & Mission Bento Layout */}
                <section className="px-5 py-4 grid grid-cols-1 gap-4">
                  {/* Vision */}
                  <div className="bg-gradient-to-br from-blue-950 to-[#0F172A] text-white p-5 rounded-2xl relative overflow-hidden shadow-premium border border-blue-900/30">
                    <div className="absolute top-2 right-2 w-16 h-16 bg-white/5 rounded-full blur-lg" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Our Vision</span>
                    <h3 className="text-lg font-extrabold mt-1 text-slate-100">Create Future Leaders</h3>
                    <p className="text-xs text-blue-200/90 mt-2 leading-relaxed">
                      Nurture capable, collaborative, and ethical minds equipped with real communication, innovation, and strategic leadership traits.
                    </p>
                  </div>

                  {/* Mission */}
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-premium relative overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-slate-950/40 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Our Mission</span>
                    <h3 className="text-lg font-extrabold text-[#F8FAFC] mt-1">Empower & Collaborate</h3>
                    <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                      To empower active students to serve communities, build cutting-edge digital/scientific innovations, and collaborate with administration transparently.
                    </p>
                  </div>
                </section>

                {/* Core Values (7 values cards) */}
                <section className="px-5 py-6 bg-[#0B1329]/40">
                  <div className="text-center mb-5">
                    <span className="text-xs font-bold tracking-widest text-[#3B82F6] uppercase">Foundations</span>
                    <h3 className="text-lg font-extrabold text-[#F8FAFC] mt-0.5">Core Values</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 'Leadership', desc: 'Guiding with vision and clarity.', bg: 'bg-blue-950 text-[#60A5FA]' },
                      { val: 'Integrity', desc: 'Doing right when no one is watching.', bg: 'bg-emerald-950 text-emerald-400' },
                      { val: 'Innovation', desc: 'Embracing AI, code, and design.', bg: 'bg-amber-950 text-amber-400' },
                      { val: 'Transparency', desc: 'Open agendas and clear decisions.', bg: 'bg-indigo-950 text-indigo-400' },
                      { val: 'Respect', desc: 'Fostering inclusive mutual dignity.', bg: 'bg-rose-950 text-rose-400' },
                      { val: 'Community', desc: 'Collective action for betterment.', bg: 'bg-purple-950 text-purple-400' },
                      { val: 'Excellence', desc: 'High standards in everything we do.', bg: 'bg-sky-950 text-sky-400' },
                    ].map((item, index) => (
                      <div key={index} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60 shadow-sm flex flex-col justify-between">
                        <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${item.bg} w-max`}>
                          {item.val}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-2 leading-snug">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Proposed Hierarchy Structure */}
                <section className="px-5 py-8">
                  <div className="text-center mb-6">
                    <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Governance</span>
                    <h3 className="text-lg font-extrabold text-[#F8FAFC] mt-0.5">Proposed Structure</h3>
                    <p className="text-xs text-slate-400 mt-1">A transparent, distributed organizational hierarchy</p>
                  </div>

                  <div className="flex flex-col items-center space-y-3 relative">
                    
                    {/* Level 1 */}
                    <div className="w-full max-w-[340px] bg-gradient-to-r from-blue-950 to-slate-900 text-white p-3.5 rounded-xl text-center shadow-md border border-blue-900/30 relative z-10">
                      <span className="block text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">Executive Level 1</span>
                      <h4 className="text-sm font-bold mt-0.5">President</h4>
                      <p className="text-[10px] text-slate-300 mt-1">Primary student representative, sets annual school community agenda.</p>
                    </div>

                    <div className="w-1 h-4 bg-slate-800 rounded" />

                    {/* Level 2 */}
                    <div className="w-full max-w-[340px] bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center shadow-sm relative z-10">
                      <span className="block text-[10px] text-[#3B82F6] font-extrabold uppercase tracking-widest">Executive Level 2</span>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">Prime Minister</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Coordinates the Ministries, manages reports, drives active initiatives.</p>
                    </div>

                    <div className="w-1 h-4 bg-slate-800 rounded" />

                    {/* Level 3 */}
                    <div className="w-full max-w-[340px] bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center shadow-sm relative z-10">
                      <span className="block text-[10px] text-[#3B82F6] font-extrabold uppercase tracking-widest">Policy & Strategy</span>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">10 Ministers</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Leads specialized task portfolios (Education, Sports, Technology, etc).</p>
                    </div>

                    <div className="w-1 h-4 bg-slate-800 rounded" />

                    {/* Level 4 */}
                    <div className="w-full max-w-[340px] bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center shadow-sm relative z-10">
                      <span className="block text-[10px] text-[#3B82F6] font-extrabold uppercase tracking-widest">Division Leaders</span>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5">10 Chief Ministers</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Supervises class sections, coordinates division feedback channels.</p>
                    </div>

                    <div className="w-1 h-4 bg-slate-800 rounded" />

                    {/* Level 5 */}
                    <div className="w-full max-w-[340px] bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl text-center shadow-sm relative z-10">
                      <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Section Operations</span>
                      <h4 className="text-sm font-bold text-slate-200 mt-0.5">10 Governors</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Individual class block leaders responsible for grassroots feedback.</p>
                    </div>

                  </div>
                </section>

                {/* Proposed 10 Ministries */}
                <section className="px-5 py-8 bg-[#0B1329]/40">
                  <div className="text-center mb-6">
                    <span className="text-xs font-bold tracking-widest text-[#3B82F6] uppercase">Portfolio Directory</span>
                    <h3 className="text-lg font-extrabold text-[#F8FAFC] mt-0.5">Proposed Ministries</h3>
                    <p className="text-xs text-slate-400 mt-1">Ten highly-specialized divisions driving specific campus priorities</p>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { icon: <BookOpen className="w-4 h-4" />, name: 'Education', desc: 'Championing academic growth, peer tutoring networks, and student resources.' },
                      { icon: <Flame className="w-4 h-4" />, name: 'Sports', desc: 'Fostering health, teamwork, school spirit, and organizing tournaments.' },
                      { icon: <Award className="w-4 h-4" />, name: 'Culture', desc: 'Celebrating diversity, performing arts, talent shows, and heritage events.' },
                      { icon: <Heart className="w-4 h-4" />, name: 'Student Welfare', desc: 'Promoting mental wellness, peer support counseling, and inclusive environments.' },
                      { icon: <Cpu className="w-4 h-4" />, name: 'Technology', desc: 'Driving digital solutions, coding hubs, and implementing modern school apps.' },
                      { icon: <Sparkles className="w-4 h-4" />, name: 'Innovation & Entrepreneurship', desc: 'Nurturing student startups, hackathons, and creative design sprints.' },
                      { icon: <Scale className="w-4 h-4" />, name: 'Governance & Ethics', desc: 'Promoting accountability, fair election campaigns, and transparent policies.' },
                      { icon: <Globe className="w-4 h-4" />, name: 'Community Service', desc: 'Leading off-campus charity drives, environmental actions, and local campaigns.' },
                      { icon: <Megaphone className="w-4 h-4" />, name: 'Communications', desc: 'Keeping students informed via creative bulletins, newsletters, and visual media.' },
                      { icon: <Briefcase className="w-4 h-4" />, name: 'Leadership & Student Development', desc: 'Coordinating student mentor circles, speaker forums, and growth programs.' },
                    ].map((min, index) => (
                      <div key={index} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60 shadow-sm flex gap-3.5 items-start hover:bg-slate-900/90 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-blue-950 flex items-center justify-center text-[#3B82F6] shrink-0 mt-0.5 border border-blue-900/30">
                          {min.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{min.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{min.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Why Join Benefits */}
                <section className="px-6 py-8">
                  <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800/80 shadow-premium relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-3xl" />
                    
                    <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                      Why Join Youth Cabinet?
                    </h3>

                    <ul className="space-y-3">
                      {[
                        'Develop premium communication & public speaking skills',
                        'Learn the dynamics of distributed operational teamwork',
                        'Organize meaningful initiatives that impact campus life',
                        'Build real-world innovation and technology projects',
                        'Actively improve school-wide communication channels',
                        'Gain hands-on practical governance and administration experiences',
                        'Make a visible positive impact in the peer community'
                      ].map((benefit, bIdx) => (
                        <li key={bIdx} className="flex gap-2.5 items-start text-xs text-slate-300">
                          <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5 bg-emerald-950 rounded-full p-0.5" />
                          <span className="leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= SHARED BOTTOM SECTIONS ================= */}
          
          {/* FAQ Accordion Section */}
          <section id="faq-section" className="px-5 py-8 bg-[#0B1329]/40 border-t border-slate-800/60">
            <div className="text-center mb-6">
              <span className="text-xs font-bold tracking-widest text-[#3B82F6] uppercase">Knowledge Base</span>
              <h3 className="text-lg font-extrabold text-[#F8FAFC] mt-0.5">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'What is Youth Cabinet?',
                  a: 'Youth Cabinet is a structured, student-led leadership proposal that seeks to empower students through active service portfolios, horizontal teamwork, and scientific/creative innovation.'
                },
                {
                  q: 'Is this official?',
                  a: 'This is currently a student-led proposal designed to encourage leadership and proactive collaboration. It is not an official school governing board and would require complete administration review and approval before any formal implementation.'
                },
                {
                  q: 'Who can join?',
                  a: 'Every motivated student who wants to improve school life, build exciting digital projects, learn leadership techniques, or coordinate volunteer initiatives is welcome to express interest.'
                },
                {
                  q: 'How will members be selected?',
                  a: 'If approved, members will be chosen through a merit-based, completely transparent nomination and election process reviewed by both student representatives and school advisors.'
                },
                {
                  q: 'Why was this initiative created?',
                  a: 'To bridge the gap between creative student concepts and actionable administration plans, providing students with safe, hands-on administrative responsibility and leadership experiences.'
                }
              ].map((faq, fIdx) => (
                <div 
                  key={fIdx} 
                  className="bg-slate-900/50 rounded-xl border border-slate-800/80 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(fIdx)}
                    className="w-full p-4 text-left font-bold text-xs text-slate-200 flex items-center justify-between hover:bg-slate-800/40 transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    {faqOpen[fIdx] ? (
                      <ChevronUp className="w-4 h-4 text-[#3B82F6] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {faqOpen[fIdx] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact-section" className="px-5 py-8 bg-[#0B1224] border-t border-slate-800/60">
            <div className="text-center mb-6">
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Get In Touch</span>
              <h3 className="text-lg font-extrabold text-slate-100 mt-0.5">Submit Inquiry</h3>
              <p className="text-xs text-slate-400 mt-1">Connect with the project design group</p>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-850 shadow-premium bg-slate-900/40">
              {contactSubmitted ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 p-4 rounded-xl text-center text-xs font-semibold"
                >
                  ✉️ Thank you! Your message has been sent to the Cabinet team.
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="jane@school.edu"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#3B82F6] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Your Role</label>
                      <select
                        value={contactForm.role}
                        onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                        className="w-full bg-slate-950/80 border border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#3B82F6] transition-colors"
                      >
                        <option value="Student">Student</option>
                        <option value="Educator">Educator / Teacher</option>
                        <option value="Parent">Parent</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Message</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your recommendations, feedback or vision here..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </section>

        </main>

        {/* Footer section */}
        <footer className="bg-[#070B18] text-white pt-10 pb-12 px-6 text-center relative border-t border-slate-800/60">
          
          <div className="flex flex-col items-center">
            <span className="font-extrabold text-lg tracking-tight flex items-center gap-2 text-white">
              <Shield className="w-5.5 h-5.5 text-amber-500 fill-amber-500/10" /> 
              Youth Cabinet
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-1">
              Leadership • Service • Innovation
            </span>
          </div>

          <p className="text-[10px] text-slate-400 mt-4 leading-relaxed max-w-[320px] mx-auto">
            Providing a reliable framework for student self-governance, scientific literacy, and community initiatives.
          </p>

          <div className="flex justify-center gap-5 mt-6 text-[11px] font-semibold text-slate-300">
            <button 
              onClick={() => navigateToSection('faq-section', activeTab)}
              className="hover:text-white transition-colors"
            >
              FAQ
            </button>
            <span className="text-slate-800">•</span>
            <a 
              href="mailto:arneshbanerjeedgp@gmail.com"
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
            <span className="text-slate-800">•</span>
            <button 
              onClick={() => {
                alert("Privacy Policy: All mock registered interest emails and contact messages are preserved securely in your personal browser local storage. No data is shared externally.");
              }}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              Privacy <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="border-t border-slate-850 mt-8 pt-6 text-[9px] text-slate-500">
            <p>© {new Date().getFullYear()} Youth Cabinet. Designed with rigorous mobile standards.</p>
            <p className="mt-1 text-amber-500/50">Student Proposal Phase</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
