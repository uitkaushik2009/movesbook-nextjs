import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TRANSLATIONS = {
  // Common UI
  'add_workout': 'Add Workout',
  'edit_moveframe': 'Edit Moveframe',
  'delete_microlap': 'Delete Microlap',
  'save_changes': 'Save Changes',
  'cancel': 'Cancel',
  'confirm': 'Confirm',
  'loading': 'Loading...',
  
  // Navigation
  'home': 'Home',
  'my_page': 'My Page',
  'my_club': 'My Club',
  'workouts': 'Workouts',
  'analytics': 'Analytics',
  'settings': 'Settings',
  
  // Workout specific
  'workout_planned': 'Workout Planned',
  'workout_completed': 'Workout Completed',
  'add_moveframe': 'Add Moveframe',
  'moveframe_details': 'Moveframe Details',
  'movelaps': 'Movelaps',
  'microlaps': 'Microlaps',
  
  // Settings
  'backgrounds_colors': 'Backgrounds & Colors',
  'tools_settings': 'Tools Settings',
  'favourites': 'Favourites',
  'my_best': 'My Best',
  'languages': 'Languages',
  'grid_display': 'Grid & Display',
  'select_language': 'Select Language',
  'search_variables': 'Search variables...',
  'buttons_short_texts': 'Buttons & Short Texts',
  'long_texts_phrases': 'Long Texts & Phrases',
};

async function main() {
  console.log('Seeding languages...');

  // Delete existing data to avoid conflicts
  await prisma.languageShortText.deleteMany({});
  await prisma.languageLongText.deleteMany({});
  await prisma.language.deleteMany({});

  // Create English language
  const english = await prisma.language.create({
    data: {
      code: 'en',
      name: 'English',
      shortTexts: {
        create: Object.entries(DEFAULT_TRANSLATIONS).map(([key, value]) => ({
          key,
          value: value as string
        }))
      }
    },
    include: {
      shortTexts: true
    }
  });

  // Create Swedish language (empty translations)
  const swedish = await prisma.language.create({
    data: {
      code: 'sv',
      name: 'Swedish',
      shortTexts: {
        create: Object.keys(DEFAULT_TRANSLATIONS).map((key) => ({
          key,
          value: '' // Empty for translation
        }))
      }
    },
    include: {
      shortTexts: true
    }
  });

  console.log('Languages seeded successfully!');
  console.log(`- English: ${english.shortTexts.length} translations`);
  console.log(`- Swedish: ${swedish.shortTexts.length} variables ready for translation`);
}

main()
  .catch((e) => {
    console.error('Error seeding languages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });