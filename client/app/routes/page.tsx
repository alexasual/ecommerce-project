import { Product } from '@/types/product';
import ProductList from '@/components/products/product-list';

async function getProducts(): Promise<Product[]> {
  const data = await fetch('http://app:4000', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      query: `{ 
        products { 
          id 
          name 
          price 
          imageUrl 
          description 
          category 
          quantity 
        } 
      }` 
    })
  });
  const json = await data.json();
  return json.data.products;
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">Marketplace</h1>
      <p className="mt-3 text-lg">Welcome to the marketplace</p>
      <ProductList initialProducts={products} />
    </div>
  );
}