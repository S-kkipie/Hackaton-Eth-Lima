import { PricingInformation } from "@/components/billing/PricingInformation";
import { Section } from "@/components/features/landing/Section";
import { PLAN_ID } from "@/utils/AppConfig";
import Link from "next/link";
import { buttonVariants } from "../ui/button";


export const Pricing = () => {

  return (
    <Section
      subtitle={"Planes y precios"}
      title={"Precios simples y transparentes"}
      description={"Elige el plan que mejor se adapte a tu equipo. Sin sorpresas ni costos ocultos."}
    >
      <PricingInformation
        buttonList={{
          [PLAN_ID.FREE]: (
            <Link
              className={buttonVariants({
                size: "sm",
                className: "mt-5 w-full",
              })}
              href="/sign-up"
            >
              Regístrate
            </Link>
          ),
          [PLAN_ID.PREMIUM]: (
            <Link
              className={buttonVariants({
                size: "sm",
                className: "mt-5 w-full",
              })}
              href="/sign-up"
            >
              Regístrate
            </Link>
          ),
          [PLAN_ID.ENTERPRISE]: (
            <Link
              className={buttonVariants({
                size: "sm",
                className: "mt-5 w-full",
              })}
              href="/sign-up"
            >
              Regístrate
            </Link>
          ),
        }}
      />
    </Section>
  );
};
