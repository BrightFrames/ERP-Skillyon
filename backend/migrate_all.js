import { execSync } from 'child_process';

const scripts = [
  'db/setup.js',
  'update_schema.js',
  'create_messages_schema.js',
  'create_settings_schema.js',
  'seed.js',
  'seed_parent.js',
  'setup_fees.js',
  'setup_grades.js',
  'db/add_student_passwords.js',
  'add_staff_passwords.js',
  'db/seed_demo_data.js'
];

for (const script of scripts) {
  console.log(`Running ${script}...`);
  try {
    execSync(`node ${script}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error running ${script}`);
    process.exit(1);
  }
}

console.log('All migrations and seeds completed successfully!');
