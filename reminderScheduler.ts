import cron from 'node-cron';
import { sendIncompleteOnboardingReminders } from './scripts/sendIncompleteOnboardingReminders';


cron.schedule('*/2 * * * *', async () => {
  console.log('Running onboarding reminder check...');
  try {
    await sendIncompleteOnboardingReminders();
    console.log('Reminder check complete.');
  } catch (err) {
    console.error('Error running reminder script:', err);
  }
});

console.log('Onboarding reminder scheduler started.');
