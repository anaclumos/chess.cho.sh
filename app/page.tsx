import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { GameClient } from "@/components/GameClient";

type Props = {
  searchParams: Promise<{ name?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { name } = await searchParams;
  const locale = await getLocale();

  const params = new URLSearchParams({ locale });
  if (name) params.set("name", name);

  return {
    openGraph: {
      images: [{ url: `/api/og?${params.toString()}`, width: 1200, height: 630 }],
    },
  };
}

export default function Home() {
  return <GameClient />;
}
