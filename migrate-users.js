/**
 * User Migration Script
 * Migrates users from movesbook.net (MySQL) to movesbook.com (SQLite with Prisma)
 * 
 * This script:
 * 1. Reads users from moves.sql
 * 2. Maps them to the new Prisma schema
 * 3. Preserves SHA1 passwords for backward compatibility
 * 4. Creates necessary related records (settings, periods, sections)
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const readline = require('readline');

const prisma = new PrismaClient();

// User type mapping from old system to new
const USER_TYPE_MAP = {
  5: 'ATHLETE',      // Regular user/athlete
  6: 'COACH',        // Coach
  8: 'TEAM_MANAGER', // Team/Club
  7: 'ATHLETE',      // Alternative athlete
  1: 'ATHLETE',      // Admin (map to athlete for now)
  2: 'COACH',        // Alternative coach
};

// Parse SQL INSERT statement
function parseInsertStatement(line) {
  if (!line.includes('INSERT INTO `users`')) {
    return null;
  }
  
  // Extract values between parentheses
  const valuesMatch = line.match(/VALUES\s*\((.*?)\)(?:,\s*\(|;)/);
  if (!valuesMatch) return null;
  
  return valuesMatch[1];
}

// Parse a single user record from SQL
function parseUserRecord(valuesString) {
  try {
    // Split by comma but respect quoted strings
    const values = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < valuesString.length; i++) {
      const char = valuesString[i];
      
      if ((char === '"' || char === "'") && (i === 0 || valuesString[i-1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        }
      }
      
      if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // Clean up values
    const cleanValue = (val) => {
      val = val.trim();
      if (val === 'NULL' || val === 'null') return null;
      if (val.startsWith("'") || val.startsWith('"')) {
        return val.slice(1, -1);
      }
      return val;
    };
    
    // Map to user object (based on the users table structure)
    // id, role_id, race_id, username, password, ...
    const user = {
      id: parseInt(cleanValue(values[0])),
      role_id: parseInt(cleanValue(values[1])),
      username: cleanValue(values[3]),
      password: cleanValue(values[4]),
      firstname: cleanValue(values[13]),
      lastname: cleanValue(values[14]),
      email: cleanValue(values[15]),
      userType: USER_TYPE_MAP[parseInt(cleanValue(values[1]))] || 'ATHLETE',
    };
    
    return user;
  } catch (error) {
    console.error('Error parsing user record:', error);
    return null;
  }
}

// Default settings for migrated users
const createDefaultSettings = async (userId) => {
  return await prisma.userSettings.create({
    data: {
      userId: userId,
      colorSettings: JSON.stringify({
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
      }),
      language: 'en'
    }
  });
};

// Default periods for migrated users
const createDefaultPeriods = async (userId) => {
  const defaultPeriods = [
    { name: 'Preparation', description: 'Initial training phase', color: '#3b82f6' },
    { name: 'Competition', description: 'Main competition phase', color: '#ef4444' },
    { name: 'Recovery', description: 'Active recovery phase', color: '#10b981' }
  ];
  
  for (const period of defaultPeriods) {
    await prisma.period.create({
      data: {
        userId: userId,
        name: period.name,
        description: period.description,
        color: period.color
      }
    });
  }
};

// Default workout sections for migrated users
const createDefaultSections = async (userId) => {
  const defaultSections = [
    { name: 'Warm-up', description: 'Pre-workout activation', color: '#f59e0b' },
    { name: 'Main Set', description: 'Primary workout component', color: '#ef4444' },
    { name: 'Cool-down', description: 'Post-workout recovery', color: '#10b981' }
  ];
  
  for (const section of defaultSections) {
    await prisma.workoutSection.create({
      data: {
        userId: userId,
        name: section.name,
        description: section.description,
        color: section.color
      }
    });
  }
};

// Main migration function
async function migrateUsers() {
  console.log('Starting user migration from movesbook.net to movesbook.com...\n');
  
  const fileStream = fs.createReadStream('moves.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let userCount = 0;
  let successCount = 0;
  let errorCount = 0;
  let currentInsert = '';
  let inUserInsert = false;
  
  for await (const line of rl) {
    // Check if we're starting a users INSERT statement
    if (line.includes('INSERT INTO `users`')) {
      inUserInsert = true;
      currentInsert = line;
      continue;
    }
    
    // If we're in a multi-line INSERT, accumulate lines
    if (inUserInsert) {
      currentInsert += ' ' + line;
      
      // Check if this line ends the INSERT statement
      if (line.trim().endsWith(';')) {
        inUserInsert = false;
        
        // Parse and migrate users from this INSERT statement
        const matches = currentInsert.match(/\(([^)]+(?:\([^)]+\))?[^)]*)\)(?=,|\);)/g);
        
        if (matches) {
          for (const match of matches) {
            const valuesString = match.slice(1, -1); // Remove outer parentheses
            const user = parseUserRecord(valuesString);
            
            if (user && user.email && user.password) {
              userCount++;
              
              try {
                // Check if user already exists
                const existingUser = await prisma.user.findUnique({
                  where: { email: user.email }
                });
                
                if (existingUser) {
                  console.log(`⚠️  Skipping ${user.email} - already exists`);
                  continue;
                }
                
                // Create user
                const newUser = await prisma.user.create({
                  data: {
                    email: user.email,
                    username: user.username,
                    password: user.password, // Keep SHA1 password as-is
                    name: `${user.firstname} ${user.lastname}`.trim(),
                    userType: user.userType
                  }
                });
                
                // Create related records
                await createDefaultSettings(newUser.id);
                await createDefaultPeriods(newUser.id);
                await createDefaultSections(newUser.id);
                
                successCount++;
                console.log(`✓ Migrated user ${successCount}: ${newUser.email} (${newUser.userType})`);
                
              } catch (error) {
                errorCount++;
                console.error(`✗ Error migrating ${user.email}:`, error.message);
              }
            }
          }
        }
        
        currentInsert = '';
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Migration Summary:');
  console.log('='.repeat(60));
  console.log(`Total users found: ${userCount}`);
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('='.repeat(60));
  console.log('\n✓ Migration complete!');
  console.log('\nNote: All migrated users retain their SHA1 passwords.');
  console.log('They will be automatically upgraded to bcrypt on first login.');
}

// Run migration
migrateUsers()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

