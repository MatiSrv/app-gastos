import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { useEffect, useState } from "react"

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved) setCollapsed(JSON.parse(saved))
  }, [])

  const toggle = () => {
    setCollapsed((v) => {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(!v))
      return !v
    })
  }

  return (
    <div className="dark flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Sidebar mobile />
      </div>
    </div>
  )
}
