import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { ClosedBanner } from "@/components/closed-banner";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <ClosedBanner />
      <main className="pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </>
  );
}
