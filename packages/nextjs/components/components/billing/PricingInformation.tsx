import { PricingPlanList } from "../../utils/AppConfig";
import { PricingCard } from "./PricingCard";
import { PricingFeature } from "./PricingFeature";

export const PricingInformation = (props: {
  buttonList: Record<string, React.ReactNode>;
}) => {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-3">
      {Object.values(PricingPlanList).map((plan) => (
        <PricingCard
          key={plan.id}
          planId={plan.id}
          price={plan.price}
          interval={plan.interval}
          button={props.buttonList[plan.id]}
        >
          <PricingFeature>
            {`${plan.features.teamMember} miembros del equipo`}
          </PricingFeature>

          <PricingFeature>
            {`${plan.features.website} sitios web`}
          </PricingFeature>

          <PricingFeature>
            {`${plan.features.storage} GB de almacenamiento`}
          </PricingFeature>

          <PricingFeature>
            {`${plan.features.transfer} GB de transferencia mensual`}
          </PricingFeature>

          <PricingFeature>Soporte por correo electrónico</PricingFeature>
        </PricingCard>
      ))}
    </div>
  );
};
