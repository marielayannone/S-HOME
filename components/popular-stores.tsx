"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

type Store = {
  id: string
  name: string
  logo_url: string | null
  description: string | null
}

export function PopularStores() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStores() {
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("id, name, logo_url, description")
          .eq("is_verified", true)
          .limit(4)

        if (error) throw error

        setStores(data || [])
      } catch (error) {
        console.error("Error fetching stores:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [])

  // Placeholder stores for initial render
  const placeholderStores = Array(4)
    .fill(null)
    .map((_, i) => ({
      id: `placeholder-${i}`,
      name: "Tienda Popular",
      logo_url: null,
      description: "Descripción de la tienda con productos de alta calidad.",
    }))

  const displayStores = loading ? placeholderStores : stores.length ? stores : placeholderStores

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Tiendas populares</h2>
          <Link href="/stores" className="text-primary hover:underline">
            Ver todas
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStores.map((store) => (
            <Link href={`/stores/${store.id}`} key={store.id}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full overflow-hidden mr-4">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url || "/placeholder.svg"}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                          {store.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium">{store.name}</h3>
                  </div>
                  {store.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{store.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
