import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    id: "electronics",
    name: "Electrónica",
    icon: "🖥️",
    color: "bg-blue-100",
  },
  {
    id: "clothing",
    name: "Ropa",
    icon: "👕",
    color: "bg-green-100",
  },
  {
    id: "home",
    name: "Hogar",
    icon: "🏠",
    color: "bg-yellow-100",
  },
  {
    id: "beauty",
    name: "Belleza",
    icon: "💄",
    color: "bg-pink-100",
  },
  {
    id: "sports",
    name: "Deportes",
    icon: "⚽",
    color: "bg-red-100",
  },
  {
    id: "books",
    name: "Libros",
    icon: "📚",
    color: "bg-purple-100",
  },
]

export function Categories() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Categorías populares</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link href={`/category/${category.id}`} key={category.id}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div
                    className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-2xl mb-4`}
                  >
                    {category.icon}
                  </div>
                  <h3 className="font-medium text-center">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
