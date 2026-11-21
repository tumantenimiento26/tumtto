# Changelog

## [1.1.0] - 2026-11-21

### Added
- Request account deletion from the web (`/eliminar-cuenta`).
- Per-route page titles.
- App Links default to the Android package `mx.tumtto.app`.

### Fixed
- Shared components: keyboard focus, visible focus ring and WCAG AA color tokens.
- Console list pages are reachable by keyboard and fit at 1440 px.
- Console detail pages, card padding and narrow-screen breaks; last contrast and target-size findings.
- Console numbers that disagreed now come from one source; consistent mock ratings, mobile KPI size and singular commission.
- Dashboard GMV chart shows the same period change as its KPI.
- Heatmap values, period selector, headings and general polish.
- Regiones map fills its row and Liquidaciones names get room.
- Header title truncates again on phones.
- Login formats the build date on the client.
- 404 renders without a hydration error; public copy and mobile-first auth pages.
- Maps show a neutral fallback when they cannot load; Mapbox CSS loads only with maps.
- Landing payment copy matches the Términos and shows the real catalog categories.
- One brand spelling and only existing token classes.

### Changed
- Charts use theme-aware colors and a common bar baseline; dead chart code removed.
- Terms and privacy notice disclose push notifications (Firebase/APNs).
- Design prototype: subscription plans proposal (landing and admin console), bolder plans, current brand icon, payment copy aligned with the Términos and fixed mobile nav.
