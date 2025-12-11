/**
 * Migration script to fix all NULL value issues using raw SQL
 * This fixes: workout_days.userId and user_settings columns
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  console.log('==================================');
  console.log('Fix NULL Values Migration Script');
  console.log('==================================\n');

  // Parse DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  
  if (!match) {
    console.error('❌ Could not parse DATABASE_URL');
    process.exit(1);
  }

  const [, user, password, host, port, database] = match;

  const connection = await mysql.createConnection({
    host,
    port: parseInt(port),
    user,
    password,
    database
  });

  try {
    console.log('✅ Connected to database\n');

    // Step 1: Fix workout_days userId
    console.log('📊 Step 1: Fixing workout_days.userId...');
    
    // Get count of NULL userId
    const [nullRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM workout_days WHERE userId IS NULL'
    );
    console.log(`   Found ${nullRows[0].count} rows with NULL userId`);

    if (nullRows[0].count > 0) {
      // Populate userId from workoutPlan
      const [result] = await connection.execute(`
        UPDATE workout_days wd
        INNER JOIN workout_weeks ww ON wd.workoutWeekId = ww.id
        INNER JOIN workout_plans wp ON ww.workoutPlanId = wp.id
        SET wd.userId = wp.userId
        WHERE wd.userId IS NULL
      `);
      console.log(`   ✅ Updated ${result.affectedRows} rows\n`);
    } else {
      console.log('   ✅ No NULL values found\n');
    }

    // Step 2: Fix user_settings columns
    console.log('📊 Step 2: Fixing user_settings NULL columns...');
    
    const settingsColumns = [
      'toolsSettings',
      'favouritesSettings',
      'myBestSettings',
      'adminSettings',
      'workoutPreferences',
      'socialSettings',
      'notificationSettings'
    ];

    for (const column of settingsColumns) {
      const [nullCount] = await connection.execute(
        `SELECT COUNT(*) as count FROM user_settings WHERE ${column} IS NULL`
      );
      
      if (nullCount[0].count > 0) {
        await connection.execute(
          `UPDATE user_settings SET ${column} = '{}' WHERE ${column} IS NULL`
        );
        console.log(`   ✅ Fixed ${nullCount[0].count} NULL values in ${column}`);
      }
    }
    console.log('   ✅ All user_settings columns fixed\n');

    // Step 3: Verify no NULLs remain
    console.log('🔍 Step 3: Verifying fixes...');
    
    const [remainingWorkoutDays] = await connection.execute(
      'SELECT COUNT(*) as count FROM workout_days WHERE userId IS NULL'
    );
    
    if (remainingWorkoutDays[0].count > 0) {
      console.error(`   ❌ Still have ${remainingWorkoutDays[0].count} NULL userId in workout_days`);
      process.exit(1);
    }
    
    console.log('   ✅ workout_days.userId: All populated');
    console.log('   ✅ user_settings: All columns populated\n');

    console.log('==================================');
    console.log('✅ Migration Completed Successfully!');
    console.log('==================================\n');
    console.log('You can now run: npx prisma db push --skip-generate\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
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

