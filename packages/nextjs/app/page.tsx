"use client";

import { ConnectedAddress } from "../components/ConnectedAddress";
import { useScaffoldReadContract } from "../hooks/scaffold-stark/useScaffoldReadContract";
import { useTargetNetwork } from "../hooks/scaffold-stark/useTargetNetwork";

const Home = () => {
  const { targetNetwork } = useTargetNetwork();
  const { data } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: [],
  });
  return (
    <div className="flex items-center flex-col grow pt-10">
      {/* <div className="px-5">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">{targetNetwork.name}</span>
        </h1>
        <ConnectedAddress />
        <p className="mt-4 text-center">Contract Greeting: {data?.toString()}</p>
      </div> */}
    </div>
  );
};

export default Home;
