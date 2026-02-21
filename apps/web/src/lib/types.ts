export interface StrapiImage {
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  avatar: StrapiImage | null;
  email: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface SEO {
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: StrapiImage | null;
  canonicalUrl: string | null;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown[];
  coverImage: StrapiImage | null;
  publishedDate: string | null;
  readingTime: number | null;
  featured: boolean;
  seo: SEO | null;
  author: Author | null;
  categories: Category[];
  tags: Tag[];
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: unknown[];
  coverImage: StrapiImage | null;
  template: 'default' | 'full-width' | 'sidebar' | 'contact';
  seo: SEO | null;
  author: Author | null;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  content: unknown[];
  coverImage: StrapiImage | null;
  gallery: StrapiImage[];
  repositoryUrl: string | null;
  liveUrl: string | null;
  techStack: string[] | null;
  status: 'in-progress' | 'completed' | 'archived';
  featured: boolean;
  completedDate: string | null;
  seo: SEO | null;
  author: Author | null;
  categories: Category[];
  tags: Tag[];
}

export interface Tutorial {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown[];
  coverImage: StrapiImage | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number | null;
  prerequisites: string | null;
  seo: SEO | null;
  author: Author | null;
  categories: Category[];
  tags: Tag[];
}

export interface CodeSnippet {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  code: string;
  language: string;
  seo: SEO | null;
  author: Author | null;
  categories: Category[];
  tags: Tag[];
}
