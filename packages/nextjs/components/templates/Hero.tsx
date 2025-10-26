import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";

import { CenteredHero } from "@/components/features/landing/CenteredHero";
import { buttonVariants } from "../ui/button";
import { Section } from "@/components/features/landing/Section";
import { badgeVariants } from "../ui/badgeVariants";
import Link from "next/link";

export const Hero = () => {
  return (
    <Section className="py-36">
      <CenteredHero
        banner={<></>}
        title={
          <>
            Implementa{" "}
            <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Economia Circular{" "}
            </span>
            en tu negocio junto a<br></br>
            <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent text-7xl">
              {" "}
              EcoTrace{" "}
            </span>
          </>
        }
        description={
          "Plataforma para mejorar la trazabilidad de productos enfocado en optimizar una economia circular en las MIPYMES peruanas usando tecnologías blockchain y de IA."
        }
        buttons={
          <Link className={buttonVariants({ size: "lg" })} href="/app">
            Prueba la demo!!
          </Link>
        }
      />
    </Section>
  );
};
