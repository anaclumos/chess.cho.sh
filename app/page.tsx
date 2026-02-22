import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { GameClient } from '@/components/game-client'

interface Props {
  searchParams: Promise<{ name?: string }>
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { name } = await searchParams
  const locale = await getLocale()
  const t = await getTranslations('Metadata')
  const tPlayers = await getTranslations('Players')
  const params = new URLSearchParams({ locale })
  if (name) {
    params.set('name', name)
  }

  const opponent = tPlayers('black')
  return {
    title: name
      ? t('titleWithPlayer', { name, opponent })
      : t('titleDefault'),
    description: name
      ? t('descriptionWithPlayer', { name, opponent })
      : t('description'),
    openGraph: {
      images: [
        { url: `/api/og?${params.toString()}`, width: 1200, height: 630 },
      ],
    },
  }
}

export default function Home() {
  return <GameClient />
}
