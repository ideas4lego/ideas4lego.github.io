// Разбор ссылки на видео (YouTube или RuTube), чтобы получить
// embed-адрес для плеера и (где возможно) превью-картинку по умолчанию.

type VideoInfo = {
  provider: 'youtube' | 'rutube';
  embedUrl: string;
  thumbnail: string | null;
};

function parseYouTube(url: URL): VideoInfo | null {
  if (!url.hostname.includes('youtu.be') && !url.hostname.includes('youtube.com')) {
    return null;
  }

  let id: string | null = null;

  if (url.hostname.includes('youtu.be')) {
    id = url.pathname.slice(1) || null;
  } else if (url.pathname === '/watch') {
    id = url.searchParams.get('v');
  } else if (url.pathname.startsWith('/embed/')) {
    id = url.pathname.split('/embed/')[1] || null;
  } else if (url.pathname.startsWith('/shorts/')) {
    id = url.pathname.split('/shorts/')[1] || null;
  }

  if (!id) return null;

  return {
    provider: 'youtube',
    embedUrl: `https://www.youtube.com/embed/${id}`,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

function parseRuTube(url: URL): VideoInfo | null {
  if (!url.hostname.includes('rutube.ru')) return null;

  // Поддерживаем: /video/<id>/, /play/embed/<id>, /shorts/<id>/
  const match = url.pathname.match(/\/(?:video|shorts|play\/embed)\/([a-zA-Z0-9]+)/);
  const id = match?.[1] || null;

  if (!id) return null;

  return {
    provider: 'rutube',
    embedUrl: `https://rutube.ru/play/embed/${id}`,
    // У RuTube нет простого публичного адреса превью по id без запроса
    // к их API, поэтому для RuTube своя картинка (поле "thumbnail" в
    // CMS) особенно рекомендуется — иначе будет цветной градиент.
    thumbnail: null,
  };
}

export function getVideoInfo(url: string): VideoInfo | null {
  try {
    const parsed = new URL(url);
    return parseYouTube(parsed) || parseRuTube(parsed);
  } catch {
    return null;
  }
}

export function getVideoEmbedUrl(url: string): string | null {
  return getVideoInfo(url)?.embedUrl ?? null;
}

export function getVideoThumbnail(url: string): string | null {
  return getVideoInfo(url)?.thumbnail ?? null;
}
