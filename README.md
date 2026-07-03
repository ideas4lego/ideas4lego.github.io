# Ideas4Lego — сайт

Стек: **Astro** (генератор сайта) + **Decap CMS** (панель для ребёнка) +
**GitHub Pages** (хостинг).

## Как это устроено

- `src/content/posts/` — записи блога (markdown-файлы). Их создаёт и
  правит ребёнок через `/admin`.
- `src/content/pages/` — отдельные страницы вроде «Обо мне».
- `src/layouts/`, `src/pages/`, `src/styles/global.css` — вёрстка и
  оформление. Это ваша (профессионала) зона — правите обычным кодом.
- `public/admin/` — панель управления для ребёнка (Decap CMS).
- `.github/workflows/deploy.yml` — при каждом коммите в `main`
  GitHub Actions сам собирает сайт и публикует на GitHub Pages.
- `oauth-proxy/` — маленький сервер, без которого не заработает вход
  в `/admin` (см. ниже, почему он нужен).

Ребёнок никогда не открывает код и не видит GitHub. Он заходит на
`https://ideas4lego.github.io/admin/`, входит через GitHub-аккаунт и
работает с простой формой. Вы работаете с обычным репозиторием и
редактируете CSS/JS/шаблоны как угодно — оба потока сходятся в одном
репозитории и не мешают друг другу.

---

## Первоначальная настройка (сделать один раз)

### 1. Создать репозиторий на GitHub

Репозиторий должен называться **ideas4lego.github.io** (уже решили —
корневой домен). Загрузите туда содержимое этой папки:

```bash
cd site
git init
git add .
git commit -m "Первая версия сайта"
git branch -M main
git remote add origin https://github.com/ideas4lego/ideas4lego.github.io.git
git push -u origin main
```

### 2. Включить GitHub Pages через Actions

В репозитории: **Settings → Pages → Build and deployment → Source** →
выбрать **GitHub Actions**. Дальше всё уже настроено в
`.github/workflows/deploy.yml` — при каждом пуше в `main` сайт
пересоберётся и опубликуется сам, минут за 1-2.

Проверить: после первого пуша откройте вкладку **Actions** в
репозитории — должен пройти зелёный workflow «Deploy site to GitHub
Pages». После этого сайт будет доступен на
`https://ideas4lego.github.io`.

### 3. Настроить вход в CMS (самое важное и единственное сложное место)

GitHub Pages отдаёт только статичные файлы — там нет места, где может
происходить OAuth-авторизация (шаг с обменом кода на токен). Поэтому
нужен отдельный крошечный сервер — он уже написан в `oauth-proxy/`, вам
нужно только его задеплоить (5 минут, делается один раз).

**3.1. Создать GitHub OAuth App**

1. Зайдите на https://github.com/settings/developers →
   **New OAuth App**
2. Заполните:
   - **Application name**: Ideas4Lego CMS (любое)
   - **Homepage URL**: `https://ideas4lego.github.io`
   - **Authorization callback URL**: пока оставьте заглушку, вернётесь
     сюда после шага 3.2 (это будет `https://<адрес-воркера>/callback`)
3. Сохраните — получите **Client ID** и сможете сгенерировать
   **Client Secret**.

**3.2. Задеплоить oauth-proxy на Cloudflare Workers (бесплатно)**

```bash
cd oauth-proxy
npm install -g wrangler   # если ещё не установлен
wrangler login
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler deploy
```

После деплоя Wrangler покажет адрес вида
`https://ideas4lego-cms-oauth.<ваш-акк>.workers.dev`.

**3.3. Связать всё воедино**

1. Вернитесь в настройки GitHub OAuth App (шаг 3.1) и впишите в
   **Authorization callback URL**:
   `https://ideas4lego-cms-oauth.<ваш-акк>.workers.dev/callback`
2. Откройте `public/admin/config.yml` в этом проекте и замените:
   ```yaml
   base_url: https://ideas4lego-cms-oauth.<ваш-акк>.workers.dev
   ```
3. Закоммитьте и запушьте это изменение.

Готово. Теперь `https://ideas4lego.github.io/admin/` пускает по кнопке
«Login with GitHub».

> Альтернатива Cloudflare Workers — тот же принцип работает на Vercel
> или любом другом serverless-хостинге, если Cloudflare почему-то не
> подходит. Логика та же: два эндпоинта `/auth` и `/callback`.

### 4. Дать ребёнку доступ к репозиторию

Через GitHub OAuth CMS проверяет права ребёнка через его собственный
GitHub-аккаунт. Значит:
1. Создайте ребёнку отдельный GitHub-аккаунт (если ещё нет).
2. Добавьте его как **Collaborator** в репозиторий: **Settings →
   Collaborators → Add people**.
3. Дайте ему ссылку `https://ideas4lego.github.io/admin/` — это всё,
   что ему нужно знать. GitHub, коммиты, код — от него полностью
   скрыты за формой.

---

## Повседневная работа

**Ребёнок:** заходит на `/admin/`, добавляет/редактирует посты и
страницы через форму, жмёт «Publish». Через 1-2 минуты изменения сами
появляются на сайте (сборка идёт в фоне через GitHub Actions).

**Вы:** правите `src/styles/global.css` (общий вид), `src/layouts/`
и `src/pages/*.astro` (структура страниц) обычным образом, коммитите
и пушите в `main` — сайт обновится так же автоматически.

```bash
npm install       # один раз после клонирования
npm run dev       # локальный просмотр на http://localhost:4321
npm run build     # ручная сборка (для проверки перед пушем)
```

## Что можно добавить дальше

- Свои разделы в CMS (`public/admin/config.yml`) — например, «Проекты
  LEGO» с полями фото + описание.
- Кастомный домен вместо `ideas4lego.github.io` (Settings → Pages →
  Custom domain).
- Модерация: включить `publish_mode: editorial_workflow` в
  `config.yml`, чтобы посты сначала попадали в черновики, а вы
  подтверждали публикацию.
