import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Коллекция "posts" — записи блога / новости.
// Ребёнок создаёт их через CMS (/admin), просто заполняя форму.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    excerpt: z.string().optional(),
    video: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Коллекция "pages" — отдельные статичные страницы (например "Обо мне").
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    image: z.string().optional(),
    showInMenu: z.boolean().default(true),
    menuOrder: z.number().default(0),
  }),
});

export const collections = { posts, pages };
