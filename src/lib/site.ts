import { createReader } from '@keystatic/core/reader';
import { liveCollection } from './studio-content';
import keystaticConfig from '../../keystatic.config';

export const reader = createReader(process.cwd(), keystaticConfig);

export const PALETTES = [
  { id: 'alpine', name: 'Alpine', swatch: ['#f4f3ee', '#ffffff', '#376b5c', '#233a32'] },
  { id: 'midnight', name: 'Midnight', swatch: ['#121924', '#1f2b3b', '#8bbeda', '#eef2f6'] },
  { id: 'desert', name: 'Desert', swatch: ['#f7f0e5', '#fffbf5', '#a55e42', '#5a3a2e'] },
  { id: 'coastal', name: 'Coastal', swatch: ['#eef5f7', '#ffffff', '#1a7a96', '#183b50'] },
  { id: 'forest', name: 'Forest', swatch: ['#edf0e9', '#f8faf6', '#527a4b', '#263a2b'] },
  { id: 'rose', name: 'Sakura Pink', swatch: ['#fff2f6', '#fffafd', '#a83f6b', '#4a293a'] },
] as const;

export async function getHome() {
  const home = await reader.singletons.home.read();
  return {
    eyebrow: home?.eyebrow ?? '',
    heading: home?.heading ?? '',
    intro: home?.intro ?? '',
    strategyTitle: home?.strategyTitle || 'Strategy & Security',
    strategyBlurb: home?.strategyBlurb ?? '',
    exploreTitle: home?.exploreTitle || 'Explore',
    exploreBlurb: home?.exploreBlurb ?? '',
    defaultPalette: home?.defaultPalette || 'alpine',
  };
}

export const getEssays = async () => liveCollection('essays');
export const getReports = async () => liveCollection('cyber');
export const getOsintBriefs = async () => liveCollection('osint');
export const getJournal = async () => liveCollection('journal');
export const getGalleries = async () => liveCollection('photography');

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const shortDate = (d: Date) =>
  d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** What readers see for a location, respecting the privacy setting chosen in the editor. */
export const shownLocation = (location: string, precision: string) =>
  precision === 'hidden' || !location ? '' : location;

export const readingTime = (body: string | undefined) =>
  `${Math.max(1, Math.round((body ?? '').split(/\s+/).length / 230))} min read`;
