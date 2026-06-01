import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product, OrderItem } from "@/lib/api";
import { getProducts, createOrder } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CartItem extends OrderItem {
  cartQty: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getProducts().then(setProducts); }, []);

  function addToCart(product: Product) {
    if (product.qty === 0) { toast.error("Out of stock"); return; }
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        if (existing.cartQty >= product.qty) { toast.error("Not enough stock"); return prev; }
        return prev.map((c) => c.productId === product.id ? { ...c, cartQty: c.cartQty + 1 } : c);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1, cartQty: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev.map((c) => {
        if (c.productId !== productId) return c;
        const newQty = c.cartQty + delta;
        if (newQty <= 0) return c;
        const stock = products.find((p) => p.id === productId)?.qty ?? 0;
        if (newQty > stock) { toast.error("Not enough stock"); return c; }
        return { ...c, cartQty: newQty };
      })
    );
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.cartQty, 0);

  async function handleCheckout() {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    setLoading(true);
    try {
      const items: OrderItem[] = cart.map((c) => ({ productId: c.productId, name: c.name, price: c.price, qty: c.cartQty }));
      const result = await createOrder(items);
      if (result.order?.status === "confirmed") {
        toast.success(`Order #${result.order.id} confirmed!`);
        setCart([]);
        getProducts().then(setProducts);
      } else {
        toast.error(result.error ?? "Order failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* Product Grid */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">POS</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((p) => (
            <Card
              key={p.id}
              className={`cursor-pointer transition-all hover:shadow-md ${p.qty === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => addToCart(p)}
            >
              <CardContent className="p-4">
                <p className="font-semibold text-sm leading-tight mb-1">{p.name}</p>
                <p className="text-lg font-bold text-primary">${p.price.toFixed(2)}</p>
                <Badge variant={p.qty > 10 ? "secondary" : p.qty > 0 ? "outline" : "destructive"} className="mt-1 text-xs">
                  {p.qty === 0 ? "Out of stock" : `${p.qty} left`}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-80 flex flex-col">
        <div className="rounded-lg border bg-card flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg">Cart</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Add items from the left</p>
            )}
            {cart.map((c) => (
              <div key={c.productId} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">${c.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-6 w-6 text-xs" onClick={() => changeQty(c.productId, -1)}>−</Button>
                  <span className="w-6 text-center text-sm">{c.cartQty}</span>
                  <Button size="icon" variant="outline" className="h-6 w-6 text-xs" onClick={() => changeQty(c.productId, 1)}>+</Button>
                </div>
                <p className="text-sm font-semibold w-14 text-right">${(c.price * c.cartQty).toFixed(2)}</p>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(c.productId)}>×</Button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t space-y-3">
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading || cart.length === 0}>
              {loading ? "Processing..." : "Checkout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
