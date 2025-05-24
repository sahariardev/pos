import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      customer_id,
      total_amount,
      user_uid,
      status,
      created_at,
      discount,
      customer:customer_id (
        name
      ),
      order_items:order_items (
        id,
        product_id,
        product: product_id (
          name
        ),
        quantity,
        price
      )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
