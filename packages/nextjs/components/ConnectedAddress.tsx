"use client";
import { useAccount } from "@starknet-react/core";
import { useScaffoldStarkProfile } from "../hooks/scaffold-stark/useScaffoldStarkProfile";
import { Address } from "./scaffold-stark";

export const ConnectedAddress = () => {
  const connectedAddress = useAccount();

  const { data: fetchedProfile, isLoading } = useScaffoldStarkProfile(
    connectedAddress.address,
  );

  return (
    <div className="flex justify-center items-center space-x-2">
      <p className="my-2 font-medium text-[#00A3FF]">Connected Address:</p>
      <Address
        address={connectedAddress.address}
        profile={fetchedProfile}
        isLoading={isLoading}
      />
    </div>
  );
};
