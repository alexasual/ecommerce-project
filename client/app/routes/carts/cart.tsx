'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  const handleCheckout = () => {
    // Implement checkout logic here
    alert('Checkout successful!');
    clearCart();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Shopping Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.id} className="mb-4">
                  <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-16 h-16 mr-4" />
                  <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-16 h-16 mr-4" />
                  <div>
                    <h4 className="font-bold">{item.name}</h4>
                    <p>Price: ${item.price.toFixed(2)}</p>
                    <p>Quantity: {item.quantity}</p>
                    <button
                      className="text-red-500"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
              </li>
            ))}
          </ul>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </>
      )}
      <Link href="/" className="text-blue-500 mt-4 block">Continue Shopping</Link>
    </div>
  );
}