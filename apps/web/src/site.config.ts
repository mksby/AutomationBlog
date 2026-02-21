interface SiteConfig {
  title: string;
  description: string;
  lang: string;
  author: string;
  social: {
    github?: string;
    twitter?: string;
    email?: string;
  };
  postsPerPage: number;
}

export const siteConfig: SiteConfig = {
  title: "Automation Blog",
  description: "A blog about process automation, tools, and best practices.",
  lang: "en",
  author: "Automation Blog",
  social: {
    github: "https://github.com",
    email: "hello@example.com",
  },
  postsPerPage: 10,
};
