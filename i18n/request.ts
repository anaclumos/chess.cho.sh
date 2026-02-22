import { cookies } from 'next/headers'
import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales } from './config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const requested = cookieStore.get('NEXT_LOCALE')?.value
  const locale = hasLocale(locales, requested) ? requested : defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
