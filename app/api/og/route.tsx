import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const FONT_REGULAR_URL =
  "https://cdn.jsdelivr.net/gh/anaclumos/sunghyun-sans@v1.0.0/fonts/otf/SunghyunSansKR-Regular.otf";
const FONT_BOLD_URL =
  "https://cdn.jsdelivr.net/gh/anaclumos/sunghyun-sans@v1.0.0/fonts/otf/SunghyunSansKR-Bold.otf";

const PRIMARY = "#5e6ad2";
const FG = "#ebebef";
const MUTED = "#7d7d85";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name");
  const locale = searchParams.get("locale") || "en";

  const [fontRegular, fontBold] = await Promise.all([
    fetch(FONT_REGULAR_URL, { cache: "force-cache" }).then((r) =>
      r.arrayBuffer()
    ),
    fetch(FONT_BOLD_URL, { cache: "force-cache" }).then((r) =>
      r.arrayBuffer()
    ),
  ]);

  const isKo = locale === "ko";
  const opponent = isKo ? "성현" : "Sunghyun";

  let rightText: string;
  if (name) {
    rightText = `${name} vs ${opponent}`;
  } else {
    rightText = isKo ? "당신의 차례" : "Your move";
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#000000",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Sunghyun Sans KR",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            padding: "32px 64px",
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "9999px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "16px",
              height: "16px",
              borderRadius: "8px",
              backgroundColor: PRIMARY,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "36px",
              fontWeight: 700,
              color: FG,
            }}
          >
            chess.cho.sh
          </div>
          <div
            style={{
              display: "flex",
              width: "1px",
              height: "32px",
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "36px",
              fontWeight: 400,
              color: MUTED,
            }}
          >
            {rightText}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Sunghyun Sans KR",
          data: fontRegular,
          weight: 400 as const,
          style: "normal" as const,
        },
        {
          name: "Sunghyun Sans KR",
          data: fontBold,
          weight: 700 as const,
          style: "normal" as const,
        },
      ],
    }
  );
}
