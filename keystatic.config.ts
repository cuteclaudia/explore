import { config, collection, singleton, fields } from '@keystatic/core';

// In development the editor saves straight to files on your computer.
// On the live site it saves through GitHub, so every edit becomes a commit
// and Netlify republishes the site automatically.
const storage = import.meta.env.PROD
  ? ({ kind: 'github', repo: 'cuteclaudia/explore' } as const)
  : ({ kind: 'local' } as const);

const body = (label = 'Body') =>
  fields.markdoc({
    label,
    options: {
      image: {
        directory: 'public/images/uploads',
        publicPath: '/images/uploads/',
      },
    },
  });

const draft = fields.checkbox({
  label: 'Draft',
  description: 'Drafts are saved but not shown on the live site.',
  defaultValue: false,
});

const locationPrecision = fields.select({
  label: 'How to show the location',
  description:
    'Approximate shows only the region you type below. Exact names the specific place. Hidden shows nothing.',
  options: [
    { label: 'Approximate (recommended)', value: 'approximate' },
    { label: 'Exact', value: 'exact' },
    { label: 'Hidden', value: 'hidden' },
  ],
  defaultValue: 'approximate',
});

export default config({
  storage,
  ui: {
    brand: { name: 'Claudia Gilbert' },
    navigation: {
      'Strategy & Security': ['essays', 'cyber'],
      Explore: ['journal', 'photography'],
      'Site pages': ['home', 'about'],
    },
  },
  collections: {
    essays: collection({
      label: 'Essays',
      slugField: 'title',
      path: 'src/content/essays/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
          slug: {
            label: 'Web address',
            description: 'The last part of the link, e.g. /chinaseries/puertochancay',
          },
        }),
        date: fields.date({ label: 'Published', validation: { isRequired: true } }),
        series: fields.select({
          label: 'Series',
          options: [
            { label: 'China Series', value: 'china' },
            { label: 'Standalone essay', value: 'standalone' },
          ],
          defaultValue: 'china',
        }),
        summary: fields.text({
          label: 'Summary',
          description: 'Shown in lists and at the top of the essay.',
          multiline: true,
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        heroImage: fields.image({
          label: 'Lead image',
          directory: 'public/images/essays',
          publicPath: '/images/essays/',
        }),
        heroAlt: fields.text({ label: 'Lead image description (alt text)' }),
        legacyHeroImage: fields.ignored(),
        draft,
        content: body('Essay'),
      },
    }),
    cyber: collection({
      label: 'Daily Cyber Threat Reports',
      slugField: 'title',
      path: 'src/content/cyber/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            defaultValue: 'Daily Cyber Threat Report | Australia – Japan – Asia | ',
          },
          slug: { label: 'Web address' },
        }),
        date: fields.date({
          label: 'Report date',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        region: fields.text({ label: 'Region', defaultValue: 'Australia – Japan – Asia' }),
        summary: fields.text({
          label: 'Summary',
          description: 'One or two sentences from the executive summary.',
          multiline: true,
        }),
        draft,
        content: body('Report'),
      },
    }),
    journal: collection({
      label: 'Journal',
      slugField: 'title',
      path: 'src/content/journal/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Title' }, slug: { label: 'Web address' } }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        location: fields.text({
          label: 'Location shown to readers',
          description:
            'Type what readers should see, e.g. "Hokkaido, Japan". Never put an exact address or coordinates here.',
        }),
        locationPrecision,
        summary: fields.text({ label: 'Summary', multiline: true }),
        cover: fields.image({
          label: 'Cover photo',
          directory: 'public/images/journal',
          publicPath: '/images/journal/',
        }),
        coverAlt: fields.text({ label: 'Cover photo description (alt text)' }),
        draft,
        content: body('Story'),
      },
    }),
    photography: collection({
      label: 'Photography',
      slugField: 'title',
      path: 'src/content/photography/*',
      format: { contentField: 'content' },
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Gallery title' }, slug: { label: 'Web address' } }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        location: fields.text({ label: 'Location shown to readers' }),
        locationPrecision,
        photos: fields.array(
          fields.object({
            image: fields.image({
              label: 'Photo',
              directory: 'public/images/photography',
              publicPath: '/images/photography/',
              validation: { isRequired: true },
            }),
            alt: fields.text({ label: 'Description (alt text)', validation: { isRequired: true } }),
            caption: fields.text({ label: 'Caption' }),
          }),
          {
            label: 'Photos',
            itemLabel: (props) => props.fields.caption.value || props.fields.alt.value || 'Photo',
          }
        ),
        draft,
        content: body('Notes'),
      },
    }),
  },
  singletons: {
    home: singleton({
      label: 'Home page',
      path: 'src/content/pages/home',
      schema: {
        eyebrow: fields.text({ label: 'Small heading above the title' }),
        heading: fields.text({ label: 'Main heading', multiline: true }),
        intro: fields.text({ label: 'Introduction', multiline: true }),
        strategyTitle: fields.text({ label: 'Strategy door — title' }),
        strategyBlurb: fields.text({ label: 'Strategy door — description', multiline: true }),
        exploreTitle: fields.text({ label: 'Explore door — title' }),
        exploreBlurb: fields.text({ label: 'Explore door — description', multiline: true }),
        defaultPalette: fields.select({
          label: 'Default colour palette',
          options: [
            { label: 'Alpine', value: 'alpine' },
            { label: 'Midnight', value: 'midnight' },
            { label: 'Desert', value: 'desert' },
            { label: 'Coastal', value: 'coastal' },
            { label: 'Forest', value: 'forest' },
            { label: 'Rose', value: 'rose' },
          ],
          defaultValue: 'alpine',
        }),
      },
    }),
    about: singleton({
      label: 'About page',
      path: 'src/content/pages/about',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.text({ label: 'Title' }),
        image: fields.text({
          label: 'Image link',
          description: 'Temporary: points at the image migrated from Squarespace.',
        }),
        imageAlt: fields.text({ label: 'Image description (alt text)' }),
        content: body('About'),
      },
    }),
  },
});
