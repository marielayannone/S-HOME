"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react"
import Link from "next/link"

type CartItem = {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    images: string[]
    stock: number
    store: {
      name: string
    }
  }
}

export default function CartPage() {
  const router = useRouter()
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth")
      return
    }

    async function fetchCart() {
      try {
        // Get cart ID
        const { data: cart, error: cartError } = await supabase
          .from("carts")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle()

        if (cartError) throw cartError

        if (!cart) {
          setCartItems([])
          setLoading(false)
          return
        }

        // Get cart items
        const { data, error } = await supabase
          .from("cart_items")
          .select(`
            id,
            quantity,
            price,
            product:product_id(
              id,
              name,
              images,
              stock,
              store:store_id(name)
            )
          `)
          .eq("cart_id", cart.id)

        if (error) throw error

        setCartItems(data || [])
      } catch (error) {
        console.error("Error fetching cart:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el carrito",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [session, supabase, router, toast])

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", itemId)

      if (error) throw error

      setCartItems(cartItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad",
        variant: "destructive",
      })
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

      if (error) throw error

      setCartItems(cartItems.filter((item) => item.id !== itemId))

      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado del carrito",
      })
    } catch (error) {
      console.error("Error removing item:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  if (!session) {
    return null // Redirect handled in useEffect
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tu carrito</h1>
        <div className="animate-pulse">
          <div className="h-20 bg-muted rounded-lg mb-4"></div>
          <div className="h-20 bg-muted rounded-lg mb-4"></div>
          <div className="h-20 bg-muted rounded-lg mb-4"></div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-8">No tienes productos en tu carrito de compras.</p>
        <Button asChild>
          <Link href="/products">Ver productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu carrito</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex border rounded-lg p-4">
                <div className="w-24 h-24 rounded-md overflow-hidden">
                  <img
                    src={item.product.images?.[0] || "/placeholder.svg?height=200&width=200"}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">
                        <Link href={`/products/${item.product.id}`} className="hover:underline">
                          {item.product.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.product.store.name}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)} por unidad</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="border rounded-lg p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>Calculado en el checkout</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            <Button className="w-full" asChild>
              <Link href="/checkout">Proceder al pago</Link>
            </Button>

            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/products">Seguir comprando</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
