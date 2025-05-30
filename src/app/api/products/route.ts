
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  hasAllRole,
  hasAnyRole, ORDER_CREATE,
  ORDER_EDIT,
  ORDER_VIEW,
  PRODUCTS_CREATE,
  PRODUCTS_EDIT,
  PRODUCTS_VIEW
} from "@/lib/accessUtil";

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  console.log(user);

  if (!user || !await hasAnyRole(user.email, [ORDER_VIEW, PRODUCTS_VIEW, PRODUCTS_EDIT, ORDER_EDIT, ORDER_CREATE, PRODUCTS_CREATE])) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !await hasAllRole(user.email, [PRODUCTS_CREATE])) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const newProduct = await request.json();

  const { data, error } = await supabase
    .from('products')
    .insert([
      { ...newProduct, user_uid: user.id }
    ])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}
