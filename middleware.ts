import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Crea un cliente de Supabase para el middleware
  const supabase = createMiddlewareClient({ req, res })

  // Refresca la sesión si está expirada
  await supabase.auth.getSession()

  return res
}
