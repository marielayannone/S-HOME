import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

// Crea un cliente de Supabase para componentes del lado del servidor
export const createClient = () => createServerComponentClient<Database>({ cookies })
