"use client"

import Link from "next/link"
import { useSupabase } from "./supabase-provider"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, ShoppingCart, Menu, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { supabase, session } = useSupabase()
  const [profile, setProfile] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(data)
      }
    }

    loadProfile()
  }, [session, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button className="md:hidden mr-4" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="text-2xl font-bold text-primary">
            MarketPlace
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/products" className="hover:text-primary">
            Productos
          </Link>
          <Link href="/stores" className="hover:text-primary">
            Tiendas
          </Link>
          <Link href="/categories" className="hover:text-primary">
            Categorías
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex relative rounded-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Perfil</Link>
                </DropdownMenuItem>
                {profile?.role === "seller" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/seller">Panel de vendedor</Link>
                  </DropdownMenuItem>
                )}
                {profile?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin">Panel de administrador</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/orders">Mis pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button>Iniciar sesión</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4">
          <div className="flex items-center mb-4 relative rounded-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <nav className="flex flex-col space-y-4">
            <Link href="/products" className="hover:text-primary">
              Productos
            </Link>
            <Link href="/stores" className="hover:text-primary">
              Tiendas
            </Link>
            <Link href="/categories" className="hover:text-primary">
              Categorías
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
