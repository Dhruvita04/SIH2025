import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
const Banner = dynamic(() => import("@/components/BannerComp/banner"), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
});

const Benefits = dynamic(() => import("@/components/Benefits/benefits"), {
  loading: () => <div className="h-96 flex items-center justify-center">Loading...</div>
});

const Connection = dynamic(() => import("@/components/ConnectionComp/connection"), {
  loading: () => <div className="h-96 flex items-center justify-center">Loading...</div>
});

const HowItWorks = dynamic(() => import("@/components/HowItWorksComp/howItWorks"), {
  loading: () => <div className="h-96 flex items-center justify-center">Loading...</div>
});

const ReadyTherapist = dynamic(() => import("@/components/ReadyTherapistComp/readyTherapist"), {
  loading: () => <div className="h-96 flex items-center justify-center">Loading...</div>
});

const Reviews = dynamic(() => import("@/components/Reviews/reviews"), {
  loading: () => <div className="h-96 flex items-center justify-center">Loading...</div>
});

const Trusted = dynamic(() => import("@/components/TrustedComp/trusted"), {
  loading: () => <div className="h-96 flex items-center justify-center">Loading...</div>
});

const Footer = dynamic(() => import("@/components/Footer/footer"), {
  loading: () => <div className="h-64 flex items-center justify-center">Loading...</div>
});

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Load banner immediately since it's above the fold */}
      <Banner />
      
      {/* Lazy load below-the-fold components */}
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
        <ReadyTherapist />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
        <Connection />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
        <HowItWorks />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
        <Reviews />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
        <Trusted />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
        <Benefits />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
        <Footer />
      </Suspense>
    </main>
  );
}
