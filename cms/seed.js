import payload from 'payload';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'purely-works-dev-secret',
  });

  const existing = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: 'farid@purelyworks.com',
      },
    },
  });

  if (existing.totalDocs > 0) {
    payload.logger.info('Admin user already exists, skipping seed');
    return;
  }

  await payload.create({
    collection: 'users',
    data: {
      email: 'farid@purelyworks.com',
      name: 'Farid',
      role: 'admin',
      password: process.env.PURELY_ADMIN_PASSWORD || 'PurelySecure!123',
    },
  });

  payload.logger.info('Seeded admin user farid@purelyworks.com');
};

seedAdmin()
  .catch((err) => {
    payload.logger.error(err);
    process.exit(1);
  })
  .finally(() => process.exit());
