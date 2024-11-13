import { useCart } from '@/lib/hooks/use-carts';
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/button';

interface ListItemProps {
  product: Product;
}

export default function ListItem({ product }: ListItemProps) {
  const { addToCart } = useCart();

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative mb-4">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-gray-600">${product.price}</p>
      </Link>
      <Button 
        onClick={() => addToCart(product, 1)}
        className="w-full mt-4"
      >
        Add to Cart
      </Button>
    </div>
  );
}