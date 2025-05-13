"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

type Product = {
  id: string
  name: string
  price: number
  images: string[]
  store: {
    name: string
  }
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            price,
            images,
            store:store_id(name)
          `)
          .eq("is_featured", true)
          .eq("is_active", true)
          .limit(8)

        if (error) throw error

        setProducts(data || [])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Placeholder products for initial render
  const placeholderProducts = Array(8)
    .fill(null)
    .map((_, i) => ({
      id: `placeholder-${i}`,
      name: "Producto destacado",
      price: 1999,
      images: ["/placeholder.svg?height=300&width=300"],
      store: { name: "Tienda" },
    }))

  const displayProducts = loading ? placeholderProducts : products.length ? products : placeholderProducts

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Productos destacados</h2>
          <Link href="/products" className="text-primary hover:underline">
            Ver todos
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.store.name}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <p className="font-semibold">{formatPrice(product.price)}</p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
