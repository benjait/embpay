import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setUserPlan() {
  try {
    const user = await prisma.user.update({
      where: { email: 'srewl364@gmail.com' },
      data: { plan: 'pro' },
    });
    
    console.log('✅ Updated user plan:', user.email, '→', user.plan);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setUserPlan();
