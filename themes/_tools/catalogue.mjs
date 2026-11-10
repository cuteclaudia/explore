import BATCH_02 from './batches/batch-02.mjs';
import BATCH_03 from './batches/batch-03.mjs';
import BATCH_04 from './batches/batch-04.mjs';
import BATCH_05 from './batches/batch-05.mjs';

// SoraSpace tenant site theme catalogue — the single source for every theme folder.
// All sample names, places and details are fictional. Never put real people, addresses or Claudia's own content here.

export const PAGE_TYPES = { home: 'Home', about: 'About', blog: 'Blog', articles: 'Articles', journal: 'Journal', galleries: 'Galleries', contact: 'Contact' };
export const BASE_TEMPLATES = { folio: 'Folio', editorial: 'Editorial', horizon: 'Horizon', practice: 'Practice', canvas: 'Canvas' };
export const PURPOSES = ['student', 'academic', 'writer', 'creative', 'business', 'personal'];
export const HEROES = ['full-bleed', 'split', 'banner', 'statement', 'text'];
export const HEADERS = ['split', 'centered', 'minimal', 'bar'];
export const SECTION_TYPES = ['intro', 'cards', 'list', 'feature', 'gallery', 'facts', 'people', 'cta', 'contact'];

// System font stacks only: nothing is downloaded. Order mirrors common Windows, macOS, Linux and Android fonts.
export const FONT_STACKS = {
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, Cambria, 'Noto Serif', 'Times New Roman', serif",
  oldstyle: "'Iowan Old Style', 'Palatino Linotype', Palatino, 'URW Palladio L', P052, 'Book Antiqua', serif",
  didone: "Didot, 'Bodoni MT', 'Noto Serif Display', 'Playfair Display', 'Times New Roman', serif",
  slab: "Rockwell, 'Rockwell Nova', 'Roboto Slab', 'DejaVu Serif', 'Sitka Small', serif",
  humanist: "Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif",
  geometric: "Avenir, 'Avenir Next LT Pro', Montserrat, Corbel, 'URW Gothic', source-sans-pro, sans-serif",
  rounded: "ui-rounded, 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, 'Arial Rounded MT', 'Arial Rounded MT Bold', Calibri, source-sans-pro, sans-serif",
  condensed: "'Bahnschrift', 'Arial Narrow', 'Roboto Condensed', 'DejaVu Sans Condensed', 'Liberation Sans Narrow', sans-serif-condensed, sans-serif",
  mono: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace"
};

// Batch 1: the Explore reference entry and themes 1–10. Later batches live in ./batches/.
const BATCH_01 = [
  {
    id: 'explore', number: 0, name: 'Explore', category: 'personal', status: 'reference',
    description: 'The original Explore look from claudiagilbert.com, recorded as a tenant theme: travel, photography and journal writing with a full-bleed landscape hero.',
    suits: ['Travellers', 'Photographers', 'Personal journals'], baseTemplate: 'horizon', purpose: 'creative',
    pages: ['home', 'about', 'journal', 'galleries', 'contact'], pageLabels: { galleries: 'Photography' },
    font: { heading: 'serif', body: 'sans', weight: 400 }, radius: 10, buttonRadius: 30, width: 1300,
    light: { bg: '#f4f3ee', surface: '#ffffff', text: '#233a32', muted: '#55665e', accent: '#376b5c', onAccent: '#ffffff', border: '#d6dbd3', art1: '#6f8f7a', art2: '#c9b99a', heroShade: '#12261d', heroText: '#ffffff' },
    dark: { bg: '#121924', surface: '#1b2533', text: '#eef2f6', muted: '#a9b4c0', accent: '#8fb8d3', onAccent: '#0d1520', border: '#2c3a4c', art1: '#2b4a5e', art2: '#5d6f55', heroShade: '#0b121b', heroText: '#ffffff' },
    header: 'split', hero: 'full-bleed',
    sections: [{ type: 'cards', page: 'journal', heading: 'Somewhere worth finding.' }, { type: 'gallery', page: 'galleries', heading: 'Through the lens', style: 'strip', count: 6 }, { type: 'cta', heading: 'A journal of the journey.', text: 'Travel notes, moments from the trail and the stories that come home.', button: 'Read the journal' }],
    notes: ['Reference entry: the live claudiagilbert.com page (src/templates/explore.html) is not generated from this file and contains Claudia’s own content. Tenants get this look with their own pages.', 'Dark set follows the Explore “Midnight” palette preset.'],
    sample: { siteName: 'Wandering Wattle', tagline: 'Travel · Photography · Adventure', headline: 'Your world. Your own way.', subhead: 'For the places that stay with you and the stories you bring back.', primary: 'Find your next adventure', secondary: 'Through the lens', intro: 'Notes and photographs from long walks and slow journeys.',
      items: [{ meta: 'Lookout', title: 'Ridge at first light', text: 'Sandstone cliffs above blue-green valleys.' }, { meta: 'Coastal', title: 'Salt and southern wind', text: 'A morning on a quiet stretch of coast.' }, { meta: 'Hiking', title: 'Three days to the lakes', text: 'Granite spires, glacial water and open trails.' }] }
  },
  {
    id: 'photography-portfolio', number: 1, name: 'Photography portfolio', category: 'creative',
    description: 'A dark, image-first portfolio. Full-bleed opening photograph, a masonry gallery and very little text, so the work carries the page.',
    suits: ['Photographers', 'Photo collectives'], baseTemplate: 'horizon', purpose: 'creative',
    pages: ['home', 'galleries', 'about', 'contact'], pageLabels: { galleries: 'Portfolio' },
    font: { heading: 'sans', body: 'sans', weight: 200, tracking: -0.01 }, radius: 0, buttonRadius: 0, width: 1400, density: 'compact',
    light: { bg: '#fafafa', surface: '#ffffff', text: '#111111', muted: '#5c5c5c', accent: '#111111', onAccent: '#ffffff', border: '#e3e3e3', art1: '#3a3f47', art2: '#a89f91', heroShade: '#0b0b0c', heroText: '#f2f2f2' },
    dark: { bg: '#0b0b0c', surface: '#151517', text: '#f2f2f2', muted: '#a3a3a3', accent: '#f2f2f2', onAccent: '#0b0b0c', border: '#262628', art1: '#23262b', art2: '#6d6559', heroShade: '#000000', heroText: '#f2f2f2' },
    header: 'minimal', hero: 'full-bleed',
    sections: [{ type: 'intro', page: 'about', heading: 'Selected work' }, { type: 'gallery', page: 'galleries', heading: 'Selected work', style: 'masonry', count: 9 }, { type: 'list', page: 'galleries', heading: 'Series' }, { type: 'intro', page: 'about', heading: 'About' }, { type: 'contact', page: 'contact', heading: 'Commissions & prints', text: 'For commissions, licensing and print enquiries, write to me.' }],
    sample: { siteName: 'Mara Quill Photography', tagline: 'Landscape & portrait', headline: 'Quiet light', subhead: 'Photographs of coastlines, high country and the people in between.', primary: 'View portfolio', intro: 'I photograph slowly, mostly at the edges of the day, and print every series on archival paper.',
      facts: [['Email', 'hello@example.com'], ['Based in', 'Southern Tablelands']] }
  },
  {
    id: 'artist-studio', number: 2, name: 'Artist studio', category: 'creative',
    description: 'Warm paper tones and a loose grid for painters, illustrators and makers of physical work, with a studio journal beside the gallery.',
    suits: ['Illustrators', 'Painters', 'Ceramicists', 'Textile artists'], baseTemplate: 'horizon', purpose: 'creative',
    pages: ['home', 'galleries', 'journal', 'about', 'contact'], pageLabels: { galleries: 'Work', journal: 'Studio notes' },
    font: { heading: 'oldstyle', body: 'humanist', weight: 500 }, radius: 4, buttonRadius: 4,
    light: { bg: '#f6f0e6', surface: '#fffaf2', text: '#2e2620', muted: '#6a5d52', accent: '#a8412a', onAccent: '#ffffff', border: '#e3d6c4', art1: '#d98b5f', art2: '#5d7c80', heroShade: '#2e2620', heroText: '#fffaf2' },
    dark: { bg: '#1f1a16', surface: '#2a231e', text: '#f3e9dc', muted: '#bfae9c', accent: '#f0956f', onAccent: '#22140d', border: '#3d332b', art1: '#7a3e26', art2: '#7fa3a8', heroShade: '#14100d', heroText: '#f3e9dc' },
    header: 'centered', hero: 'split',
    sections: [{ type: 'gallery', page: 'galleries', heading: 'Current series', style: 'even', count: 6 }, { type: 'feature', page: 'about', heading: 'Artist statement' }, { type: 'cards', page: 'journal', heading: 'From the studio', columns: 2, count: 2 }, { type: 'list', page: 'about', heading: 'Shows & stockists' }, { type: 'intro', page: 'about', heading: 'About the artist' }, { type: 'contact', page: 'contact', heading: 'Commissions & stockists' }],
    sample: { siteName: 'Juniper & Ash', tagline: 'Painting · Studio', headline: 'Colour, made by hand.', subhead: 'Abstract paintings about water, weather and the edges of paddocks, made in a small studio by the river.', primary: 'See the work', secondary: 'Commissions', intro: 'I paint native gardens, kitchen tables and the odd stubborn cat. Originals and prints are available.',
      items: [{ meta: 'Studio notes', title: 'Mixing a new green', text: 'Six weeks chasing the exact colour of wet eucalyptus.' }, { meta: 'Studio notes', title: 'Preparing for the spring show', text: 'Framing, labelling and too much tea.' }],
      facts: [['Email', 'studio@example.com'], ['Studio visits', 'By appointment']] }
  },
  {
    id: 'restaurant-cafe', number: 3, name: 'Restaurant & café', category: 'business',
    description: 'Opening hours, location and bookings first, then the menu and the food. Bold slab headings and warm colours.',
    suits: ['Cafés', 'Restaurants', 'Food vans', 'Bakeries'], baseTemplate: 'practice', purpose: 'business',
    pages: ['home', 'articles', 'galleries', 'about', 'contact'], pageLabels: { articles: 'Menu', galleries: 'Gallery', contact: 'Bookings' },
    font: { heading: 'slab', body: 'sans', weight: 700 }, radius: 6, buttonRadius: 6,
    light: { bg: '#fbf7f1', surface: '#ffffff', text: '#2b1d14', muted: '#6b5647', accent: '#9c2f1d', onAccent: '#ffffff', border: '#eadfd2', art1: '#c86b3c', art2: '#f0c75e', heroShade: '#24170f', heroText: '#fff8f0' },
    dark: { bg: '#1a120d', surface: '#251a13', text: '#f6ece2', muted: '#c4ae9a', accent: '#f08a63', onAccent: '#1a0d07', border: '#3a2b20', art1: '#6e2f17', art2: '#8a6a22', heroShade: '#120b07', heroText: '#fff8f0' },
    header: 'bar', hero: 'full-bleed',
    sections: [{ type: 'facts' }, { type: 'list', page: 'articles', heading: 'From the kitchen' }, { type: 'feature', page: 'articles', heading: 'Friday pizza nights' }, { type: 'gallery', page: 'galleries', heading: 'From the bakery', style: 'even', count: 3 }, { type: 'intro', page: 'about', heading: 'Our story' }, { type: 'facts' }, { type: 'contact', page: 'contact', heading: 'Book a table', text: 'Bookings for groups of six or more. Walk-ins are always welcome.' }],
    notes: ['The menu is an Articles page (one article per section, or one long article). A structured menu page type would be a future addition.'],
    sample: { siteName: 'Harbour & Pine', tagline: 'Café · Kitchen · Bakery', headline: 'Good bread. Strong coffee.', subhead: 'Breakfast and lunch every day, wood-fired pizza on Friday nights.', primary: 'See the menu', secondary: 'Book a table', intro: 'A neighbourhood café since 2014.',
      items: [{ title: 'Sourdough with cultured butter', text: 'House sourdough, whipped butter, sea salt.', meta: '$9' }, { title: 'Big breakfast', text: 'Eggs your way, bacon, mushrooms, greens, toast.', meta: '$24' }, { title: 'Pumpkin and ricotta tart', text: 'Seasonal leaves, toasted seeds.', meta: '$19' }, { title: 'Friday pizza', text: 'Wood-fired, from 5 pm.', meta: 'from $22' }],
      facts: [['Open', 'Daily 7 am – 3 pm · Fri until 9 pm'], ['Find us', '12 Example Street, Harbourtown'], ['Phone', '(02) 5550 0123']] }
  },
  {
    id: 'trades-services', number: 4, name: 'Trades & local services', category: 'business',
    description: 'High-contrast and practical: what you do, where you work, licence details and a large call-to-action for quotes.',
    suits: ['Electricians', 'Plumbers', 'Landscapers', 'Builders', 'Cleaners'], baseTemplate: 'practice', purpose: 'business',
    pages: ['home', 'articles', 'galleries', 'about', 'contact'], pageLabels: { articles: 'Services', galleries: 'Our work', contact: 'Get a quote' },
    font: { heading: 'condensed', body: 'sans', weight: 700, case: 'uppercase', tracking: 0.02 }, radius: 4, buttonRadius: 4, density: 'compact',
    light: { bg: '#f4f6f8', surface: '#ffffff', text: '#0f1b2a', muted: '#4b5a6b', accent: '#b93d0a', onAccent: '#ffffff', border: '#d7dee6', art1: '#345a7a', art2: '#f2a33a', heroShade: '#0f1b2a', heroText: '#f4f6f8' },
    dark: { bg: '#0d1520', surface: '#152131', text: '#edf2f7', muted: '#a6b4c3', accent: '#fb923c', onAccent: '#1a0c02', border: '#26364a', art1: '#1f3b55', art2: '#f2a33a', heroShade: '#060c14', heroText: '#edf2f7' },
    header: 'split', hero: 'banner',
    sections: [{ type: 'cards', page: 'articles', heading: 'What we do', columns: 4, count: 4, images: true }, { type: 'facts' }, { type: 'gallery', page: 'galleries', heading: 'Recent jobs', style: 'wide', count: 3 }, { type: 'intro', page: 'about', heading: 'About us' }, { type: 'cta', heading: 'Need a quote?', text: 'Tell us about the job and we will reply within one business day.', button: 'Request a quote' }],
    notes: ['Check local rules before publishing licence numbers; the theme shows a field for them but does not require one.'],
    sample: { siteName: 'Ridgeline Renovations', tagline: 'Licensed · Local · On time', headline: 'Built properly. Finished on time.', subhead: 'Renovations, repairs and new work across the district.', primary: 'Get a free quote', secondary: 'Call us', intro: 'A small local team: carpenters, a kitchen installer and a licensed electrician.',
      items: [{ title: 'Carpentry', text: 'Framing, doors, stairs and custom joinery.' }, { title: 'Kitchens', text: 'Full renovations, cabinetry to benchtops.' }, { title: 'Decks & pergolas', text: 'Hardwood and composite outdoor rooms.' }, { title: 'Electrical', text: 'Lighting, power and safety checks.' }],
      facts: [['Service area', 'Within 80 km of town'], ['Licence', 'Shown here'], ['Phone', '0400 000 000']] }
  },
  {
    id: 'professional-practice', number: 5, name: 'Professional practice', category: 'business',
    description: 'Restrained and trustworthy: serif headings, generous white space, practice areas, people and a clear way to make contact.',
    suits: ['Law firms', 'Accountants', 'Financial and advisory practices'], baseTemplate: 'practice', purpose: 'business',
    pages: ['home', 'about', 'articles', 'contact'], pageLabels: { articles: 'Insights', about: 'Our firm' },
    font: { heading: 'oldstyle', body: 'sans', weight: 500 }, radius: 2, buttonRadius: 2, density: 'compact', workgroup: true,
    light: { bg: '#ffffff', surface: '#f6f5f1', text: '#1c2433', muted: '#555f6d', accent: '#1f3a5f', onAccent: '#ffffff', border: '#e2e4e8', art1: '#2f4a6d', art2: '#b9a77c', heroShade: '#1b2a40', heroText: '#f6f5f1' },
    dark: { bg: '#10151d', surface: '#18202b', text: '#e9edf2', muted: '#a5afbc', accent: '#9db8de', onAccent: '#0f1824', border: '#2a3442', art1: '#22364f', art2: '#6d6142', heroShade: '#0a1018', heroText: '#e9edf2' },
    header: 'split', hero: 'text',
    sections: [{ type: 'gallery', page: 'about', style: 'wide', count: 1 }, { type: 'list', page: 'about', heading: 'How we can help' }, { type: 'intro', page: 'about', heading: 'How we work' }, { type: 'cards', page: 'articles', heading: 'Recent insights', columns: 2, count: 4, images: true }, { type: 'people', page: 'about', heading: 'Our people' }, { type: 'contact', page: 'contact', heading: 'Arrange a first meeting', text: 'A first conversation is free and confidential.' }],
    notes: ['Insights pages are general information; tenants are responsible for any disclaimers their profession requires.'],
    sample: { siteName: 'Whitfield Lane Partners', tagline: 'Lawyers & advisers', headline: 'Clear advice for important decisions.', subhead: 'Property, business, wills and estates for families and small businesses.', primary: 'Our services', secondary: 'Contact us', intro: 'We explain the options in plain English, agree fees up front and keep you updated at every step.',
      items: [{ meta: 'Property', title: 'Buying your first home', text: 'What to check before you sign a contract.' }, { meta: 'Business', title: 'Setting up a partnership', text: 'The agreements worth having in writing.' }, { meta: 'Estates', title: 'Why update your will', text: 'Life changes that affect your estate plan.' }],
      people: [['A. Whitfield', 'Principal'], ['R. Lane', 'Partner'], ['S. Okafor', 'Senior associate'], ['J. Chen', 'Practice manager']] }
  },
  {
    id: 'consultant', number: 6, name: 'Consultant', category: 'business',
    description: 'A clean personal-brand site: who you are, what you help with, selected work and writing, with one confident accent colour.',
    suits: ['Independent consultants', 'Coaches', 'Freelancers', 'Speakers'], baseTemplate: 'folio', purpose: 'business',
    pages: ['home', 'about', 'articles', 'blog', 'contact'], pageLabels: { articles: 'Work', blog: 'Writing' },
    font: { heading: 'geometric', body: 'sans', weight: 700, tracking: -0.01 }, radius: 12, buttonRadius: 999,
    light: { bg: '#fbfbfd', surface: '#ffffff', text: '#17171c', muted: '#5b5b66', accent: '#4f46e5', onAccent: '#ffffff', border: '#e6e6ee', art1: '#4f46e5', art2: '#22d3ee', heroShade: '#17153a', heroText: '#f4f4fb' },
    dark: { bg: '#0f0f14', surface: '#17171f', text: '#ededf3', muted: '#a1a1b0', accent: '#a5b4fc', onAccent: '#14143a', border: '#2a2a36', art1: '#312e81', art2: '#155e75', heroShade: '#0a0a12', heroText: '#ededf3' },
    header: 'split', hero: 'split', width: 1240,
    sections: [{ type: 'list', page: 'about', heading: 'What I help with' }, { type: 'cards', page: 'articles', heading: 'Selected work', columns: 3, count: 3, images: true }, { type: 'facts', heading: 'How it works' }, { type: 'feature', page: 'blog', heading: 'Latest writing' }, { type: 'cta', heading: 'Let’s talk about your project', button: 'Book a call' }],
    sample: { siteName: 'Rowan Ellis', tagline: 'Strategy & operations consultant', headline: 'Make the complicated feel manageable.', subhead: 'I help small organisations plan, prioritise and deliver change.', primary: 'Work with me', secondary: 'See case studies', featured: { meta: 'Writing', title: 'Five questions before any restructure', text: 'A short checklist I use with every new client.' }, intro: 'Ten years in operations, now working independently with not-for-profits and growing businesses.',
      items: [{ meta: 'Case study', title: 'Halving onboarding time', text: 'A new intake process for a regional health service.' }, { meta: 'Case study', title: 'From spreadsheets to a system', text: 'Choosing and rolling out a booking platform.' }, { meta: 'Workshop', title: 'Planning days that stick', text: 'A facilitation format for leadership teams.' }] }
  },
  {
    id: 'writer-author', number: 7, name: 'Writer & author', category: 'writing',
    description: 'A book-like reading column with old-style type, a featured piece and a quiet list of recent writing.',
    suits: ['Authors', 'Essayists', 'Bloggers', 'Poets'], baseTemplate: 'editorial', purpose: 'writer',
    pages: ['home', 'blog', 'articles', 'about', 'contact'], pageLabels: { articles: 'Essays', blog: 'Notes' },
    font: { heading: 'oldstyle', body: 'oldstyle', weight: 400, scale: 1.05 }, radius: 0, buttonRadius: 2, width: 1100,
    light: { bg: '#fdfcf8', surface: '#f6f3ea', text: '#222222', muted: '#5e5a52', accent: '#8a2c2c', onAccent: '#ffffff', border: '#e7e3d8', art1: '#4b5a52', art2: '#d9cfb8' },
    dark: { bg: '#161513', surface: '#1e1c19', text: '#ebe6dc', muted: '#aca596', accent: '#e89a8a', onAccent: '#2a0d0a', border: '#33302a', art1: '#4a4338', art2: '#7c6f59' },
    header: 'centered', hero: 'text',
    sections: [{ type: 'feature', page: 'articles', heading: 'New essay' }, { type: 'list', page: 'articles', heading: 'Recent essays' }, { type: 'feature', page: 'about', heading: 'The book' }, { type: 'cta', heading: 'A letter, once a month', text: 'New essays, what I am reading, and the occasional photograph of a cloud.', button: 'Subscribe' }, { type: 'intro', page: 'about', heading: 'About' }],
    sample: { siteName: 'Ellen Moray', tagline: 'Essays & fiction', headline: 'Small stories about large places.', subhead: 'Writing on landscape, memory and the towns people leave.', primary: 'Start reading', featured: { meta: 'New essay', title: 'Winter at the edge of town', text: 'On fog, footy ovals and the people who stay.' }, intro: 'Writer and editor.',
      items: [{ meta: 'Essay · 12 min', title: 'The river remembers its floods', text: 'On living somewhere that keeps changing shape.' }, { meta: 'Essay · 8 min', title: 'A year of letters', text: 'What happened when I stopped texting.' }, { meta: 'Fiction · 20 min', title: 'The last bus to Greywater', text: 'A short story.' }] }
  },
  {
    id: 'magazine', number: 8, name: 'Magazine', category: 'writing',
    description: 'A multi-column front page with a bold lead story, category labels and a news list, for newsletters and online magazines.',
    suits: ['Online magazines', 'Local news', 'Newsletters', 'Student publications'], baseTemplate: 'editorial', purpose: 'writer',
    pages: ['home', 'articles', 'blog', 'about'], pageLabels: { articles: 'Stories', blog: 'News' },
    font: { heading: 'didone', body: 'sans', weight: 700 }, radius: 0, buttonRadius: 0, width: 1280, density: 'compact', workgroup: true,
    light: { bg: '#fbfaf7', surface: '#f1eee7', text: '#141414', muted: '#57534d', accent: '#b0102b', onAccent: '#ffffff', border: '#ddd7cc', art1: '#444444', art2: '#b5a58a', heroShade: '#0e0e0e', heroText: '#f6f4ef' },
    dark: { bg: '#121212', surface: '#1c1c1c', text: '#f1f1f1', muted: '#aaaaaa', accent: '#ff6b7d', onAccent: '#2a0006', border: '#333333', art1: '#333333', art2: '#6b5f4d' },
    header: 'centered', hero: 'statement',
    sections: [{ type: 'feature', page: 'articles', heading: 'Cover story' }, { type: 'list', page: 'blog', heading: 'In brief' }, { type: 'cards', page: 'articles', heading: 'This issue', columns: 3, count: 3 }, { type: 'gallery', page: 'articles', heading: 'Photo essay', style: 'wide', count: 1 }, { type: 'feature', page: 'articles', heading: 'Interview' }, { type: 'cta', heading: 'The Review, once a month', text: 'One email on the first Sunday of the month.', button: 'Subscribe' }],
    sample: { siteName: 'The Valley Review', tagline: 'Independent · Monthly', headline: 'The Valley Review', subhead: 'Arts, ideas and local life.', primary: 'Read this issue', featured: { meta: 'Cover story', title: 'The last dairy in the valley', text: 'Three generations, one herd and a hard decision.' }, intro: 'An independent magazine run by volunteers.',
      items: [{ meta: 'Feature', title: 'Who owns the old mill?', text: 'A decade of plans, and what happens next.' }, { meta: 'Arts', title: 'Twelve galleries, one weekend', text: 'A guide to the open studios trail.' }, { meta: 'Food', title: 'The orchard that came back', text: 'Heritage apples on a hillside block.' }, { meta: 'Sport', title: 'Grand final day', text: 'Scenes from the oval.' }] }
  },
  {
    id: 'musician-band', number: 9, name: 'Musician & band', category: 'creative',
    description: 'Dark and loud: a full-bleed opening image, upcoming gigs first, then photos, story and booking contact.',
    suits: ['Musicians', 'Bands', 'DJs', 'Choirs'], baseTemplate: 'horizon', purpose: 'creative',
    pages: ['home', 'blog', 'galleries', 'about', 'contact'], pageLabels: { blog: 'Gigs & news', galleries: 'Photos', contact: 'Bookings' },
    font: { heading: 'condensed', body: 'sans', weight: 800, case: 'uppercase', tracking: 0.03, scale: 1.05 }, radius: 4, buttonRadius: 999, workgroup: true,
    light: { bg: '#f3f0ff', surface: '#ffffff', text: '#1a1028', muted: '#5c4f70', accent: '#7c1fd1', onAccent: '#ffffff', border: '#ddd3f0', art1: '#7c1fd1', art2: '#ff4f8b', heroShade: '#1a1028', heroText: '#ffffff' },
    dark: { bg: '#0c0812', surface: '#17101f', text: '#f4efff', muted: '#b4a6c8', accent: '#d9a6ff', onAccent: '#2a0b45', border: '#2d2140', art1: '#4b1580', art2: '#a3164c', heroShade: '#0c0812', heroText: '#ffffff' },
    header: 'minimal', hero: 'full-bleed', width: 1400,
    sections: [{ type: 'list', page: 'blog', heading: 'On tour' }, { type: 'feature', page: 'blog', heading: 'Latest release' }, { type: 'gallery', page: 'galleries', heading: 'Live', style: 'masonry', count: 5 }, { type: 'intro', page: 'about', heading: 'The band' }, { type: 'contact', page: 'contact', heading: 'Book the band', text: 'Venues, festivals and private events.' }, { type: 'cta', heading: 'First to hear', text: 'New dates and releases, about once a month.', button: 'Join the list' }],
    notes: ['Embedded players from music services are not included: they load content from outside SoraSpace. Link to releases instead.'],
    sample: { siteName: 'The Night Ferries', tagline: 'New album out now', headline: 'Louder by the water', subhead: 'Four-piece indie rock from the south coast.', primary: 'See gig dates', secondary: 'Listen', intro: 'Four friends, two vans and a lot of reverb. Playing pubs and festivals since 2019.',
      items: [{ title: 'The Harbour Hotel', text: 'With special guests · Doors 8 pm', meta: 'Sat 14 Dec' }, { title: 'Riverside Festival', text: 'Main stage', meta: 'Sun 5 Jan' }, { title: 'The Old Theatre', text: 'Album launch · All ages', meta: 'Fri 24 Jan' }] }
  },
  {
    id: 'fitness-studio', number: 10, name: 'Fitness & studio', category: 'business',
    description: 'Light, energetic and rounded: class types, the weekly timetable, the space and an easy first-class offer.',
    suits: ['Yoga studios', 'Pilates', 'Personal trainers', 'Dance schools', 'Martial arts'], baseTemplate: 'practice', purpose: 'business',
    pages: ['home', 'blog', 'galleries', 'about', 'contact'], pageLabels: { blog: 'Timetable', galleries: 'The studio' },
    font: { heading: 'rounded', body: 'sans', weight: 700 }, radius: 18, buttonRadius: 999,
    light: { bg: '#f5fbf8', surface: '#ffffff', text: '#0f2a22', muted: '#4a6359', accent: '#0f766e', onAccent: '#ffffff', border: '#d4e8e0', art1: '#34d399', art2: '#fbbf24', heroShade: '#0c2621', heroText: '#f5fbf8' },
    dark: { bg: '#0b1a16', surface: '#12251f', text: '#e8f6f0', muted: '#9cbdb1', accent: '#5eead4', onAccent: '#042f2a', border: '#23403a', art1: '#065f46', art2: '#92400e', heroShade: '#06110e', heroText: '#e8f6f0' },
    header: 'split', hero: 'split', width: 1240,
    sections: [{ type: 'facts' }, { type: 'cards', page: 'about', heading: 'Classes', columns: 3, count: 3, images: true }, { type: 'list', page: 'blog', heading: 'This week' }, { type: 'people', page: 'about', heading: 'Teachers' }, { type: 'list', page: 'about', heading: 'Prices' }, { type: 'cta', heading: 'Your first class is on us', text: 'Bring water and comfortable clothes. Mats and towels provided.', button: 'Book a free class' }],
    notes: ['The timetable is a Blog post updated each week. Online class booking is not part of the theme.', 'Avoid health claims in sample or tenant copy.'],
    sample: { siteName: 'Saltbush Movement', tagline: 'Yoga · Pilates · Strength', headline: 'Move well. Feel good.', subhead: 'Small classes for every body and every level.', primary: 'See the timetable', secondary: 'Book a free class', intro: 'A friendly studio with experienced teachers.',
      items: [{ title: 'Morning flow', text: 'All levels · 60 min', meta: 'Mon, Wed, Fri 6:30 am' }, { title: 'Reformer pilates', text: 'Beginner friendly · 45 min', meta: 'Tue, Thu 5:30 pm' }, { title: 'Strength basics', text: 'Small group · 50 min', meta: 'Sat 8 am' }],
      facts: [['Classes', 'Over 20 a week'], ['Find us', 'Upstairs, 8 Example Lane'], ['First class', 'Free']] }
  }
];

// Import readiness, recorded per batch. A batch is marked ready only after it passes
// themes.test.mjs and a visual review of every preview in light and dark.
export const BATCHES = [
  { batch: 1, themes: '0-10', added: '2026-11-10', readyToImport: true },
  { batch: 2, themes: '11-20', added: '2026-11-10', readyToImport: true },
  { batch: 3, themes: '21-30', added: '2026-11-10', readyToImport: true },
  { batch: 4, themes: '31-40', added: '2026-11-10', readyToImport: true },
  { batch: 5, themes: '41-50', added: '2026-11-10', readyToImport: true }
];

const ready = n => BATCHES.find(b => b.batch === (n <= 10 ? 1 : Math.ceil(n / 10)))?.readyToImport === true;
export const THEMES = [...BATCH_01, ...BATCH_02, ...BATCH_03, ...BATCH_04, ...BATCH_05].map(t => ({ ...t, readyToImport: ready(t.number) }));
