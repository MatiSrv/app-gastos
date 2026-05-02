import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  Wallet,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  PiggyBank,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

const savingsNavItems = [
  { to: "/savings", icon: PiggyBank, label: "Aportes" },
]

const gastosNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transacciones" },
  { to: "/categories", icon: Tag, label: "Categorías" },
  { to: "/accounts", icon: Wallet, label: "Cuentas" },
  { to: "/comparison", icon: BarChart2, label: "Comparar" },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  mobile?: boolean
}

export function Sidebar({ collapsed = false, onToggle, mobile = false }: SidebarProps) {
  const { signOut, role } = useAuth()
  const navigate = useNavigate()
  const isAdmin = role === "admin"

  if (mobile) {
    return (
      <nav className="flex items-center justify-around bg-card border-t border-border h-14 px-2">
        {savingsNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/savings"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        {isAdmin && gastosNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    )
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-14 px-4 border-b border-border", collapsed ? "justify-center" : "gap-3")}>
        <span className="text-2xl">💰</span>
        {!collapsed && <span className="font-semibold text-foreground">Gastos</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        {/* Savings nav items — always enabled */}
        {savingsNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/savings"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                collapsed ? "justify-center px-2" : "",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* Gastos nav items — disabled for non-admin */}
        {gastosNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                collapsed ? "justify-center px-2" : "",
                isAdmin
                  ? isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  : "pointer-events-none opacity-40 text-muted-foreground"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="flex-1">{label}</span>}
            {!collapsed && !isAdmin && <Lock className="h-3 w-3 shrink-0" />}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full text-muted-foreground hover:text-foreground", collapsed ? "px-2 justify-center" : "justify-start gap-3")}
          onClick={async () => { await signOut(); navigate("/login") }}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Salir</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full text-muted-foreground", collapsed ? "px-2 justify-center" : "justify-end")}
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
