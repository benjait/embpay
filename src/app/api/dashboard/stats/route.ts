import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';
    
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = startOfDay(subDays(new Date(), daysBack));
    const endDate = endOfDay(new Date());
    
    const prevStartDate = startOfDay(subDays(startDate, daysBack));
    const prevEndDate = endOfDay(subDays(endDate, daysBack));

    // Current period orders
    const currentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    // Previous period orders
    const prevOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
      select: {
        id: true,
        amount: true,
        status: true,
      },
    });

    const completedOrders = currentOrders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalOrders = completedOrders.length;

    const prevCompletedOrders = prevOrders.filter(o => o.status === 'completed');
    const prevRevenue = prevCompletedOrders.reduce((sum, o) => sum + o.amount, 0);
    const prevOrdersCount = prevCompletedOrders.length;

    const revenueChange = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;
    
    const ordersChange = prevOrdersCount > 0 
      ? ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100 
      : totalOrders > 0 ? 100 : 0;

    const totalProducts = await prisma.product.count();
    const prevProducts = await prisma.product.count({
      where: {
        createdAt: {
          lte: prevEndDate,
        },
      },
    });

    const productsChange = prevProducts > 0 
      ? ((totalProducts - prevProducts) / prevProducts) * 100 
      : totalProducts > 0 ? 100 : 0;

    const conversionRate = totalOrders > 0 ? (totalOrders / Math.max(totalOrders * 2, 100)) * 100 : 0;
    const prevConversionRate = prevOrdersCount > 0 ? (prevOrdersCount / Math.max(prevOrdersCount * 2, 100)) * 100 : 0;
    const conversionChange = prevConversionRate > 0 
      ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100 
      : conversionRate > 0 ? 100 : 0;

    // Revenue chart data
    const revenueData = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayOrders = completedOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });
      
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.amount, 0);
      
      revenueData.push({
        date: format(date, daysBack <= 7 ? 'EEE' : daysBack <= 30 ? 'MMM d' : 'MMM d'),
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    // Recent orders
    const recentOrdersData = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        customerEmail: true,
        customerName: true,
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    const recentOrders = recentOrdersData.map(order => ({
      id: order.id,
      customerEmail: order.customerEmail || 'Unknown',
      productName: order.product?.name || 'Unknown Product',
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          revenueChange: Math.round(revenueChange * 10) / 10,
          totalOrders,
          ordersChange: Math.round(ordersChange * 10) / 10,
          totalProducts,
          productsChange: Math.round(productsChange * 10) / 10,
          conversionRate,
          conversionChange: Math.round(conversionChange * 10) / 10
        },
        revenueData,
        recentOrders
      }
    });

  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
