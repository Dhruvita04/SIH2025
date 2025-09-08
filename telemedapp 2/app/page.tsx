import Banner from "@/components/BannerComp/banner";
import Benefits from "@/components/Benefits/benefits";
import Connection from "@/components/ConnectionComp/connection";
import HowItWorks from "@/components/HowItWorksComp/howItWorks";
import ReadyTherapist from "@/components/ReadyTherapistComp/readyTherapist";
import Reviews from "@/components/Reviews/reviews";
import Trusted from "@/components/TrustedComp/trusted";
import Footer from "@/components/Footer/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Banner />
      <ReadyTherapist />
      <Connection />
      <HowItWorks />
      <Reviews />
      <Trusted />
      <Benefits />
      <Footer />
    </main>
  );
}
