import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  const email = process.env.SEED_USER_EMAIL || 'test@example.com';
  const password = process.env.SEED_USER_PASSWORD || 'Password123!';

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hashed },
  });

  const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
  const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];

  const total = 120;
  console.log(`Seeding ${total} leads for user ${user.email} (${user.id})`);

  const now = Date.now();
  const leadsData = Array.from({ length: total }).map((_, i) => {
    const createdAt = new Date(now - randInt(0, 90) * 24 * 60 * 60 * 1000);
    const lastAct = Math.random() < 0.7 ? new Date(createdAt.getTime() + randInt(0, 60) * 24 * 60 * 60 * 1000) : null;
    const firstName = `Lead${i + 1}`;
    const lastName = randomOf(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']);
    return {
      firstName,
      lastName,
      email: `lead${i + 1}@example.com`,
      phone: `+1-555-01${String(i).padStart(2, '0')}`,
      company: randomOf(['Acme Inc', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark Industries']),
      city: randomOf(['San Francisco', 'New York', 'Austin', 'Seattle', 'Chicago', 'Boston']),
      state: randomOf(['CA', 'NY', 'TX', 'WA', 'IL', 'MA']),
      source: randomOf(sources),
      status: randomOf(statuses),
      score: randInt(0, 100),
      leadValue: randInt(100, 5000),
      lastActivityAt: lastAct,
      isQualified: Math.random() < 0.5,
      createdAt,
      updatedAt: createdAt,
      ownerId: user.id,
    };
  });

  // Delete existing leads for this user and insert fresh
  await prisma.lead.deleteMany({ where: { ownerId: user.id } });

  for (let i = 0; i < leadsData.length; i += 50) {
    await prisma.lead.createMany({ data: leadsData.slice(i, i + 50) });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
