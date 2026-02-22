import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

const FONT_REGULAR_URL =
  'https://cdn.jsdelivr.net/gh/anaclumos/sunghyun-sans@v1.0.0/fonts/otf/SunghyunSansKR-Regular.otf'
const FONT_BOLD_URL =
  'https://cdn.jsdelivr.net/gh/anaclumos/sunghyun-sans@v1.0.0/fonts/otf/SunghyunSansKR-Bold.otf'

const PRIMARY = '#5e6ad2'
const FG = '#ebebef'
const MUTED = '#7d7d85'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const name = searchParams.get('name')
  const locale = searchParams.get('locale') || 'en'

  const [fontRegular, fontBold] = await Promise.all([
    fetch(FONT_REGULAR_URL, { cache: 'force-cache' }).then((r) =>
      r.arrayBuffer()
    ),
    fetch(FONT_BOLD_URL, { cache: 'force-cache' }).then((r) => r.arrayBuffer()),
  ])

  const isKo = locale === 'ko'
  const opponent = isKo ? '성현' : 'Sunghyun'

  let rightText: string
  if (name) {
    rightText = `${name} vs ${opponent}`
  } else {
    rightText = isKo ? '당신의 차례' : 'Your move'
  }

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Sunghyun Sans KR',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '36px',
          padding: '48px 96px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '9999px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 18 18"
          fill="none"
          style={{ display: 'flex' }}
        >
          <path
            d="m9.5195,14.1509l-.8066-.999c-.333-.4141-.8301-.6519-1.3623-.6519h-3.2021c-.5322,0-1.0293.2378-1.3623.6514l-.8066,1c-.4268.5293-.5107,1.2393-.2168,1.853.293.6143.8984.9956,1.5791.9956h4.8164c.6797,0,1.2852-.3813,1.5781-.9951.2939-.6138.2109-1.3242-.2168-1.854Z"
            fill={FG}
          />
          <path
            d="m15.75,8c0-1.3809-1.1193-2.5-2.5-2.5-.6041,0-1.1506.2229-1.5828.5796.2051,1.0933-.0143,2.1936-.6074,3.1023.2524.4663.6556.8269,1.1335,1.0569h-.0456l-.2102,1.2612h2.6253l-.2111-1.2661h-.0003c.8256-.4082,1.3986-1.2505,1.3986-2.2339Z"
            fill={FG}
            opacity="0.4"
          />
          <path
            d="m16.2787,14.3877l-.7479-.9587c-.2112-.2708-.5353-.429-.8786-.429h-2.8042c-.3433,0-.6674.1582-.8786.429l-.0681.0872c.4752.7468.6178,1.635.4122,2.4839h4.178c.8313,0,1.2983-.9565.7871-1.6123Z"
            fill={FG}
          />
          <path
            d="m3,9.7964v1.4316c.3636-.1377.7472-.228,1.1484-.228h3.2021c.4017,0,.7855.0903,1.1494.2285v-1.4326l1.001-1.0386c.6562-.6909.9014-1.6646.6553-2.604-.1309-.4956-.416-.957-.8057-1.2983-.6611-.5791-1.5234-.8135-2.3643-.6436-.4678.0942-.8906.3032-1.2383.6025-.4736-.4087-1.0693-.6396-1.7041-.6562-.7266-.022-1.4189.2466-1.9453.7476-.5273.501-.8291,1.1777-.8477,1.9053s.2471,1.4189.752,1.9492l.9971,1.0366Z"
            fill={FG}
            opacity="0.4"
          />
          <path
            d="m4,3h1v1.3601c.2703.1099.5237.2603.748.4539.2204-.1897.4789-.3274.752-.4382v-1.3757h1c.4141,0,.75-.3359.75-.75s-.3359-.75-.75-.75h-1v-.75c0-.4141-.3359-.75-.75-.75s-.75.3359-.75.75v.75h-1c-.4141,0-.75.3359-.75.75s.3359.75.75.75Z"
            fill={FG}
          />
        </svg>
        <div
          style={{
            display: 'flex',
            fontSize: '54px',
            fontWeight: 700,
            color: FG,
          }}
        >
          chess.cho.sh
        </div>
        </div>
        <div
          style={{
            display: 'flex',
            width: '1px',
            height: '48px',
            backgroundColor: 'rgba(255,255,255,0.12)',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: '54px',
            fontWeight: 400,
            color: MUTED,
          }}
        >
          {rightText}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Sunghyun Sans KR',
          data: fontRegular,
          weight: 400 as const,
          style: 'normal' as const,
        },
        {
          name: 'Sunghyun Sans KR',
          data: fontBold,
          weight: 700 as const,
          style: 'normal' as const,
        },
      ],
    }
  )
}
