import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {hasAllRole, hasAnyRole, PRODUCTS_CREATE, TRANSACTION_CREATE, TRANSACTION_VIEW} from "@/lib/accessUtil";

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !await hasAllRole(user.email, [TRANSACTION_VIEW])) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const {data, error} = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', {ascending: false});

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !await hasAllRole(user.email, [TRANSACTION_CREATE])) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const newTransaction = await request.json();

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      { ...newTransaction, user_uid: user.id }
    ])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}
