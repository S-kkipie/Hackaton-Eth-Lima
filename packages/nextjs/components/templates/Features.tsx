import { FeatureCard } from "@/components/features/landing/FeatureCard";
import { Section } from "@/components/features/landing/Section";
import { Background } from "../Background";

export const Features = () => {
  return (
    <Background>
      <Section
        subtitle={"Features"}
        title={"Todo lo que necesitas para lanzar tu proyecto"}
        description={
          "Todo lo necesario para crear, desplegar y escalar tus agentes de IA rápidamente."
        }
      >
        <div className="grid grid-cols-1 gap-x-3 gap-y-8 md:grid-cols-3">
          <FeatureCard
            icon={
              <svg
                className="stroke-primary-foreground stroke-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 0h24v24H0z" stroke="none" />
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
              </svg>
            }
            title={"Automatización"}
          >
            {
              "Automatiza tareas repetitivas y acelera tus flujos de trabajo con reglas inteligentes."
            }
          </FeatureCard>

          <FeatureCard
            icon={
              <svg
                className="stroke-primary-foreground stroke-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 0h24v24H0z" stroke="none" />
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
              </svg>
            }
            title={"Colaboración en equipo"}
          >
            {
              "Comparte proyectos, comentarios y permisos con tu equipo en tiempo real."
            }
          </FeatureCard>

          <FeatureCard
            icon={
              <svg
                className="stroke-primary-foreground stroke-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 0h24v24H0z" stroke="none" />
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
              </svg>
            }
            title={"Seguridad y permisos"}
          >
            {
              "Controla el acceso, revisa auditorías y protege datos sensibles con cifrado."
            }
          </FeatureCard>

          <FeatureCard
            icon={
              <svg
                className="stroke-primary-foreground stroke-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 0h24v24H0z" stroke="none" />
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
              </svg>
            }
            title={"Analíticas"}
          >
            {
              "Visualiza métricas clave, rendimiento y uso para tomar decisiones informadas."
            }
          </FeatureCard>

          <FeatureCard
            icon={
              <svg
                className="stroke-primary-foreground stroke-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 0h24v24H0z" stroke="none" />
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
              </svg>
            }
            title={"Integraciones"}
          >
            {
              "Conecta tu stack favorito con integraciones listas y APIs públicas."
            }
          </FeatureCard>

          <FeatureCard
            icon={
              <svg
                className="stroke-primary-foreground stroke-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 0h24v24H0z" stroke="none" />
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
              </svg>
            }
            title={"Soporte 24/7"}
          >
            {
              "Nuestro equipo está disponible para ayudarte en cualquier momento."
            }
          </FeatureCard>
        </div>
      </Section>
    </Background>
  );
};
