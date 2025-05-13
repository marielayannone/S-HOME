"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AuthButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSignIn = async () => {
    setLoading(true)
    router.push("/login")
    setLoading(false)
  }

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.refresh()
    setLoading(false)
  }

  return (
    <Button onClick={handleSignIn} disabled={loading}>
      {loading ? "Cargando..." : "Iniciar sesión"}
    </Button>
  )
}
