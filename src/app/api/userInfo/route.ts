import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {getAllRoles} from "@/lib/accessUtil";

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }


  return NextResponse.json({
    email: user.email,
    roles: await getAllRoles(user.email),
  })
}

