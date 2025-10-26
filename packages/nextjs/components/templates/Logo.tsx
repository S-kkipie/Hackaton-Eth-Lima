import Image from "next/image";
import { Title } from "../ui/title";

export const Logo = ({ width = 50, height = 50 }: { width?: number; height?: number }) => (
  <>
    <Image src={"/icon2.ico"} alt={""} width={width} height={height} />
    <Title className="font-bold text-xl">EcoTrace</Title>
  </>
);
