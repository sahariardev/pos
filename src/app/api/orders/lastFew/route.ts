import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {hasAllRole, ORDER_VIEW, PRODUCTS_VIEW} from "@/lib/accessUtil";

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !await hasAllRole(user.email, [ORDER_VIEW])) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
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
        name,
        id
      ),
      transaction:transactions(
        payment_method_id
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
