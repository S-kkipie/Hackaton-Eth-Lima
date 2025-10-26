import { PricingInformation } from "@/components/billing/PricingInformation";
import { Section } from "@/components/features/landing/Section";
import { PLAN_ID } from "@/utils/AppConfig";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

export const Pricing = () => {
  return (
    <Section
      subtitle={"Planes y precios"}
      title={"Transparencia y accesibilidad para todos"}
      description={
        "EcoTrace ofrece planes adaptados a cada etapa de crecimiento. Empieza gratis, escala cuando tu impacto lo requiera."
      }
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
              Empezar gratis
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
              Probar Premium
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
              Contactar Ventas
            </Link>
          ),
        }}
      />
    </Section>
  );
};
