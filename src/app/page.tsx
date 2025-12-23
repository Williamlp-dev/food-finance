import { Header } from "@/components/header";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col divide-y divide-dashed divide-border border-border border-dashed sm:border-b">
      <Header />
      <Hero />
      <Footer />
    </main>
  );
}
