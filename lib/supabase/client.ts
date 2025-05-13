import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Crea un cliente de Supabase para componentes del lado del cliente
export const createClient = () => createClientComponentClient<Database>()
