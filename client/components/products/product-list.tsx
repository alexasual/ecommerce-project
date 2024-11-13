'use client';

import { useState } from 'react';
import ListItem from './list-item';
import { Product } from '@/types/product';

type ProductListProps = {
  initialProducts: Product[];
};

export default function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const handleSearch = async () => {
    try {
      const data = await fetch('http://localhost:4000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: `{ 
             products(search: "${search}", filter: "${filter}") { 
              id
              name
              description
              category
              quantity
              price
              imageUrl 
            } 
          }` 
        })
      });
      const json = await data.json();
      console.log(json.data.products);
      setProducts(json.data.products);

    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  return (
    <>
      <div className="flex gap-4 mt-6">
        <input
          type="search"
          placeholder="Search products..."
          className="px-4 py-2 border rounded"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleSearch();
          }}
        />
        <select 
          className="px-4 py-2 border rounded"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            handleSearch();
          }}
        >
          <option value="">All Categories</option>
          <option value="Toy">Toys</option>
          <option value="Home & Appliances">Home & Appliances</option>
          <option value="Tools">Tools</option>
        </select>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
        {products.map((product: Product, index: number) => (
          <ListItem
            key={product.id}
            id={product.id}
            title={product.name}
            price={product.price}
            image={product.imageUrl || `https://picsum.photos/200/300?random=${index}`}
          />
        ))}
      </div>
    </>
  );
}