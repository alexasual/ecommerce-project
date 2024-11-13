'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="container mx-auto p-4">
      <h1>Welcome to our Store</h1>
      <Link href="/products" className="text-blue-500 hover:underline">
        View Products
      </Link>
    </main>
  )
}