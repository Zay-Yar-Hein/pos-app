const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL ?? "/order";

const normalizePath = (value: string) => {
  const raw = value.trim();

  if (!raw || raw === "/") {
    return "";
  }

  return `/${raw.replace(/^\/+|\/+$/g, "")}`;
};

const apiUrl = (path: string) =>
  `${ORDER_SERVICE_URL.replace(/\/+$/g, "")}${normalizePath(path)}`;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), init);
  const body = await readJson(response);

  if (!response.ok) {
    const message =
      typeof body?.error === "string"
        ? body.error
        : typeof body?.message === "string"
          ? body.message
          : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

async function readJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function expectArray<T>(value: unknown, name: string): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`${name} response is not a list`);
  }

  return value as T[];
}

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
export const getProducts = async (): Promise<Product[]> =>
  expectArray<Product>(await requestJson<unknown>("/products"), "Products");

export const createProduct = (data: Omit<Product, "id">): Promise<Product> =>
  requestJson<Product>("/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateProduct = (id: string, data: Partial<Omit<Product, "id">>): Promise<Product> =>
  requestJson<Product>(`/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteProduct = (id: string): Promise<void> =>
  requestJson(`/products/${id}`, { method: "DELETE" }).then(() => undefined);

// Orders
export const getOrders = async (): Promise<Order[]> =>
  expectArray<Order>(await requestJson<unknown>("/orders"), "Orders");

export const createOrder = (items: OrderItem[]): Promise<{ order: Order; error?: string }> =>
  requestJson<{ order: Order; error?: string }>("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
