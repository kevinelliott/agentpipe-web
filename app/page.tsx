'use client';

import { Hero } from './components/marketing/Hero';
import { SupportedAgents } from './components/marketing/SupportedAgents';
import { Footer } from './components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Supported Agents Section */}
      <SupportedAgents />

      <Footer />
    </div>
  );
}
