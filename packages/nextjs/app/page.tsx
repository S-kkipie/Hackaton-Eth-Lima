"use client";

import Header from "@/components/Header";
import { Features } from "@/components/templates/Features";
import { Hero } from "@/components/templates/Hero";
import { Pricing } from "@/components/templates/Pricing";

const Home = () => {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Pricing />
    </>
  );
};

export default Home;
