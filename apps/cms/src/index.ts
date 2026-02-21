import type { Core } from '@strapi/strapi';

let lastRebuildTrigger = 0;
const DEBOUNCE_MS = 60_000;

const WATCHED_CONTENT_TYPES = [
  'api::article.article',
  'api::page.page',
  'api::project.project',
  'api::tutorial.tutorial',
  'api::code-snippet.code-snippet',
];

async function triggerRebuild(strapi: Core.Strapi) {
  const now = Date.now();
  if (now - lastRebuildTrigger < DEBOUNCE_MS) return;
  lastRebuildTrigger = now;

  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_REBUILD_TOKEN;
  if (!repo || !token) return;

  try {
    await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ event_type: 'strapi-content-update' }),
    });
    strapi.log.info('Rebuild webhook triggered');
  } catch (err) {
    strapi.log.error('Failed to trigger rebuild webhook', err);
  }
}

export default {
  register() {},

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      afterCreate(event) {
        if (WATCHED_CONTENT_TYPES.includes(event.model.uid)) {
          triggerRebuild(strapi);
        }
      },
      afterUpdate(event) {
        if (WATCHED_CONTENT_TYPES.includes(event.model.uid)) {
          triggerRebuild(strapi);
        }
      },
      afterDelete(event) {
        if (WATCHED_CONTENT_TYPES.includes(event.model.uid)) {
          triggerRebuild(strapi);
        }
      },
    });
  },
};
