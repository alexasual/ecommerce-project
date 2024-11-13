'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Product } from '@/types/product'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('http://app:4000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ products { id name price imageUrl } }'
        })
      })
      const data = await response.json()
      setProducts(data.data.products)
    }

    fetchProducts()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map(product => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <div className="border p-4 rounded">
            <h2>{product.name}</h2>
            <p>${product.price}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}