"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  Package2Icon,
  SearchIcon,
  LayoutDashboardIcon,
  DollarSignIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  ShoppingBagIcon,
} from "lucide-react";
import {useState, useEffect} from "react";

const pageNames: { [key: string]: string } = {
  "/admin": "Dashboard",
  "/admin/customers": "Customers",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/pos": "Point of Sale",
  "/admin/cashier": "Cashier",
};

const supabase = createClient();

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error.message);
  } else {
    console.log('Logged out successfully');
    // redirect or update UI state
  }
};

type UserInfo = {
  email: string;
  roles: string[];
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/userInfo");
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json();

        setUserInfo(data);

      } catch (error) {

      } finally {

      }
    };
    fetchUserInfo();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Package2Icon className="h-6 w-6" />
          <span className="sr-only">Admin Panel</span>
        </Link>
        <h1 className="text-xl font-bold">{pageNames[pathname]}</h1>
        <div className="relative ml-auto flex-1 md:grow-0">

        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Image
                src="/placeholder-user.jpg"
                width={36}
                height={36}
                alt="Avatar"
                className="overflow-hidden rounded-full"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userInfo?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <aside className="fixed mt-[56px] inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <TooltipProvider>
              {userInfo?.roles.includes('TRANSACTION_VIEW') && <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      pathname === "/admin"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    } transition-colors hover:text-foreground md:h-8 md:w-8`}
                  >
                    <LayoutDashboardIcon className="h-5 w-5" />
                    <span className="sr-only">Dashboard</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Dashboard</TooltipContent>
              </Tooltip> }
              {userInfo?.roles.includes('TRANSACTION_VIEW') && <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/cashier"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      pathname === "/admin/cashier"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    } transition-colors hover:text-foreground md:h-8 md:w-8`}
                  >
                    <DollarSignIcon className="h-5 w-5" />
                    <span className="sr-only">Cashier</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Cashier</TooltipContent>
              </Tooltip>}
              {userInfo?.roles.includes('PRODUCTS_VIEW') &&  <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/products"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      pathname === "/admin/products"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    } transition-colors hover:text-foreground md:h-8 md:w-8`}
                  >
                    <PackageIcon className="h-5 w-5" />
                    <span className="sr-only">Products</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Products</TooltipContent>
              </Tooltip> }
              {userInfo?.roles.includes('TRANSACTION_VIEW') && <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/customers"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      pathname === "/admin/customers"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    } transition-colors hover:text-foreground md:h-8 md:w-8`}
                  >
                    <UsersIcon className="h-5 w-5" />
                    <span className="sr-only">Customers</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Customers</TooltipContent>
              </Tooltip>}
              {userInfo?.roles.includes('ORDER_VIEW') && <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/orders"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      pathname === "/admin/orders"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    } transition-colors hover:text-foreground md:h-8 md:w-8`}
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    <span className="sr-only">Orders</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Orders</TooltipContent>
              </Tooltip> }
              {userInfo?.roles.includes('ORDER_VIEW') && <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/pos"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      pathname === "/admin/pos"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    } transition-colors hover:text-foreground md:h-8 md:w-8`}
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span className="sr-only">POS</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Point of Sale</TooltipContent>
              </Tooltip>}
            </TooltipProvider>
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </div>
    </div>
  );
}
