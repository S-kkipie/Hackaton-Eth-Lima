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
            Impulsa la{" "}
            <span className="bg-linear-to-r from-green-500 via-emerald-500 to-lime-500 bg-clip-text text-transparent">
              Economía Circular{" "}
            </span>
            en tu empresa con<br />
            <span className="bg-linear-to-r from-green-500 via-emerald-500 to-lime-500 bg-clip-text text-transparent text-7xl">
              {" "}
              EcoTrace{" "}
            </span>
          </>
        }
        description={
          "Plataforma inteligente que permite a las MIPYMES peruanas rastrear el ciclo de vida de sus productos, optimizar recursos y demostrar su compromiso con la sostenibilidad, mediante tecnología blockchain e inteligencia artificial."
        }
        buttons={
          <Link className={buttonVariants({ size: "lg" })} href="/app">
            Probar la demo 🌿
          </Link>
        }
      />
    </Section>
  );
};
