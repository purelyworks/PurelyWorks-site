"use client";

import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, CheckCircle2, Loader2, Calendar, MessageSquare, Send } from 'lucide-react';
import { useLeadCapture } from '../context/LeadCaptureContext';
import { submitToHubSpot, lookupHubSpotContact, upsertHubSpotContact } from '../services/hubspotService';

type Step = 'EMAIL' | 'NAME' | 'OPTIONS' | 'BOOKING' | 'MESSAGE';

export const LeadCaptureModal: React.FC = () => {
  const { isModalOpen, closeLeadCapture } = useLeadCapture();
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Message State
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Reset state when closed
  useEffect(() => {
    if (!isModalOpen) {
      // Optional reset
    } else {
      const storedEmail = localStorage.getItem('pw_lead_email');
      const storedName = localStorage.getItem('pw_lead_name');
      if (storedEmail && storedName) {
        setEmail(storedEmail);
        setName(storedName);
      }
    }
  }, [isModalOpen]);

  // HubSpot Script Loader for Meetings
  useEffect(() => {
    if (step === 'BOOKING') {
      const script = document.createElement('script');
      script.src = "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
      script.type = "text/javascript";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [step]);

  if (!isModalOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    // 1. Submit to HubSpot to create contact and associate tracking cookie
    await submitToHubSpot({ email });
    
    const lookupResult = await lookupHubSpotContact(email);
    const lookupFirst = lookupResult?.contact?.firstname?.trim();
    const lookupLast = lookupResult?.contact?.lastname?.trim();
    const lookupName = [lookupFirst, lookupLast].filter(Boolean).join(' ').trim();

    // Check local storage match
    const storedName = localStorage.getItem('pw_lead_name');
    const storedEmail = localStorage.getItem('pw_lead_email');
    
    setIsLoading(false);
    const resolvedName = lookupName || (storedName && storedEmail === email ? storedName : '');
    setName(resolvedName);
    if (resolvedName) {
      localStorage.setItem('pw_lead_email', email);
      localStorage.setItem('pw_lead_name', resolvedName);
      setStep('OPTIONS');
    } else {
      setStep('NAME');
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsLoading(true);

    // Split Name for HubSpot
    const nameParts = name.trim().split(' ');
    const firstname = nameParts[0];
    const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

    // 2. Update contact name in HubSpot CRM (fallback to form submit if needed)
    const upsertResult = await upsertHubSpotContact({ email, firstname, lastname });
    if (!upsertResult) {
      await submitToHubSpot({ email, firstname, lastname });
    }
    
    localStorage.setItem('pw_lead_email', email);
    localStorage.setItem('pw_lead_name', name);
    
    setIsLoading(false);
    setStep('OPTIONS');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingMessage(true);

    // Split Name for consistency
    const nameParts = name.trim().split(' ');
    const firstname = nameParts[0];
    const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

    // 3. Submit Message to HubSpot
    await submitToHubSpot({ 
        email, 
        firstname, 
        lastname, 
        subject: messageSubject, 
        message: messageBody 
    });

    setIsSendingMessage(false);
    setMessageSent(true);
    setTimeout(() => {
      closeLeadCapture();
      setMessageSent(false);
      setMessageBody('');
      setStep('OPTIONS');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`bg-white w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ${step === 'BOOKING' ? 'max-w-5xl h-[85vh]' : 'max-w-lg'}`}>
        
        {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            {step === 'BOOKING' ? (
               <div className="flex items-center gap-2">
                 <button onClick={() => setStep('OPTIONS')} className="text-sm text-slate-500 hover:text-slate-900 font-medium">← Back</button>
                 <span className="text-slate-300">|</span>
                 <span className="text-sm font-bold text-slate-900">Discovery Call</span>
               </div>
            ) : step === 'MESSAGE' ? (
               <div className="flex items-center gap-2">
                 <button onClick={() => setStep('OPTIONS')} className="text-sm text-slate-500 hover:text-slate-900 font-medium">← Back</button>
                 <span className="text-slate-300">|</span>
                 <span className="text-sm font-bold text-slate-900">Send Message</span>
               </div>
            ) : (
              <span className="text-sm font-bold text-slate-900">Let's Get Started</span>
            )}
          </div>
          <button onClick={closeLeadCapture} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto bg-white">
          
          {/* STEP 1: EMAIL */}
          {step === 'EMAIL' && (
            <div className="p-8 animate-fade-in">
              <h3 className="text-2xl font-bold mb-2 text-slate-900">Enter your email</h3>
              <p className="text-slate-500 mb-8">We'll check if we've met before.</p>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 outline-none"
                    style={{ boxShadow: '0 0 0 3px var(--ocean-blue-06)', outline: 'none' }}
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--ocean-blue)' }}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: NAME */}
          {step === 'NAME' && (
            <div className="p-8 animate-fade-in">
              <h3 className="text-2xl font-bold mb-2 text-slate-900">Nice to meet you.</h3>
              <p className="text-slate-500 mb-8">What should we call you?</p>
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-slate-900 outline-none"
                  style={{ boxShadow: '0 0 0 3px var(--ocean-blue-06)' }}
                  autoFocus
                />
                <button type="submit" disabled={isLoading} className="w-full text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--ocean-blue)' }}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Complete <CheckCircle2 size={18} /></>}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: OPTIONS */}
          {step === 'OPTIONS' && (
            <div className="p-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl" style={{ backgroundColor: 'var(--ocean-blue-100)', color: 'var(--ocean-blue)' }}>👋</div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900">Hi {name.split(' ')[0]},</h3>
              <p className="text-slate-500 mb-8">How can we help you today?</p>
              
              <div className="space-y-3">
                <button onClick={() => setStep('BOOKING')} className="w-full text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg" style={{ backgroundColor: 'var(--ocean-blue)' }}>
                  <Calendar size={18} /> Book a Discovery Call
                </button>
                <button onClick={() => { setStep('MESSAGE'); setMessageSubject(`Inquiry from ${name}`); }} className="w-full bg-white text-slate-700 border border-slate-200 font-medium py-4 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare size={18} /> Message Us
                </button>
              </div>
              <button onClick={() => {setStep('EMAIL'); setEmail(''); setName('');}} className="mt-6 text-xs text-slate-400 hover:text-slate-600 underline">Not {name}? Start over.</button>
            </div>
          )}

          {/* STEP 4: BOOKING (HUBSPOT) */}
          {step === 'BOOKING' && (
             <div className="w-full h-full overflow-y-auto bg-white">
                <div className="meetings-iframe-container" data-src="https://meetings-na2.hubspot.com/kheloco/discovery-call-45min?embed=true"></div>
             </div>
          )}

          {/* STEP 5: MESSAGE */}
          {step === 'MESSAGE' && (
            <div className="p-8 animate-fade-in">
              {messageSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} /></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500">Thanks {name.split(' ')[0]}, we'll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                      <input type="text" required value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 outline-none" style={{ boxShadow: '0 0 0 3px var(--ocean-blue-04)' }} />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
                       <textarea required value={messageBody} onChange={(e) => setMessageBody(e.target.value)} rows={5} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 outline-none resize-none" placeholder="How can we help..." style={{ boxShadow: '0 0 0 3px var(--ocean-blue-04)' }}></textarea>
                     </div>
                     <button type="submit" disabled={isSendingMessage} className="w-full text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--ocean-blue)' }}>
                     {isSendingMessage ? <Loader2 className="animate-spin" /> : <>Send Message <Send size={18} /></>}
                   </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
