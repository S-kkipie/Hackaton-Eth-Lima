import { MainLayout, MainLayoutSection, MainLayoutTitle } from "@/components/components/main-layout";
import { SearchBar, SearchBarContainer } from "@/components/components/search-bar";
import { FULL_TEXT_SEARCH_PARAM_NAME } from "@/lib/Constants";


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const fullTextSearch = params[FULL_TEXT_SEARCH_PARAM_NAME] ?? "";

  return (
    <MainLayout>
      <div className="flex space-y-4 md:space-y-0 flex-col  md:flex-row  md:justify-between">
        <div className="flex justify-between  gap-8">
          <MainLayoutTitle>Dashboard</MainLayoutTitle>
        </div>
        <SearchBarContainer>
          <SearchBar
            inputProps={{
              defaultValue: fullTextSearch,
            }}
          />
        </SearchBarContainer>
      </div>
      <MainLayoutSection></MainLayoutSection>
    </MainLayout>
  );
}
