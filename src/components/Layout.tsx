import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/pos", label: "POS" },
  { to: "/products", label: "Products" },
  { to: "/orders", label: "Orders" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-lg">ShopPOS</span>
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
