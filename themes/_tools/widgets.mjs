// SoraSpace site widgets. Every widget can be switched on or off by the site owner.
// A theme only chooses which widgets start on (`enabled`) and which are offered first (`suggested`).
//
// kind 'site'     — built only from the tenant's own content; filled in by the site manager at publish time. No scripts.
// kind 'external' — content from an outside provider. Approved exception to the SoraSpace data rule (10 Nov 2026):
//                   always off until the owner switches it on, then click-to-load for each visitor, allowlisted providers only.

export const WIDGETS = [
  { id: 'feature-panel', name: 'Featured panel', kind: 'site', placement: 'hero', description: 'A panel over or beside the opening image showing a pinned item, or the newest post if nothing is pinned.', sourcePages: ['blog', 'journal', 'articles', 'galleries'], options: { pinnedItem: 'optional item id', fallback: 'latest' } },
  { id: 'quick-links', name: 'Quick links', kind: 'site', placement: 'hero', description: 'Up to four shortcuts to the site’s own pages, shown in the featured panel.', options: { maxLinks: 4 } },
  { id: 'latest-posts', name: 'Latest posts', kind: 'site', placement: 'home', position: 'after-hero', description: 'The newest items from chosen pages.', sourcePages: ['blog', 'journal', 'articles'], options: { count: 3 } },
  { id: 'upcoming-events', name: 'Upcoming events', kind: 'site', placement: 'home', position: 'after-hero', description: 'Dated posts that have not happened yet, soonest first. Past events drop off at the next publish.', sourcePages: ['blog', 'articles'], options: { count: 3 } },
  { id: 'contact-card', name: 'Contact card', kind: 'site', placement: 'home', position: 'before-footer', description: 'Opening hours, phone and a button to the Contact page.', sourcePages: ['contact'] },
  { id: 'photo-strip', name: 'Photo strip', kind: 'site', placement: 'home', position: 'before-footer', description: 'A row of recent photos from Galleries.', sourcePages: ['galleries'], options: { count: 6 } },
  { id: 'key-numbers', name: 'Key numbers', kind: 'site', placement: 'home', position: 'after-hero', description: 'Up to four short facts or figures the owner enters.', options: { max: 4 } },
  { id: 'testimonials', name: 'Testimonials', kind: 'site', placement: 'home', position: 'before-footer', description: 'Genuine quotes the owner enters, each with the person’s name or initials. Never invented.', options: { max: 3, attributionRequired: true } },
  { id: 'social-links', name: 'Social links', kind: 'site', placement: 'home', position: 'before-footer', description: 'Plain links to the owner’s social profiles. No feeds, buttons or tracking scripts.', options: { max: 6 } },
  { id: 'illustrated-map', name: 'Illustrated map', kind: 'site', placement: 'home', position: 'before-footer', description: 'A drawn map with numbered markers for approximate places (as on Explore). No map provider, no coordinates.', options: { maxMarkers: 8, precision: 'approximate' } },
  { id: 'map', name: 'Map', kind: 'external', placement: 'home', position: 'before-footer', description: 'An interactive map of one address or place.', providers: ['openstreetmap', 'google-maps'] },
  { id: 'video', name: 'Video', kind: 'external', placement: 'home', position: 'before-footer', description: 'One video from a video service.', providers: ['youtube', 'vimeo'] },
  { id: 'audio', name: 'Audio player', kind: 'external', placement: 'home', position: 'before-footer', description: 'A track, album, playlist or podcast episode player.', providers: ['spotify', 'soundcloud', 'apple-podcasts'] },
  { id: 'social-post', name: 'Social post', kind: 'external', placement: 'home', position: 'before-footer', description: 'One public post from a social network.', providers: ['instagram', 'facebook', 'linkedin'] }
];

// Allowlisted outside providers. The site manager accepts a share link only if it matches `accepts`,
// converts it to `embedVia`, and adds only that provider's frame origin to the page's Content Security Policy
// when the widget is switched on. Owners can never paste raw HTML or script.
export const PROVIDERS = {
  openstreetmap: { name: 'OpenStreetMap', accepts: 'openstreetmap.org share links', embedVia: 'openstreetmap.org/export/embed.html', frameOrigin: 'www.openstreetmap.org', privacy: 'Loading the map sends the visitor’s IP address to the OpenStreetMap Foundation.' },
  'google-maps': { name: 'Google Maps', accepts: 'google.com/maps share or embed links', embedVia: 'google.com/maps/embed', frameOrigin: 'www.google.com', privacy: 'Loading the map lets Google record the visit and may set cookies.' },
  youtube: { name: 'YouTube', accepts: 'youtube.com and youtu.be video links', embedVia: 'youtube-nocookie.com/embed', frameOrigin: 'www.youtube-nocookie.com', privacy: 'Loading the video lets Google record the visit.' },
  vimeo: { name: 'Vimeo', accepts: 'vimeo.com video links', embedVia: 'player.vimeo.com/video (with dnt=1)', frameOrigin: 'player.vimeo.com', privacy: 'Loading the video lets Vimeo record the visit.' },
  spotify: { name: 'Spotify', accepts: 'open.spotify.com links', embedVia: 'open.spotify.com/embed', frameOrigin: 'open.spotify.com', privacy: 'Loading the player lets Spotify record the visit and may set cookies.' },
  soundcloud: { name: 'SoundCloud', accepts: 'soundcloud.com links', embedVia: 'w.soundcloud.com/player', frameOrigin: 'w.soundcloud.com', privacy: 'Loading the player lets SoundCloud record the visit and may set cookies.' },
  'apple-podcasts': { name: 'Apple Podcasts', accepts: 'podcasts.apple.com links', embedVia: 'embed.podcasts.apple.com', frameOrigin: 'embed.podcasts.apple.com', privacy: 'Loading the player lets Apple record the visit.' },
  instagram: { name: 'Instagram', accepts: 'instagram.com post links', embedVia: 'instagram.com/p/<id>/embed', frameOrigin: 'www.instagram.com', privacy: 'Loading the post lets Meta record the visit and may set cookies.' },
  facebook: { name: 'Facebook', accepts: 'facebook.com public post links', embedVia: 'facebook.com/plugins/post.php', frameOrigin: 'www.facebook.com', privacy: 'Loading the post lets Meta record the visit and may set cookies.' },
  linkedin: { name: 'LinkedIn', accepts: 'linkedin.com public post links', embedVia: 'linkedin.com/embed/feed/update', frameOrigin: 'www.linkedin.com', privacy: 'Loading the post lets LinkedIn record the visit and may set cookies.' }
};

// Rules every external widget follows (also written into widgets.json for importers).
export const EXTERNAL_RULES = [
  'Off by default on every theme. Only the site owner can switch it on.',
  'Click-to-load: visitors first see a placeholder naming the provider and what loading shares, plus a plain link to open the content on the provider’s site. Nothing is requested from the provider until the visitor chooses to load it.',
  'A visitor’s choice applies to that widget on that page view only unless the site owner enables a remembered choice; no SoraSpace data is sent to the provider.',
  'Only allowlisted providers. The owner supplies a share link, never HTML or script; the link must match the provider’s accepted pattern.',
  'Embeds use sandboxed iframes with referrerpolicy="no-referrer" (or strict-origin) and the provider’s privacy-enhanced mode where one exists.',
  'The page Content Security Policy gains only the frame origins of providers actually switched on.',
  'The click-to-load script is supplied and reviewed by the SoraSpace site manager, never by a theme or a tenant.'
];

const has = (t, ...pages) => pages.some(p => t.pages.includes(p));
const LOCATION_BASED = new Set(['restaurant-cafe', 'trades-services', 'professional-practice', 'fitness-studio', 'wellness-clinic', 'stay', 'community-group', 'maker-shop', 'tutor-course', 'club-society', 'wedding-events', 'florist-garden', 'memorial-tribute', 'hair-beauty', 'real-estate', 'pet-care', 'farm-produce', 'winery-cellar-door', 'childcare', 'tours-guiding', 'venue-hire', 'automotive', 'faith-community', 'school-parents', 'conference', 'neighbourhood']);
const FEATURE_PANEL = new Set(['explore', 'consultant', 'writer-author', 'magazine', 'musician-band', 'community-group', 'team-workgroup', 'research-group', 'club-society', 'podcast', 'travel-journal', 'recipe-blog', 'farm-produce', 'faith-community', 'school-parents', 'conference', 'neighbourhood', 'alumni', 'open-source', 'cause-campaign', 'team-handbook']);
const VIDEO = new Set(['photography-portfolio', 'musician-band', 'filmmaker', 'product-launch', 'creative-agency', 'tours-guiding', 'fitness-studio', 'tutor-course', 'cause-campaign', 'open-source']);
const AUDIO = new Set(['musician-band', 'podcast', 'faith-community']);
const SOCIAL_POST = new Set(['restaurant-cafe', 'artist-studio', 'photography-portfolio', 'maker-shop', 'florist-garden', 'hair-beauty', 'musician-band', 'club-society', 'community-group', 'cause-campaign', 'winery-cellar-door']);
const EVENTS = new Set(['community-group', 'club-society', 'musician-band', 'faith-community', 'school-parents', 'conference', 'neighbourhood', 'alumni', 'cause-campaign', 'venue-hire', 'farm-produce', 'wedding-events']);
const TESTIMONIALS = new Set(['trades-services', 'professional-practice', 'consultant', 'wellness-clinic', 'stay', 'tutor-course', 'hair-beauty', 'real-estate', 'pet-care', 'childcare', 'tours-guiding', 'venue-hire', 'automotive', 'creative-agency', 'product-launch', 'fitness-studio', 'restaurant-cafe']);

// Theme-specific choices; anything not listed here comes from the rules below.
const OVERRIDES = {
  explore: { enabled: ['feature-panel', 'quick-links', 'illustrated-map'], suggested: ['map', 'latest-posts', 'social-links', 'photo-strip'] },
  'travel-journal': { enabled: ['feature-panel', 'quick-links', 'illustrated-map', 'photo-strip'], suggested: ['map', 'video', 'social-links'] },
  // Uplift batch A (design/ folders): starting widgets match the design references.
  magazine: { enabled: ['latest-posts', 'social-links'], suggested: ['upcoming-events', 'photo-strip', 'audio'] },
  'photography-portfolio': { enabled: ['social-links'], suggested: ['contact-card', 'photo-strip', 'map'] },
  'trades-services': { enabled: ['key-numbers', 'contact-card'], suggested: ['testimonials', 'map', 'photo-strip', 'social-links'] },
  'artist-studio': { enabled: ['social-links'], suggested: ['upcoming-events', 'photo-strip', 'video'] },
  'coming-soon': { enabled: ['social-links'], suggested: ['key-numbers'] },
  'memorial-tribute': { enabled: [], suggested: ['photo-strip', 'video', 'map'] },
  'family-album': { enabled: [], suggested: ['photo-strip', 'illustrated-map', 'video'] },
  'team-handbook': { enabled: ['feature-panel', 'quick-links'], suggested: ['latest-posts', 'upcoming-events'] }
};

export function themeWidgets(t) {
  if (OVERRIDES[t.id]) return OVERRIDES[t.id];
  const enabled = [];
  if (FEATURE_PANEL.has(t.id)) enabled.push('feature-panel', 'quick-links');
  const s = [];
  if (EVENTS.has(t.id)) s.push('upcoming-events');
  if (LOCATION_BASED.has(t.id)) s.push('map', 'contact-card');
  if (TESTIMONIALS.has(t.id)) s.push('testimonials');
  if (VIDEO.has(t.id)) s.push('video');
  if (AUDIO.has(t.id)) s.push('audio');
  if (SOCIAL_POST.has(t.id)) s.push('social-post');
  if (has(t, 'blog', 'journal', 'articles') && !enabled.includes('feature-panel')) s.push('feature-panel');
  if (has(t, 'galleries')) s.push('photo-strip');
  s.push('social-links');
  return { enabled, suggested: [...new Set(s)].filter(id => !enabled.includes(id)).slice(0, 5) };
}
