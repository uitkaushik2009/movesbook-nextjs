/**
 * Simple migration script to add and populate userId in workout_days table
 * Uses Prisma's raw SQL queries for direct database manipulation
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMigration() {
  console.log('==================================');
  console.log('WorkoutDay userId Migration Script');
  console.log('==================================\n');

  try {
    // Step 1: Check if column exists
    console.log('📋 Step 1: Checking if userId column exists...');
    const columnCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'workout_days' 
        AND COLUMN_NAME = 'userId'
    `;
    
    const columnExists = columnCheck[0].count > 0;
    
    if (!columnExists) {
      console.log('   Adding userId column as nullable...');
      await prisma.$executeRaw`ALTER TABLE workout_days ADD COLUMN userId VARCHAR(191) NULL`;
      console.log('   ✓ userId column added');
      
      console.log('   Adding index on userId...');
      await prisma.$executeRaw`ALTER TABLE workout_days ADD INDEX idx_userId (userId)`;
      console.log('   ✓ Index created\n');
    } else {
      console.log('   ✓ userId column already exists\n');
    }

    // Step 2: Check data status
    console.log('📊 Step 2: Checking data status...');
    const totalCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM workout_days`;
    const nullCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM workout_days WHERE userId IS NULL`;
    
    console.log(`   Total workout_days records: ${totalCount[0].count}`);
    console.log(`   Records without userId: ${nullCount[0].count}\n`);

    // Step 3: Populate userId
    if (nullCount[0].count > 0) {
      console.log('🔄 Step 3: Populating userId values...');
      
      const daysWithoutUser = await prisma.workoutDay.findMany({
        where: { userId: null },
        include: {
          workoutWeek: {
            include: {
              workoutPlan: true
            }
          }
        }
      });

      console.log(`   Found ${daysWithoutUser.length} workout days without userId\n`);

      let updated = 0;
      let errors = 0;

      for (const day of daysWithoutUser) {
        try {
          const userId = day.workoutWeek?.workoutPlan?.userId;
          
          if (!userId) {
            console.log(`   ⚠️  Day ${day.id} has no parent user (orphaned record)`);
            errors++;
            continue;
          }

          await prisma.workoutDay.update({
            where: { id: day.id },
            data: { userId }
          });

          updated++;
          if (updated % 10 === 0) {
            console.log(`   ✓ Updated ${updated}/${daysWithoutUser.length} days...`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to update day ${day.id}:`, error.message);
          errors++;
        }
      }

      console.log(`\n   ✅ Population complete!`);
      console.log(`      - Updated: ${updated} days`);
      console.log(`      - Errors: ${errors} days\n`);
    } else {
      console.log('✓ All records already have userId populated\n');
    }

    // Step 4: Verify data integrity
    console.log('🔍 Step 4: Verifying data integrity...');
    const remainingNulls = await prisma.$queryRaw`SELECT COUNT(*) as count FROM workout_days WHERE userId IS NULL`;
    
    if (remainingNulls[0].count > 0) {
      console.error(`   ❌ Error: Still have ${remainingNulls[0].count} records without userId`);
      console.error('   Please check for orphaned records and fix manually');
      process.exit(1);
    }
    console.log('   ✓ All records have userId populated\n');

    // Step 5: Check if column is nullable
    console.log('📝 Step 5: Making userId column required (NOT NULL)...');
    const isNullableCheck = await prisma.$queryRaw`
      SELECT IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'workout_days' 
        AND COLUMN_NAME = 'userId'
    `;
    
    if (isNullableCheck[0].IS_NULLABLE === 'YES') {
      await prisma.$executeRaw`ALTER TABLE workout_days MODIFY COLUMN userId VARCHAR(191) NOT NULL`;
      console.log('   ✓ userId column is now NOT NULL\n');
    } else {
      console.log('   ✓ userId column is already NOT NULL\n');
    }

    // Step 6: Add foreign key constraint
    console.log('🔗 Step 6: Adding foreign key constraint...');
    const fkCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
      WHERE CONSTRAINT_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'workout_days' 
        AND CONSTRAINT_NAME = 'workout_days_userId_fkey' 
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `;

    if (fkCheck[0].count === 0) {
      await prisma.$executeRaw`
        ALTER TABLE workout_days 
        ADD CONSTRAINT workout_days_userId_fkey 
        FOREIGN KEY (userId) REFERENCES users_new(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log('   ✓ Foreign key constraint added\n');
    } else {
      console.log('   ✓ Foreign key constraint already exists\n');
    }

    // Step 7: Add unique constraint
    console.log('🔒 Step 7: Checking unique constraint...');
    const uniqueCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
      WHERE CONSTRAINT_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'workout_days' 
        AND CONSTRAINT_NAME = 'workout_days_userId_date_key' 
        AND CONSTRAINT_TYPE = 'UNIQUE'
    `;

    if (uniqueCheck[0].count === 0) {
      console.log('   Checking for duplicate (userId, date) combinations...');
      const duplicates = await prisma.$queryRaw`
        SELECT userId, date, COUNT(*) as cnt 
        FROM workout_days 
        WHERE userId IS NOT NULL 
        GROUP BY userId, date 
        HAVING cnt > 1
      `;

      if (duplicates.length > 0) {
        console.log(`   ⚠️  Found ${duplicates.length} duplicate (userId, date) combinations`);
        console.log('   Please resolve duplicates before adding unique constraint');
        console.log('   Skipping unique constraint creation\n');
      } else {
        await prisma.$executeRaw`
          ALTER TABLE workout_days 
          ADD CONSTRAINT workout_days_userId_date_key 
          UNIQUE (userId, date)
        `;
        console.log('   ✓ Unique constraint added\n');
      }
    } else {
      console.log('   ✓ Unique constraint already exists\n');
    }

    console.log('==================================');
    console.log('✅ Migration Completed Successfully!');
    console.log('==================================\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('🏁 Migration script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });

