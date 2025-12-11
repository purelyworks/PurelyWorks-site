import express from 'express';
import payload from 'payload';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const start = async (): Promise<void> => {
  const app = express();

  app.use('/media', express.static(path.resolve(__dirname, '../cms/media')));

  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'purely-works-dev-secret',
    express: app,
    onInit: async () => {
      payload.logger.info('Payload CMS started at /admin');
    },
  });

  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));

  app.get('*', (_, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => {
    payload.logger.info(`Purely Works site + CMS running on http://localhost:${port}`);
  });
};

void start();
