import { Hero } from "@/components/home/Hero";
import { Categories, CityMarquee, Featured, HowItWorks, Stats } from "@/components/home/Sections";

export default function Home() {
  return (
    <>
      <Hero />
      <CityMarquee />
      <Featured />
      <Categories />
      <Stats />
      <HowItWorks />
    </>
  );
}
