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
        banner={
          <a
            className={badgeVariants()}
            href="https://twitter.com/AI-DO"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TwitterLogoIcon className="mr-1 size-5" /> Sigue a @AI-DO en
            Twitter
          </a>
        }
        title={
          <>
            Construye el{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Software{" "}
            </span>
            de tu negocio con <br></br>
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent text-7xl">
              {" "}
              AI-DO{" "}
            </span>
          </>
        }
        description={
          "Crea, integra y automatiza las operaciones de tu negocio con AI-DO. Con una simple instruccion se capaz de de generar aplicaciones completas adaptadas a tus necesidades empresariales."
        }
        buttons={
          <Link className={buttonVariants({ size: "lg" })} href="">
            Prueba la demo!!
          </Link>
        }
      />
    </Section>
  );
};
