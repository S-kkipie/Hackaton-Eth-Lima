"use client";
import AddressDetails from "@/app/blockexplorer/address/[address]/page";
import {
  MainLayout,
  MainLayoutSection,
  MainLayoutTitle,
} from "@/components/main-layout";
import { SearchBar, SearchBarContainer } from "@/components/search-bar";
import { useAccount } from "@/hooks/useAccount";
import { FULL_TEXT_SEARCH_PARAM_NAME } from "@/lib/Constants";

export default function Home({}: {}) {
  const { address } = useAccount();
  return (
    <MainLayout>
      <div className="flex space-y-4 md:space-y-0 flex-col  md:flex-row  md:justify-between">
        <div className="flex justify-between  gap-8">
          <MainLayoutTitle>Dashboard</MainLayoutTitle>
        </div>
      </div>
      <MainLayoutSection>
        <AddressDetails address={address} />
      </MainLayoutSection>
    </MainLayout>
  );
}
