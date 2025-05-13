"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

type Product = {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  store: {
    name: string
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    async function fetchProducts() {
      try {
        let query = supabase
          .from("products")
          .select(`
            id,
            name,
            price,
            images,
            category,
            store:store_id(name)
          `)
          .eq("is_active", true)

        if (category) {
          query = query.eq("category", category)
        }

        if (searchQuery) {
          query = query.ilike("name", `%${searchQuery}%`)
        }

        if (sortBy === "price_asc") {
          query = query.order("price", { ascending: true })
        } else if (sortBy === "price_desc") {
          query = query.order("price", { ascending: false })
        } else {
          // Default to newest
          query = query.order("created_at", { ascending: false })
        }

        const { data, error } = await query

        if (error) throw error

        setProducts(data || [])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchQuery, category, sortBy])

  // Placeholder products for initial render
  const placeholderProducts = Array(12)
    .fill(null)
    .map((_, i) => ({
      id: `placeholder-${i}`,
      name: "Producto",
      price: 1999,
      images: ["/placeholder.svg?height=300&width=300"],
      category: "Categoría",
      store: { name: "Tienda" },
    }))

  const displayProducts = loading ? placeholderProducts : products.length ? products : placeholderProducts

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The search is already handled by the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Todos los productos</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-3">
          <form onSubmit={handleSearch} className="flex w-full max-w-full items-center space-x-2">
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>
        </div>

        <div className="flex space-x-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="electronics">Electrónica</SelectItem>
              <SelectItem value="clothing">Ropa</SelectItem>
              <SelectItem value="home">Hogar</SelectItem>
              <SelectItem value="beauty">Belleza</SelectItem>
              <SelectItem value="sports">Deportes</SelectItem>
              <SelectItem value="books">Libros</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No se encontraron productos</h2>
          <p className="text-muted-foreground">Intenta con otra búsqueda o categoría</p>
        </div>
      )}

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
                <div className="mt-1">
                  <span className="inline-block bg-muted text-xs px-2 py-1 rounded">{product.category}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <p className="font-semibold">{formatPrice(product.price)}</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
