interface VisitorsAnalytics {
  track(event: string, properties?: Record<string, string | number>): void
}

declare const visitors: VisitorsAnalytics | undefined
