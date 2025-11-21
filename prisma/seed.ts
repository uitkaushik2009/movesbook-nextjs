import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  try {
    // Clear existing data first
    console.log('Clearing existing data...');
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create sample users with unique usernames
    console.log('Creating users...');
    
    const athlete = await prisma.user.create({
      data: {
        email: 'athlete@example.com',
        username: 'john_athlete_' + Date.now(), // Unique username
        password: hashedPassword,
        name: 'John Athlete',
        userType: UserType.ATHLETE,
      },
    });

    const coach = await prisma.user.create({
      data: {
        email: 'coach@example.com',
        username: 'sarah_coach_' + Date.now(), // Unique username
        password: hashedPassword,
        name: 'Sarah Coach',
        userType: UserType.COACH,
      },
    });

    const teamManager = await prisma.user.create({
      data: {
        email: 'team@example.com',
        username: 'mike_team_' + Date.now(), // Unique username
        password: hashedPassword,
        name: 'Mike Team Manager',
        userType: UserType.TEAM_MANAGER,
      },
    });

    const clubTrainer = await prisma.user.create({
      data: {
        email: 'club@example.com',
        username: 'anna_club_' + Date.now(), // Unique username
        password: hashedPassword,
        name: 'Anna Club Trainer',
        userType: UserType.CLUB_TRAINER,
      },
    });

    // Create user settings
    console.log('Creating user settings...');
    await prisma.userSettings.createMany({
      data: [
        {
          userId: athlete.id,
<<<<<<< HEAD
          colorSettings: JSON.stringify({
=======
          colorSettings: {
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
            pageBackground: '#ffffff',
            dayHeader: '#f3f4f6',
            moveframeHeader: '#e5e7eb',
            movelapHeader: '#d1d5db',
            microlapBackground: '#f9fafb',
            selectedRow: '#3b82f6',
            buttonAdd: '#10b981',
            buttonEdit: '#f59e0b',
            buttonDelete: '#ef4444',
            buttonPrint: '#6b7280',
            alternateRow: '#f8fafc'
<<<<<<< HEAD
          })
        },
        {
          userId: coach.id,
          colorSettings: JSON.stringify({
=======
          },
          mainSports: JSON.stringify(['SWIM', 'RUN', 'BIKE'])
        },
        {
          userId: coach.id,
          colorSettings: {
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
            pageBackground: '#ffffff',
            dayHeader: '#f3f4f6',
            moveframeHeader: '#e5e7eb',
            movelapHeader: '#d1d5db',
            microlapBackground: '#f9fafb',
            selectedRow: '#3b82f6',
            buttonAdd: '#10b981',
            buttonEdit: '#f59e0b',
            buttonDelete: '#ef4444',
            buttonPrint: '#6b7280',
            alternateRow: '#f8fafc'
<<<<<<< HEAD
          })
=======
          },
          mainSports: JSON.stringify(['SWIM', 'RUN', 'BIKE'])
>>>>>>> 21d778b56ceb678af8ea9a9eb545faff336aa642
        }
      ]
    });

    console.log('✅ Database seeded successfully!');
    console.log('📧 Sample users created:');
    console.log(`- Athlete: username=${athlete.username}, email=athlete@example.com, password=password123`);
    console.log(`- Coach: username=${coach.username}, email=coach@example.com, password=password123`);
    console.log(`- Team Manager: username=${teamManager.username}, email=team@example.com, password=password123`);
    console.log(`- Club Trainer: username=${clubTrainer.username}, email=club@example.com, password=password123`);

  } catch (error: any) {
    console.error('❌ Seeding error:', error);
    if (error.code === 'P2002') {
      console.error('Duplicate entry found. Try running the reset script first.');
    }
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });