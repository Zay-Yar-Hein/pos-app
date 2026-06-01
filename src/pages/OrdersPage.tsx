import { useEffect, useState } from "react";
import type { Order } from "@/lib/api";
import { getOrders } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => getOrders().then(setOrders);
  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <>
                <tr key={o.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-bold">#{o.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{o.items.length}</td>
                  <td className="px-4 py-3 text-right font-semibold">${o.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={o.status === "confirmed" ? "default" : "destructive"}>
                      {o.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                      {expanded === o.id ? "Hide" : "Details"}
                    </Button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr key={`${o.id}-details`} className="bg-muted/20">
                    <td colSpan={6} className="px-8 py-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left py-1">Product</th>
                            <th className="text-right py-1">Price</th>
                            <th className="text-right py-1">Qty</th>
                            <th className="text-right py-1">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.items.map((item, i) => (
                            <tr key={i} className="border-t border-muted">
                              <td className="py-1">{item.name}</td>
                              <td className="text-right py-1">${item.price.toFixed(2)}</td>
                              <td className="text-right py-1">{item.qty}</td>
                              <td className="text-right py-1 font-semibold">${(item.price * item.qty).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
