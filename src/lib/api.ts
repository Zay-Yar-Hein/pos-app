const INVENTORY = import.meta.env.VITE_INVENTORY_URL ?? "http://localhost:3002";
const ORDERS    = import.meta.env.VITE_ORDER_URL     ?? "http://localhost:3001";

export interface Product {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "confirmed" | "failed";
  createdAt: string;
}

// Products
export const getProducts = (): Promise<Product[]> =>
  fetch(`${INVENTORY}/api/products`).then((r) => r.json());

export const createProduct = (data: Omit<Product, "id">): Promise<Product> =>
  fetch(`${INVENTORY}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateProduct = (id: string, data: Partial<Omit<Product, "id">>): Promise<Product> =>
  fetch(`${INVENTORY}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteProduct = (id: string): Promise<void> =>
  fetch(`${INVENTORY}/api/products/${id}`, { method: "DELETE" }).then(() => undefined);

// Orders
export const getOrders = (): Promise<Order[]> =>
  fetch(`${ORDERS}/api/orders`).then((r) => r.json());

export const createOrder = (items: OrderItem[]): Promise<{ order: Order; error?: string }> =>
  fetch(`${ORDERS}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).then(async (r) => {
    const body = await r.json();
    return body;
  });
