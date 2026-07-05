import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Общая палитра акцентных цветов для карточек (соответствует шаблону).
export const accentColors = ['brick', 'sky', 'grass', 'sun', 'grape'] as const;
const accentColorEnum = z.enum(accentColors).default('brick');

const difficultyLevels = ['Легко', 'Средне', 'Сложно'] as const;

// "builds" — раздел "Постройки". Каждая запись = одна модель из лего.
const builds = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/builds' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    excerpt: z.string().optional(),
    pieceCount: z.number().optional(),
    timeMinutes: z.number().optional(),
    difficulty: z.enum(difficultyLevels).default('Легко'),
    accentColor: accentColorEnum,
    draft: z.boolean().default(false),
  }),
});

// "videos" — раздел "Видео с канала".
const videos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    youtubeUrl: z.string(),
    thumbnail: z.string().optional(),
    durationMinutes: z.number().optional(),
    durationSeconds: z.number().optional(),
    views: z.string().optional(),
    excerpt: z.string().optional(),
    accentColor: accentColorEnum,
    draft: z.boolean().default(false),
  }),
});

// "gallery" — раздел "Фотогалерея построек".
const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    image: z.string(),
    tag: z.string(),
    date: z.coerce.date(),
  }),
});

// "pages" — произвольные статичные страницы (например "Обо мне").
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    image: z.string().optional(),
    showInMenu: z.boolean().default(true),
    menuOrder: z.number().default(0),
  }),
});

export const collections = { builds, videos, gallery, pages };
