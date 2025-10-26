import Image from "next/image";
import { Title } from "../ui/title";

export const Logo = () => (
  <>
    <Image src={"/icon2.ico"} alt={""} width={50} height={50} />
    <Title className="font-bold text-xl">EcoTrace</Title>
  </>
);
