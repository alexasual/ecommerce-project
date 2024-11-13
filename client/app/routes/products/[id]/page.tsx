import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

type ProductPageArgs = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageArgs) {
  const { addToCart } = useCart();

  type Product = {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    category: string;
    quantity: number;
  };

  const [product, setProduct] = React.useState<Product | null>(null);

  React.useEffect(() => {
    const fetchProduct = async () => {
      const data = await fetch('http://app:4000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `{ product (id: ${params.id}){ id name price description imageUrl } }` })
      });
      const json = await data.json();
      setProduct(json.data.product);
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    const quantity = parseInt((document.getElementById('quantity') as HTMLInputElement).value, 10);
    if (product) {
      addToCart(product, quantity);
    }
  };

  return (
    <div>
      {product ? (
        <>
          <h1>{product.name}</h1>
          <Image src={product.imageUrl || `https://picsum.photos/200/300?random=${product.id}`} alt={product.name} width={100} height={100} />
          <p>Price: ${product.price}</p>
          <p>Product ID: {product.id}</p>
          <p>{product.description}</p>
          <label htmlFor="quantity">Quantity:</label>
          <input type="number" id="quantity" name="quantity" min="1" defaultValue={1} />
          <button type="button" onClick={handleAddToCart}>Add to Cart</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}