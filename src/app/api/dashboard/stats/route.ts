import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';
    
    // Calculate date range
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = startOfDay(subDays(new Date(), daysBack));
    const endDate = endOfDay(new Date());
    
    // Get previous period for comparison
    const prevStartDate = startOfDay(subDays(startDate, daysBack));
    const prevEndDate = endOfDay(subDays(endDate, daysBack));

    // Fetch current period data
    const { data: currentOrders, error: currentError } = await supabase
      .from('orders')
      .select('id, total, created_at, status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (currentError) {
      console.error('Supabase error (current):', currentError);
      throw currentError;
    }

    // Fetch previous period data for comparison
    const { data: prevOrders, error: prevError } = await supabase
      .from('orders')
      .select('id, total, created_at, status')
      .gte('created_at', prevStartDate.toISOString())
      .lte('created_at', prevEndDate.toISOString());

    if (prevError) {
      console.error('Supabase error (prev):', prevError);
      throw prevError;
    }

    // Calculate current period stats
    const completedOrders = (currentOrders || []).filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = completedOrders.length;

    // Calculate previous period stats
    const prevCompletedOrders = (prevOrders || []).filter(o => o.status === 'completed');
    const prevRevenue = prevCompletedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const prevOrdersCount = prevCompletedOrders.length;

    // Calculate changes
    const revenueChange = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;
    
    const ordersChange = prevOrdersCount > 0 
      ? ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100 
      : totalOrders > 0 ? 100 : 0;

    // Get products count
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: prevProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', prevEndDate.toISOString());

    const productsChange = (prevProducts || 0) > 0 
      ? (((totalProducts || 0) - (prevProducts || 0)) / (prevProducts || 0)) * 100 
      : (totalProducts || 0) > 0 ? 100 : 0;

    // Calculate conversion rate (placeholder - would need session tracking)
    const conversionRate = totalOrders > 0 ? (totalOrders / Math.max(totalOrders * 2, 100)) * 100 : 0;
    const prevConversionRate = prevOrdersCount > 0 ? (prevOrdersCount / Math.max(prevOrdersCount * 2, 100)) * 100 : 0;
    const conversionChange = prevConversionRate > 0 
      ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100 
      : conversionRate > 0 ? 100 : 0;

    // Generate revenue chart data
    const revenueData = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayOrders = completedOrders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });
      
      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      revenueData.push({
        date: format(date, daysBack <= 7 ? 'EEE' : daysBack <= 30 ? 'MMM d' : 'MMM d'),
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    // Get recent orders with product details
    const { data: recentOrdersData, error: recentError } = await supabase
      .from('orders')
      .select(`
        id,
        total,
        status,
        created_at,
        customer_email,
        product:products(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Supabase error (recent):', recentError);
      throw recentError;
    }

    const recentOrders = (recentOrdersData || []).map(order => ({
      id: order.id,
      customerEmail: order.customer_email || 'Unknown',
      productName: order.product?.name || 'Unknown Product',
      amount: order.total || 0,
      status: order.status,
      createdAt: order.created_at
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          revenueChange: Math.round(revenueChange * 10) / 10,
          totalOrders,
          ordersChange: Math.round(ordersChange * 10) / 10,
          totalProducts: totalProducts || 0,
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
