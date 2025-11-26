import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LANGUAGES = [
  { code: 'en', name: 'English', isActive: true },
  { code: 'fr', name: 'French', isActive: true },
  { code: 'de', name: 'German', isActive: true },
  { code: 'it', name: 'Italian', isActive: true },
  { code: 'es', name: 'Spanish', isActive: true },
  { code: 'pt', name: 'Portuguese', isActive: true },
  { code: 'ru', name: 'Russian', isActive: true },
  { code: 'hi', name: 'Hindi', isActive: true },
  { code: 'zh', name: 'Chinese', isActive: true },
  { code: 'ar', name: 'Arabic', isActive: true },
];

async function main() {
  console.log('Seeding all 10 languages...');

  // Create or update each language
  for (const lang of LANGUAGES) {
    const language = await prisma.language.upsert({
      where: { code: lang.code },
      update: {
        name: lang.name,
        isActive: lang.isActive,
      },
      create: {
        code: lang.code,
        name: lang.name,
        isActive: lang.isActive,
      },
    });

    console.log(`✅ ${language.name} (${language.code}) - ${language.isActive ? 'Active' : 'Inactive'}`);
  }

  console.log('\n✅ All 10 languages seeded successfully!');
  
  // Count translations
  const translationCount = await prisma.translation.count();
  console.log(`\n📊 Current translations in database: ${translationCount}`);
}

main()
  .catch((e) => {
    console.error('Error seeding languages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

