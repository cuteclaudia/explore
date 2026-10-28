# Stable outdoor status and automatic trail overlays

28 October 2026, Australia/Sydney. “In this area” alternated between wrapping loading/busy messages and could resize the surrounding map. Unrelated climbing/list refreshes also replaced an in-flight outdoor status, causing visible message churn.

The list status now reserves one 18px row, uses concise loading/busy/zoom/empty messages, and truncates unexpected long text without wrapping. Full provider text is kept in its title. Outdoor loading/error state survives unrelated list redraws until the request completes or a new request starts. Reference/satellite/climbing status lines above the map and the overlay status also have fixed single-line geometry.

Selected hiking, MTB and ski activities enable their reference trail overlays directly. The extra “Specialist trail maps” checkbox is removed from the UI. Older saved `referenceTrails:false` preferences cannot suppress a selected activity. Activity switches still control which providers/layers load; this does not turn every activity on or promise route coverage everywhere. Legacy preference fields remain accepted for compatibility.

Via ferrata means a mountain route fitted with fixed cables, rungs or ladders. The Alpine activity button has a brief definition in its title.

Validation: server tests and `scripts/check-explore-planner.mjs` use real MapLibre with synthetic provider tiles/replies. They verify an old master-off preference still paints selected trails; actual loading → HTTP 429 → successful detail responses leave the map rectangle and 18px status row unchanged at 320/390/768/1440px; long reference messages cannot add lines. Existing activity, list, grade/source, rock/ice, GPX, imagery and no-WebGL checks also pass. These fixtures do not certify live provider uptime, current access or trail coverage.
