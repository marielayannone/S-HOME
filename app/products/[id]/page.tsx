"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, ShoppingCart, Star } from "lucide-react"
import Link from "next/link"

type Product = {
  id: string
  name: string
  description: string
  price: number
  original_price: number | null
  images: string[]
  stock: number
  category: string
  store: {
    id: string
    name: string
  }
}

type Review = {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles: {
    full_name: string
  }
}

export default function ProductPage() {
  const params = useParams()
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            description,
            price,
            original_price,
            images,
            stock,
            category,
            store:store_id(id, name)
          `)
          .eq("id", params.id)
          .single()

        if (error) throw error

        setProduct(data)

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select(`
            id,
            rating,
            comment,
            created_at,
            profiles(full_name)
          `)
          .eq("product_id", params.id)
          .order("created_at", { ascending: false })

        if (reviewsError) throw reviewsError

        setReviews(reviewsData || [])

        // Calculate average rating
        if (reviewsData && reviewsData.length > 0) {
          const total = reviewsData.reduce((sum, review) => sum + review.rating, 0)
          setAverageRating(total / reviewsData.length)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, supabase])

  const handleAddToCart = async () => {
    if (!session) {
      toast({
        title: "Inicia sesión primero",
        description: "Debes iniciar sesión para añadir productos al carrito",
        variant: "destructive",
      })
      return
    }

    if (!product) return

    try {
      // Check if cart exists
      const { data: existingCart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle()

      let cartId

      if (!existingCart) {
        // Create cart if it doesn't exist
        const { data: newCart, error: createError } = await supabase
          .from("carts")
          .insert({ user_id: session.user.id })
          .select("id")
          .single()

        if (createError) throw createError
        cartId = newCart.id
      } else {
        cartId = existingCart.id
      }

      // Check if item already exists in cart
      const { data: existingItem, error: itemError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", product.id)
        .maybeSingle()

      if (existingItem) {
        // Update quantity if item exists
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id)

        if (updateError) throw updateError
      } else {
        // Add new item to cart
        const { error: insertError } = await supabase.from("cart_items").insert({
          cart_id: cartId,
          product_id: product.id,
          quantity,
          price: product.price,
        })

        if (insertError) throw insertError
      }

      toast({
        title: "Producto añadido",
        description: `${product.name} se ha añadido a tu carrito`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el producto al carrito",
        variant: "destructive",
      })
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-muted h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-10 bg-muted rounded w-1/3 mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Producto no encontrado</h1>
        <p className="text-muted-foreground mb-8">El producto que buscas no existe o ha sido eliminado.</p>
        <Button asChild>
          <Link href="/products">Ver todos los productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={product.images?.[selectedImage] || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 ${selectedImage === index ? "border-primary" : "border-transparent"}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <Link href={`/stores/${product.store.id}`} className="text-primary hover:underline">
              {product.store.name}
            </Link>

            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
              </span>
            </div>

            <div className="mt-4 flex items-center">
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
              {product.original_price && (
                <span className="ml-2 text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Descripción</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {product.description || "No hay descripción disponible para este producto."}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="mr-4">Cantidad:</span>
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={!product.stock || quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center text-sm mb-4">
              <span className={`${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
              </span>
            </div>

            <Button className="w-full" onClick={handleAddToCart} disabled={!product.stock}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Añadir al carrito
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Categoría: {product.category}</p>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Reseñas de clientes</h2>

        {reviews.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">Este producto aún no tiene reseñas.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-medium">{review.profiles.full_name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
