/**
 * Script to find and remove duplicate workout_days records
 * Keeps the most recent record for each (userId, date) combination
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDuplicates() {
  console.log('==================================');
  console.log('Fix Duplicate WorkoutDays Script');
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

    // Step 1: Find duplicates
    console.log('🔍 Step 1: Finding duplicate (userId, date) combinations...');
    
    const [duplicates] = await connection.execute(`
      SELECT userId, date, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM workout_days 
      GROUP BY userId, date 
      HAVING count > 1
    `);

    console.log(`   Found ${duplicates.length} duplicate combinations\n`);

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found! You can proceed with prisma db push\n');
      return;
    }

    // Step 2: Remove duplicates (keep the most recent one)
    console.log('🗑️  Step 2: Removing duplicate records (keeping most recent)...');
    
    let totalRemoved = 0;

    for (const dup of duplicates) {
      const ids = dup.ids.split(',');
      console.log(`   Processing userId: ${dup.userId}, date: ${dup.date} (${ids.length} records)`);

      // Get all records for this combination with their createdAt
      const [records] = await connection.execute(
        `SELECT id, createdAt FROM workout_days WHERE userId = ? AND date = ? ORDER BY createdAt DESC`,
        [dup.userId, dup.date]
      );

      // Keep the first one (most recent), delete the rest
      const idsToDelete = records.slice(1).map(r => r.id);
      
      if (idsToDelete.length > 0) {
        const placeholders = idsToDelete.map(() => '?').join(',');
        const [result] = await connection.execute(
          `DELETE FROM workout_days WHERE id IN (${placeholders})`,
          idsToDelete
        );
        totalRemoved += result.affectedRows;
        console.log(`      Kept: ${records[0].id}, Deleted: ${idsToDelete.length} duplicate(s)`);
      }
    }

    console.log(`\n   ✅ Removed ${totalRemoved} duplicate records\n`);

    // Step 3: Verify no duplicates remain
    console.log('🔍 Step 3: Verifying no duplicates remain...');
    
    const [remaining] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM (
        SELECT userId, date, COUNT(*) as cnt
        FROM workout_days 
        GROUP BY userId, date 
        HAVING cnt > 1
      ) as dups
    `);

    if (remaining[0].count > 0) {
      console.error(`   ❌ Still have ${remaining[0].count} duplicate combinations`);
      process.exit(1);
    }

    console.log('   ✅ All duplicates removed!\n');

    console.log('==================================');
    console.log('✅ Cleanup Completed Successfully!');
    console.log('==================================\n');
    console.log('You can now run: npx prisma db push --skip-generate\n');

  } catch (error) {
    console.error('❌ Script failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
fixDuplicates()
  .then(() => {
    console.log('🏁 Script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

