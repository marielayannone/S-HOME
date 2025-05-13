import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Descubre productos únicos de vendedores independientes
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explora nuestra plataforma multivendedor y encuentra productos de calidad directamente de los creadores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/products">Explorar productos</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth?type=seller">Vender en MarketPlace</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
              <img
                src="/placeholder.svg?height=600&width=800"
                alt="Marketplace Hero"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
