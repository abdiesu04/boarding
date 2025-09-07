import { prisma } from '@/lib/db';
import { sendOnboardingEmail } from '@/lib/email';

export async function sendIncompleteOnboardingReminders() {
  const intervals = [
    24 * 60 * 60 * 1000,      // 24 hours
    3 * 24 * 60 * 60 * 1000,  // 3 days
    7 * 24 * 60 * 60 * 1000,  // 7 days
  ];

  const now = Date.now();

  for (const interval of intervals) {
    const lowerBound = new Date(now - interval - 60 * 1000);
    const upperBound = new Date(now - interval + 60 * 1000);

    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { creditReportCompleted: false },
          { documentsSigned: false },
        ],
        createdAt: {
          gte: lowerBound,
          lte: upperBound,
        },
      },
      include: { user: true },
    });

    for (const client of clients) {
      await sendOnboardingEmail(client.user.email, {
        name: client.user.firstName,
        nextStepUrl: '/credit-report',
      });
    }
  }
}
