import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { slateEditor } from '@payloadcms/richtext-slate';
import { Users } from './collections/Users';
import { Pages } from './collections/Pages';
import { Posts } from './collections/Posts';
import { Media } from './collections/Media';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SITE_URL || 'http://localhost:4000',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '| Purely Works',
      description: 'Purely Works CMS for marketing pages and blog',
    },
  },
  editor: slateEditor({}),
  collections: [Users, Pages, Posts, Media],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 20 * 1024 * 1024,
    },
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./cms/payload.db',
    },
  }),
  rateLimit: {
    trustProxy: true,
  },
});
