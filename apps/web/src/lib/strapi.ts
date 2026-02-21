const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_API_TOKEN;

interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

const EMPTY_RESPONSE: StrapiResponse<any> = {
  data: [],
  meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
};

async function fetchFromStrapi<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<StrapiResponse<T>> {
  const url = new URL(`/api/${endpoint}`, STRAPI_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  try {
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      console.warn(`Strapi: ${response.status} ${response.statusText} for ${endpoint}`);
      return EMPTY_RESPONSE as StrapiResponse<T>;
    }
    return response.json();
  } catch (err) {
    console.warn(`Strapi unreachable for ${endpoint}:`, (err as Error).message);
    return EMPTY_RESPONSE as StrapiResponse<T>;
  }
}

export async function getArticles(page = 1, pageSize = 10) {
  return fetchFromStrapi('articles', {
    'populate[coverImage]': '*',
    'populate[author][populate]': 'avatar',
    'populate[categories]': '*',
    'populate[tags]': '*',
    'sort': 'publishedDate:desc',
    'pagination[page]': String(page),
    'pagination[pageSize]': String(pageSize),
  });
}

export async function getArticleBySlug(slug: string) {
  return fetchFromStrapi('articles', {
    'filters[slug][$eq]': slug,
    'populate[coverImage]': '*',
    'populate[author][populate]': 'avatar',
    'populate[categories]': '*',
    'populate[tags]': '*',
    'populate[seo][populate]': 'ogImage',
  });
}

export async function getPages() {
  return fetchFromStrapi('pages', { populate: '*' });
}

export async function getPageBySlug(slug: string) {
  return fetchFromStrapi('pages', {
    'filters[slug][$eq]': slug,
    'populate[seo][populate]': 'ogImage',
    'populate[coverImage]': '*',
    'populate[author][populate]': 'avatar',
  });
}

export async function getTutorials(page = 1, pageSize = 10) {
  return fetchFromStrapi('tutorials', {
    'populate[coverImage]': '*',
    'populate[author][populate]': 'avatar',
    'populate[categories]': '*',
    'populate[tags]': '*',
    'sort': 'createdAt:desc',
    'pagination[page]': String(page),
    'pagination[pageSize]': String(pageSize),
  });
}

export async function getTutorialBySlug(slug: string) {
  return fetchFromStrapi('tutorials', {
    'filters[slug][$eq]': slug,
    'populate[coverImage]': '*',
    'populate[author][populate]': 'avatar',
    'populate[categories]': '*',
    'populate[tags]': '*',
    'populate[seo][populate]': 'ogImage',
  });
}

export async function getProjects(page = 1, pageSize = 10) {
  return fetchFromStrapi('projects', {
    'populate[coverImage]': '*',
    'populate[author][populate]': 'avatar',
    'populate[categories]': '*',
    'populate[tags]': '*',
    'sort': 'createdAt:desc',
    'pagination[page]': String(page),
    'pagination[pageSize]': String(pageSize),
  });
}

export async function getProjectBySlug(slug: string) {
  return fetchFromStrapi('projects', {
    'filters[slug][$eq]': slug,
    'populate[coverImage]': '*',
    'populate[gallery]': '*',
    'populate[author][populate]': 'avatar',
    'populate[categories]': '*',
    'populate[tags]': '*',
    'populate[seo][populate]': 'ogImage',
  });
}

export async function getCodeSnippets(page = 1, pageSize = 20) {
  return fetchFromStrapi('code-snippets', {
    'populate[categories]': '*',
    'populate[tags]': '*',
    'populate[author][populate]': 'avatar',
    'sort': 'createdAt:desc',
    'pagination[page]': String(page),
    'pagination[pageSize]': String(pageSize),
  });
}

export async function getCodeSnippetBySlug(slug: string) {
  return fetchFromStrapi('code-snippets', {
    'filters[slug][$eq]': slug,
    'populate[categories]': '*',
    'populate[tags]': '*',
    'populate[author][populate]': 'avatar',
    'populate[seo][populate]': 'ogImage',
  });
}

export async function getCategories() {
  return fetchFromStrapi('categories', { populate: '*' });
}

export async function getTags() {
  return fetchFromStrapi('tags', { populate: '*' });
}

export function getStrapiMediaUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}
