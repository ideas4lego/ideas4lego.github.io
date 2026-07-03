// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://ideas4lego.github.io',
  // Корневой репозиторий (ideas4lego.github.io) -> сайт живёт в корне домена,
  // base не нужен. Если позже перейдёте на обычный репозиторий вида
  // username/reponame, добавьте сюда: base: '/reponame'
});
