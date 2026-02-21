import type { APIRoute, GetStaticPaths } from "astro";
import { getArticles, getTutorials, getProjects } from "@/lib/strapi";
import { siteConfig } from "@/site.config";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

export const getStaticPaths: GetStaticPaths = async () => {
  const [articles, tutorials, projects] = await Promise.all([
    getArticles(1, 100),
    getTutorials(1, 100),
    getProjects(1, 100),
  ]);

  const paths = [
    ...(articles.data as any[]).map((a) => ({
      params: { slug: a.slug },
      props: { title: a.title, description: a.excerpt || "" },
    })),
    ...(tutorials.data as any[]).map((t) => ({
      params: { slug: t.slug },
      props: { title: t.title, description: t.excerpt || "" },
    })),
    ...(projects.data as any[]).map((p) => ({
      params: { slug: p.slug },
      props: { title: p.title, description: p.description || "" },
    })),
  ];

  return paths;
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as {
    title: string;
    description: string;
  };

  const descriptionTruncated =
    description && description.length > 120
      ? description.substring(0, 120) + "..."
      : description;

  // satori expects React-like virtual DOM objects
  const markup = {
    type: "div",
    props: {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 80px",
        background: "linear-gradient(135deg, #1a1b26 0%, #232433 100%)",
        fontFamily: "system-ui, sans-serif",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              fontSize: "20px",
              color: "#56b6c2",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "24px",
            },
            children: siteConfig.title,
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: title.length > 40 ? "48px" : "56px",
              fontWeight: 700,
              color: "#c8d1e0",
              lineHeight: 1.2,
              marginBottom: "20px",
            },
            children: title,
          },
        },
        ...(descriptionTruncated
          ? [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "22px",
                    color: "#8b95a8",
                    lineHeight: 1.5,
                    maxWidth: "90%",
                  },
                  children: descriptionTruncated,
                },
              },
            ]
          : []),
      ],
    },
  };

  const fontData = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff",
  ).then((res) => res.arrayBuffer());

  const svg = await satori(markup as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: fontData,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const pngData = resvg.render().asPng();

  return new Response(pngData as any, {
    headers: { "Content-Type": "image/png" },
  });
};
