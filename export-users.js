const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function exportUsers() {
  console.log('📦 Exporting users from local database...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        name: true,
        firstName: true,
        surname: true,
        gender: true,
        birthdate: true,
        country: true,
        userType: true,
        securityQuestion: true,
        securityAnswer: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Found ${users.length} users to export\n`);

    // Create SQL INSERT statements
    const sqlStatements = [];
    
    users.forEach((user, index) => {
      const values = [
        `'${user.id.replace(/'/g, "''")}'`,
        `'${user.username.replace(/'/g, "''")}'`,
        `'${user.email.replace(/'/g, "''")}'`,
        `'${user.password.replace(/'/g, "''")}'`,
        `'${user.name.replace(/'/g, "''")}'`,
        user.firstName ? `'${user.firstName.replace(/'/g, "''")}'` : 'NULL',
        user.surname ? `'${user.surname.replace(/'/g, "''")}'` : 'NULL',
        user.gender ? `'${user.gender.replace(/'/g, "''")}'` : 'NULL',
        user.birthdate ? `'${user.birthdate.toISOString().split('T')[0]}'` : 'NULL',
        user.country ? `'${user.country.replace(/'/g, "''")}'` : 'NULL',
        `'${user.userType}'`,
        user.securityQuestion ? `'${user.securityQuestion.replace(/'/g, "''")}'` : 'NULL',
        user.securityAnswer ? `'${user.securityAnswer.replace(/'/g, "''")}'` : 'NULL',
        `'${user.createdAt.toISOString().replace('T', ' ').split('.')[0]}'`,
        `'${user.updatedAt.toISOString().replace('T', ' ').split('.')[0]}'`
      ];

      const sql = `INSERT INTO users_new (id, username, email, password, name, firstName, surname, gender, birthdate, country, userType, securityQuestion, securityAnswer, createdAt, updatedAt) VALUES (${values.join(', ')}) ON DUPLICATE KEY UPDATE password=VALUES(password), name=VALUES(name), email=VALUES(email);`;
      
      sqlStatements.push(sql);

      if ((index + 1) % 100 === 0) {
        console.log(`  Processed ${index + 1} users...`);
      }
    });

    // Write to file
    const sqlContent = sqlStatements.join('\n');
    fs.writeFileSync('users-export.sql', sqlContent);

    console.log(`\n✅ Exported ${users.length} users to users-export.sql`);
    console.log(`   File size: ${(fs.statSync('users-export.sql').size / 1024).toFixed(2)} KB`);
    console.log('\n📤 Next steps:');
    console.log('   1. Copy file to server:');
    console.log('      scp -i "D:\\GoingOn\\Longterm\\private.pem" users-export.sql developer@217.154.202.41:~/movesbook-nextjs/');
    console.log('   2. On server, import:');
    console.log('      mysql -u movesbook_user -p\'SecurePassword2024!\' movesbook_nextjs < users-export.sql');
    console.log('   3. Verify:');
    console.log('      node check-database.js');
    console.log('   4. Restart:');
    console.log('      pm2 restart movesbook');

  } catch (error) {
    console.error('❌ Export error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportUsers()
  .then(() => {
    console.log('\n🎉 Export complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

