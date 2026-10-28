# Local activity route imports

29 October 2026 (Sydney). `/places` now opens GPX, TCX and FIT route files. The route remains in this browser view; no upload, account-history record or publication is performed. Map tile requests still reveal the viewed area to map providers.

- Bounds: 5 MiB, 20,000 GPS points, 200,000 FIT messages. Unsupported/truncated files fail with a readable status; an existing displayed route is preserved on a failed replacement.
- GPX: track segments and route points; numeric coordinate/elevation validation; DTD/entity declarations refused.
- TCX: namespace-aware TrainingCenterDatabase activities/courses, Track/Trackpoint GPS and optional AltitudeMeters. Tracks/laps and missing positions create gaps rather than invented joining routes. Names are rendered as text. Indoor workouts with no usable GPS explain why no route can be displayed.
- FIT: standard 12/14-byte FIT headers, protocol through v2, header/file CRC checks, little/big-endian definitions, local messages and compressed timestamp records. Reads record-message GPS semicircles, altitude/enhanced altitude (scale/offset), and timer-stop boundaries. Unknown/developer fields are skipped by their declared sizes, not interpreted. Invalid GPS creates gaps. A missing altitude stays missing.
- Route-only FIT support: no general wellness importer, proprietary field decoder, encrypted/concatenated archive reader, workout-history store or device compatibility guarantee. ZIPs must be unpacked first. Single-point fragments are omitted because they cannot define a route.
- The profile is hidden when elevation is incomplete; distance and valid route geometry remain visible. Complete profiles show their distance/elevation range and labelled approximate ascent. Source/recorded totals are distinct from route-derived estimates.
- Manual exports are distinct from direct Garmin/Komoot authorization. Provider access and retention rules still apply to any future API adapter.

Independent checks include generated FIT files with known coordinates/CRC and endian/header/compression/developer-field variants, deliberate corruption/truncation/limits, and browser TCX XML/gaps/missing-height/no-GPS cases through the real file picker/map controller. These are synthetic fixtures, not real Garmin device certification. Check representative personal device exports during acceptance, preserving originals; no claim of universal FIT profile support is made.
