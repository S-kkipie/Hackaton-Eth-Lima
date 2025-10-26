import { FeatureCard } from "@/components/features/landing/FeatureCard";
import { Section } from "@/components/features/landing/Section";
import { Background } from "../Background";

export const Features = () => {
  return (
    <Background>
      <Section
        subtitle={"Características principales"}
        title={"Todo lo que necesitas para hacer tu negocio más sostenible"}
        description={
          "EcoTrace te ayuda a medir, rastrear y optimizar tu impacto ambiental con herramientas pensadas para las MIPYMES."
        }
      >
        <div className="grid grid-cols-1 gap-x-3 gap-y-8 md:grid-cols-3">
          <FeatureCard
            title={"Trazabilidad total"}
          >
            {
              "Registra cada etapa del ciclo de vida de tus productos con blockchain, garantizando transparencia y confianza para tus clientes."
            }
          </FeatureCard>

          <FeatureCard
            title={"Inteligencia Ambiental"}
          >
            {
              "Utiliza IA para analizar el uso de recursos y recibir recomendaciones sostenibles que reduzcan costos y residuos."
            }
          </FeatureCard>

          <FeatureCard
            title={"Certificación Verde"}
          >
            {
              "Obtén certificados digitales que validan tus prácticas ecoamigables y aumentan el valor de tu marca."
            }
          </FeatureCard>

          <FeatureCard
            title={"Gestión Colaborativa"}
          >
            {
              "Invita a tus proveedores y aliados a compartir datos de trazabilidad para crear una cadena de valor más limpia y responsable."
            }
          </FeatureCard>

          <FeatureCard
            title={"Integración Simple"}
          >
            {
              "Conecta tu sistema de inventarios o ventas mediante APIs fáciles de usar y empieza a registrar tu impacto ambiental en minutos."
            }
          </FeatureCard>

          <FeatureCard
            title={"Soporte y Comunidad"}
          >
            {
              "Únete a una red de empresas comprometidas con el futuro sostenible del Perú. Nuestro equipo te acompaña 24/7."
            }
          </FeatureCard>
        </div>
      </Section>
    </Background>
  );
};
