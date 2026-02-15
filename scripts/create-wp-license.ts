import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createWordPressLicense() {
  try {
    // Find or create test user
    let user = await prisma.user.findUnique({
      where: { email: 'srewl364@gmail.com' },
    });

    if (!user) {
      console.error('❌ Super admin user not found!');
      process.exit(1);
    }

    console.log('✅ Found user:', user.email, '| Tier:', user.tier);

    // Generate license key
    const key = `EMBP-WP26-TEST-${crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 4)}`;

    // Create or find test product
    let product = await prisma.product.findFirst({
      where: {
        userId: user.id,
        name: 'WordPress Test Product',
      },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          userId: user.id,
          name: 'WordPress Test Product',
          description: 'Test product for WordPress plugin license activation',
          price: 2900,
          currency: 'usd',
          type: 'one_time',
          deliveryType: 'license',
          active: true,
        },
      });
      console.log('✅ Created test product:', product.id);
    } else {
      console.log('✅ Using existing test product:', product.id);
    }

    // Create test order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        amount: 2900,
        currency: 'usd',
        status: 'completed',
        customerEmail: 'test@wordpress.local',
      },
    });
    console.log('✅ Created test order:', order.id);

    // Create license
    const license = await prisma.licenseKey.create({
      data: {
        key,
        productId: product.id,
        orderId: order.id,
        userId: user.id,
        customerEmail: 'test@wordpress.local',
        status: 'active',
        maxActivations: 999,
        currentActivations: 0,
      },
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 WordPress License Created!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 License Key:', license.key);
    console.log('👤 Customer:', license.customerEmail);
    console.log('📦 Product:', product.name);
    console.log('🎫 User Tier:', user.tier);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 Use this key in WordPress:');
    console.log('   https://arena.course.cheap/wp-admin/admin.php?page=embpay-settings\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWordPressLicense();
