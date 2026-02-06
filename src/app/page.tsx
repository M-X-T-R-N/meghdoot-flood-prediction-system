"use client";

import { useState } from "react";
import Image from "next/image";
import { SYLHET_FLOOD_ZONES } from "@/lib/flood-data";

type Lang = "en" | "bn";

const t = {
  en: {
    langLabel: "English",
    otherLang: "bn" as Lang,
    otherLangLabel: "বাংলা",
    heroTitle: "Meghdoot",
    heroSubtitle: "Flood Early Warning System for Sylhet",
    heroDesc: "Real-time AI-powered flood prediction using satellite data, river monitoring, and 50 years of historical analysis. Get free SMS alerts before floods reach your area.",
    heroCta: "Register for Free Alerts",
    heroStats: [
      { value: "50+", label: "Years of Data" },
      { value: "15", label: "Monitored Zones" },
      { value: "87%", label: "Prediction Accuracy" },
      { value: "24h", label: "Advance Warning" },
    ],
    howTitle: "How Meghdoot Protects You",
    howSteps: [
      { step: "01", title: "Data Collection", desc: "We continuously monitor rainfall from BMD stations, river water levels from FFWC gauges, and upstream conditions from Meghalaya.", icon: "satellite" },
      { step: "02", title: "AI Analysis", desc: "Our prediction model analyzes 50 years of flood patterns, current weather data, and river gauge readings to calculate flood risk.", icon: "brain" },
      { step: "03", title: "Risk Assessment", desc: "Each of the 15 zones in Sylhet gets a real-time risk score from 0-100, categorized as Normal, Watch, Warning, or Severe.", icon: "chart" },
      { step: "04", title: "SMS Alert", desc: "When your area reaches danger level, you receive a free SMS in Bengali with clear instructions — up to 24 hours before flooding.", icon: "phone" },
    ],
    privacyTitle: "Your Privacy Matters",
    privacyItems: [
      "We only collect your name, phone number, and area — nothing else.",
      "Your phone number is used solely for flood warnings.",
      "We never share your information with third parties.",
      "No advertisements or spam messages — ever.",
      "You can unsubscribe at any time by replying STOP.",
    ],
    freeTitle: "Completely Free Service",
    freeDesc: "Meghdoot is a non-commercial project dedicated to protecting Sylhet's people from flood disasters. No charges, no hidden fees.",
    registerTitle: "Register for Free Flood Alerts",
    registerDesc: "Enter your details below and we will send you early warnings when flood risk is detected in your area.",
    nameLabel: "Full Name",
    namePlaceholder: "e.g. Rahim Uddin",
    phoneLabel: "Phone Number",
    phonePlaceholder: "e.g. 01712345678",
    areaLabel: "Your Area",
    areaPlaceholder: "Select your area",
    langPrefLabel: "Alert Language",
    langPrefBn: "Bengali",
    langPrefEn: "English",
    submitBtn: "Register — It's Free",
    submitting: "Registering...",
    successTitle: "Registration Complete!",
    successDesc: "You will receive SMS alerts when flood risk is detected in your area. Stay safe!",
    errorTitle: "Something went wrong",
    footerNote: "This system supports early awareness and is not an official government warning.",
    alreadyRegistered: "This phone number is already registered.",
    dataSourcesTitle: "Our Data Sources",
    dataSources: [
      { name: "FFWC", desc: "Flood Forecasting & Warning Centre — river gauge data" },
      { name: "BMD", desc: "Bangladesh Meteorological Department — rainfall records" },
      { name: "BWDB", desc: "Bangladesh Water Development Board — water level monitoring" },
      { name: "Satellite", desc: "Remote sensing data for upstream rainfall estimation" },
    ],
  },
  bn: {
    langLabel: "বাংলা",
    otherLang: "en" as Lang,
    otherLangLabel: "English",
    heroTitle: "মেঘদূত",
    heroSubtitle: "সিলেটের বন্যা পূর্বাভাস ব্যবস্থা",
    heroDesc: "স্যাটেলাইট তথ্য, নদী পর্যবেক্ষণ ও ৫০ বছরের তথ্য বিশ্লেষণের মাধ্যমে AI চালিত বন্যার পূর্বাভাস। বন্যা আসার আগেই বিনামূল্যে SMS সতর্কতা পান।",
    heroCta: "বিনামূল্যে নিবন্ধন করুন",
    heroStats: [
      { value: "৫০+", label: "বছরের তথ্য" },
      { value: "১৫", label: "পর্যবেক্ষণ এলাকা" },
      { value: "৮৭%", label: "পূর্বাভাসের নির্ভুলতা" },
      { value: "২৪ ঘণ্টা", label: "আগাম সতর্কতা" },
    ],
    howTitle: "মেঘদূত যেভাবে আপনাকে রক্ষা করে",
    howSteps: [
      { step: "০১", title: "তথ্য সংগ্রহ", desc: "আমরা BMD স্টেশন থেকে বৃষ্টিপাত, FFWC গেজ থেকে নদীর পানির স্তর এবং মেঘালয় থেকে উজানের অবস্থা নিয়মিত পর্যবেক্ষণ করি।", icon: "satellite" },
      { step: "০২", title: "AI বিশ্লেষণ", desc: "আমাদের পূর্বাভাস মডেল ৫০ বছরের বন্যার ধরন, বর্তমান আবহাওয়া এবং নদীর গেজ রিডিং বিশ্লেষণ করে বন্যার ঝুঁকি নির্ণয় করে।", icon: "brain" },
      { step: "০৩", title: "ঝুঁকি মূল্যায়ন", desc: "সিলেটের ১৫টি এলাকা প্রতিটির জন্য ০-১০০ স্কেলে রিয়েল-টাইম ঝুঁকির মাত্রা নির্ধারণ করা হয়।", icon: "chart" },
      { step: "০৪", title: "SMS সতর্কতা", desc: "আপনার এলাকায় বিপদের মাত্রা পৌঁছালে বাংলায় একটি বিনামূল্যে SMS পাবেন — বন্যা আসার ২৪ ঘণ্টা আগে পর্যন্ত।", icon: "phone" },
    ],
    privacyTitle: "আপনার তথ্যের নিরাপত্তা",
    privacyItems: [
      "আমরা শুধু আপনার নাম, ফোন নম্বর ও এলাকা জানতে চাই — অন্য কিছু নয়।",
      "আপনার ফোন নম্বর শুধুমাত্র বন্যার সতর্কতা পাঠাতে ব্যবহার করা হয়।",
      "আমরা আপনার তথ্য কখনো তৃতীয় পক্ষের সাথে শেয়ার করি না।",
      "কোনো বিজ্ঞাপন বা স্প্যাম পাঠানো হয় না।",
      "আপনি যেকোনো সময় STOP লিখে পাঠিয়ে সেবা বন্ধ করতে পারেন।",
    ],
    freeTitle: "সম্পূর্ণ বিনামূল্যে সেবা",
    freeDesc: "মেঘদূত একটি অবাণিজ্যিক প্রকল্প যা সিলেটের মানুষকে বন্যা থেকে রক্ষা করতে কাজ করে। কোনো চার্জ নেই, কোনো গোপন ফি নেই।",
    registerTitle: "বিনামূল্যে বন্যা সতর্কতায় নিবন্ধন করুন",
    registerDesc: "নিচে আপনার তথ্য দিন, আপনার এলাকায় বন্যার ঝুঁকি দেখা দিলে আমরা আপনাকে আগাম জানাব।",
    nameLabel: "পূর্ণ নাম",
    namePlaceholder: "যেমন: রহিম উদ্দিন",
    phoneLabel: "ফোন নম্বর",
    phonePlaceholder: "যেমন: ০১৭১২৩৪৫৬৭৮",
    areaLabel: "আপনার এলাকা",
    areaPlaceholder: "এলাকা নির্বাচন করুন",
    langPrefLabel: "সতর্কতার ভাষা",
    langPrefBn: "বাংলা",
    langPrefEn: "English",
    submitBtn: "নিবন্ধন করুন — বিনামূল্যে",
    submitting: "নিবন্ধন হচ্ছে...",
    successTitle: "নিবন্ধন সম্পন্ন!",
    successDesc: "আপনার এলাকায় বন্যার ঝুঁকি দেখা দিলে আপনি SMS পাবেন। নিরাপদ থাকুন!",
    errorTitle: "কিছু সমস্যা হয়েছে",
    footerNote: "এই ব্যবস্থা প্রাথমিক সচেতনতার জন্য, সরকারি সতর্কতা নয়।",
    alreadyRegistered: "এই ফোন নম্বরটি আগেই নিবন্ধিত আছে।",
    dataSourcesTitle: "আমাদের তথ্যের উৎস",
    dataSources: [
      { name: "FFWC", desc: "বন্যা পূর্বাভাস ও সতর্কতা কেন্দ্র — নদীর গেজ তথ্য" },
      { name: "BMD", desc: "বাংলাদেশ আবহাওয়া অধিদপ্তর — বৃষ্টিপাতের রেকর্ড" },
      { name: "BWDB", desc: "বাংলাদেশ পানি উন্নয়ন বোর্ড — পানির স্তর পর্যবেক্ষণ" },
      { name: "স্যাটেলাইট", desc: "উজানের বৃষ্টিপাত অনুমানে রিমোট সেন্সিং তথ্য" },
    ],
  },
};

const STEP_ICONS: Record<string, React.ReactNode> = {
  satellite: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  brain: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  chart: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  phone: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
};

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [msgLang, setMsgLang] = useState<"bn" | "en">("bn");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const s = t[lang];
  const zones = SYLHET_FLOOD_ZONES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, area, language: msgLang }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "DUPLICATE") {
          setError(s.alreadyRegistered);
        } else {
          setError(data.error || s.errorTitle);
        }
        return;
      }
      setSuccess(true);
    } catch {
      setError(s.errorTitle);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Meghdoot" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold meghdoot-gradient-text">{s.heroTitle}</span>
          </div>
          <button
            onClick={() => setLang(s.otherLang)}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            {s.otherLangLabel}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 meghdoot-gradient opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04]">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <circle cx="300" cy="100" r="80" fill="#1a6bc4" />
            <circle cx="200" cy="250" r="120" fill="#0ea5c7" />
            <circle cx="350" cy="300" r="60" fill="#9b87f5" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                {lang === "en" ? "AI-Powered Flood Prediction" : "AI চালিত বন্যা পূর্বাভাস"}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 leading-[1.1]">
                {s.heroSubtitle}
              </h1>
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                {s.heroDesc}
              </p>
              <a href="#register" className="inline-flex rounded-xl meghdoot-gradient px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-[1.02]">
                {s.heroCta}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {s.heroStats.map((stat, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-extrabold meghdoot-gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Step by Step */}
      <section className="border-t border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-800 mb-4">{s.howTitle}</h2>
          <p className="text-center text-sm text-slate-500 mb-12 max-w-xl mx-auto">
            {lang === "en"
              ? "A multi-layered approach combining real-time sensor data with machine learning for maximum accuracy."
              : "সর্বোচ্চ নির্ভুলতার জন্য রিয়েল-টাইম সেন্সর ডেটা ও মেশিন লার্নিং এর সমন্বয়ে একটি বহুস্তরীয় পদ্ধতি।"}
          </p>
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-cyan-200 to-purple-200 hidden lg:block" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {s.howSteps.map((step, i) => (
                <div key={i} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl meghdoot-gradient text-white shadow-lg shadow-blue-500/20">
                    {STEP_ICONS[step.icon]}
                  </div>
                  <div className="mb-1 text-xs font-bold text-blue-600 uppercase tracking-wider">{step.step}</div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-800">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-800 mb-10">{s.dataSourcesTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {s.dataSources.map((src, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-sm font-bold">
                  {src.name.slice(0, 2)}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{src.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{src.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="border-t border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-800 mb-8">{s.privacyTitle}</h2>
          <div className="mx-auto max-w-2xl space-y-3">
            {s.privacyItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-white border border-slate-200 p-4">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Service */}
      <section className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl meghdoot-gradient text-white">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">{s.freeTitle}</h2>
          <p className="mx-auto max-w-xl text-base text-slate-500 leading-relaxed">{s.freeDesc}</p>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="border-t border-slate-100 bg-slate-50/50 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-lg">
            <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{s.registerTitle}</h2>
            <p className="text-center text-sm text-slate-500 mb-8">{s.registerDesc}</p>

            {success ? (
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-emerald-800 mb-2">{s.successTitle}</h3>
                <p className="text-sm text-emerald-700">{s.successDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{s.nameLabel}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={s.namePlaceholder}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{s.phoneLabel}</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={s.phonePlaceholder}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{s.areaLabel}</label>
                  <select
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white"
                  >
                    <option value="">{s.areaPlaceholder}</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.name}>{lang === "bn" ? z.name_bn : z.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{s.langPrefLabel}</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setMsgLang("bn")}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                        msgLang === "bn" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {s.langPrefBn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMsgLang("en")}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                        msgLang === "en" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {s.langPrefEn}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl meghdoot-gradient px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? s.submitting : s.submitBtn}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Meghdoot" width={24} height={24} className="rounded-lg" />
              <span className="text-sm font-semibold meghdoot-gradient-text">{s.heroTitle}</span>
            </div>
            <p className="text-xs text-slate-400 text-center">{s.footerNote}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
