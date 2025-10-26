"use client";

import { Features } from "@/components/templates/Features";
import { Hero } from "@/components/templates/Hero";
import { Pricing } from "@/components/templates/Pricing";

const Home = () => {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
    </>
  );
};

export default Home;
