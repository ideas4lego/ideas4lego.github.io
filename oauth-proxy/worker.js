/**
 * Мини-сервер авторизации для Decap CMS через GitHub OAuth.
 *
 * Зачем он нужен: GitHub Pages отдаёт только статичные файлы и не может
 * сам провести OAuth-вход. Этот Cloudflare Worker берёт на себя два шага
 * стандартного GitHub OAuth (redirect -> code -> access_token) и передаёт
 * токен обратно в окно CMS через postMessage — именно этого протокола
 * ждёт Decap CMS.
 *
 * Настройка (один раз, см. README.md в корне проекта):
 * 1. Создать GitHub OAuth App: https://github.com/settings/developers
 *      Homepage URL:            https://ideas4lego.github.io
 *      Authorization callback:  https://<адрес-этого-воркера>/callback
 * 2. Задать секреты воркера (через `wrangler secret put`):
 *      GITHUB_CLIENT_ID
 *      GITHUB_CLIENT_SECRET
 * 3. Задеплоить: `wrangler deploy` (из этой папки).
 * 4. Скопировать адрес воркера в public/admin/config.yml -> backend.base_url
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
      githubAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      githubAuthUrl.searchParams.set("scope", "repo,user");
      githubAuthUrl.searchParams.set(
        "redirect_uri",
        `${url.origin}/callback`
      );
      return Response.redirect(githubAuthUrl.toString(), 302);
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Отсутствует код авторизации", { status: 400 });
      }

      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(
          `Ошибка авторизации: ${tokenData.error_description || tokenData.error}`,
          { status: 400 }
        );
      }

      const token = tokenData.access_token;
      const payloadOk = JSON.stringify({ token, provider: "github" });
      const payloadErr = JSON.stringify({ err: "no token" });

      // Decap CMS ждёт именно такое сообщение через postMessage от
      // окна авторизации в открывшее его окно.
      const message = token
        ? `authorization:github:success:${payloadOk}`
        : `authorization:github:error:${payloadErr}`;

      const finalHtml = `
<!doctype html>
<html>
  <body>
    <script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage(
            ${JSON.stringify(message)},
            e.origin
          );
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`;

      return new Response(finalHtml, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    return new Response("OAuth proxy для Decap CMS. Пути: /auth, /callback", {
      status: 200,
    });
  },
};
