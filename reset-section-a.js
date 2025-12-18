/**
 * Reset Section A Workout Plan
 * This script deletes the existing Section A plan and forces recreation with 3 weeks
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function resetSectionA() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   Reset Section A to 3 Weeks Plan     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}⚠️  This will delete your current Section A plan and create a new one with 3 weeks.\n   Are you sure you want to continue? (yes/no): ${colors.reset}`, async (answer) => {
      if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
        console.log(`${colors.red}✖ Operation cancelled.${colors.reset}\n`);
        rl.close();
        resolve();
        return;
      }

      rl.question(`${colors.blue}Enter your authentication token: ${colors.reset}`, async (token) => {
        if (!token || token.trim() === '') {
          console.log(`${colors.red}✖ Token is required. Operation cancelled.${colors.reset}\n`);
          rl.close();
          resolve();
          return;
        }

        try {
          const baseUrl = 'http://localhost:3000';

          // Step 1: Delete existing Section A plan
          console.log(`\n${colors.blue}🗑️  Step 1: Deleting existing Section A plan...${colors.reset}`);
          
          const deleteResponse = await fetch(`${baseUrl}/api/workouts/plan/reset?type=CURRENT_WEEKS`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!deleteResponse.ok) {
            const error = await deleteResponse.json();
            console.log(`${colors.yellow}⚠️  ${error.message || 'No existing plan found'}${colors.reset}`);
          } else {
            const deleteResult = await deleteResponse.json();
            console.log(`${colors.green}✓ Deleted ${deleteResult.plansDeleted} plan(s)${colors.reset}`);
          }

          // Step 2: Wait a moment for database cleanup
          console.log(`${colors.blue}⏳ Waiting for cleanup...${colors.reset}`);
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Step 3: Fetch Section A plan (with forceRecreate flag)
          console.log(`${colors.blue}🔄 Step 2: Creating new Section A plan with 3 weeks...${colors.reset}`);
          
          const createResponse = await fetch(`${baseUrl}/api/workouts/plan?type=CURRENT_WEEKS&forceRecreate=true`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!createResponse.ok) {
            const error = await createResponse.json();
            throw new Error(error.error || 'Failed to create new plan');
          }

          const createResult = await createResponse.json();
          const plan = createResult.plan;

          if (plan && plan.weeks) {
            console.log(`\n${colors.green}✓ Successfully created new Section A plan!${colors.reset}`);
            console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
            console.log(`  Plan ID: ${colors.yellow}${plan.id}${colors.reset}`);
            console.log(`  Type: ${colors.yellow}${plan.type}${colors.reset}`);
            console.log(`  Weeks: ${colors.green}${plan.weeks.length}${colors.reset}`);
            console.log(`  Start Date: ${colors.yellow}${new Date(plan.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}${colors.reset}`);
            console.log(`  End Date: ${colors.yellow}${new Date(plan.endDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}${colors.reset}`);
            
            console.log(`\n${colors.cyan}  Week Details:${colors.reset}`);
            plan.weeks.forEach((week, index) => {
              console.log(`    Week ${week.weekNumber}: ${colors.green}${week.days.length} days${colors.reset}`);
            });
            
            const totalDays = plan.weeks.reduce((sum, week) => sum + week.days.length, 0);
            console.log(`\n  ${colors.green}Total Days: ${totalDays}${colors.reset}`);
            console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
            
            console.log(`${colors.green}✅ Section A is now ready with 3 weeks!${colors.reset}\n`);
          } else {
            console.log(`${colors.red}✖ Failed to create plan properly${colors.reset}\n`);
          }

        } catch (error) {
          console.error(`${colors.red}✖ Error: ${error.message}${colors.reset}\n`);
        }

        rl.close();
        resolve();
      });
    });
  });
}

// Run the script
resetSectionA().then(() => {
  console.log(`${colors.cyan}Script completed.${colors.reset}\n`);
  process.exit(0);
});

