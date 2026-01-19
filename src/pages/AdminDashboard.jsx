import { useState } from "react"
import {
  LayoutDashboard,
  Building2,
  Package,
  BarChart3,
  Users,
  LogOut,
  Menu
} from "lucide-react"

import Home from "./admin/Dashboard"
import Sucursales from "./admin/Sucursales"
import InventarioSucursal from "./admin/InventarioSucursal"
import InventarioGeneral from "./admin/InventarioGeneral"
import MovimientosGeneral from "./admin/MovimientosGeneral"
import Usuarios from "./admin/Usuarios"

function AdminDashboard({ logout }) {
  const [isOpen, setIsOpen] = useState(false)
  const [section, setSection] = useState("home")
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null)

  const itemClass = (name) =>
    `flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition
     ${
       section === name
         ? "bg-gray-800 text-white border-l-4 border-amber-400"
         : "text-gray-400 hover:bg-gray-800 hover:text-white"
     }`

  return (
    <div className="min-h-screen flex bg-zinc-50 text-zinc-900 relative">

      {/* OVERLAY (solo móvil) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:relative z-50
          inset-y-0 left-0
          w-64
          bg-zinc-900 p-3
          flex flex-col
          border-r border-zinc-800
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <img
            src="/logo-mandala 3.png"
            alt="Mandala Group"
            className="h-11 w-auto object-contain p-1.5"
          />
          <div className="leading-tight">
            <h1 className="text-white font-semibold text-lg" translate="no">
              Mandala Group
            </h1>
            <span
              className="text-xs tracking-widest text-amber-400"
              translate="no"
            >
              HOSPITALITY
            </span>
          </div>
        </div>

        {/* USUARIO */}
        <div className="mb-6 px-2 text-white font-semibold">
          Usuario: Admin
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-1">

          <div
            className={itemClass("home")}
            onClick={() => {
              setSection("home")
              setSucursalSeleccionada(null)
              setIsOpen(false)
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </div>

          <div
            className={itemClass("sucursales")}
            onClick={() => {
              setSection("sucursales")
              setSucursalSeleccionada(null)
              setIsOpen(false)
            }}
          >
            <Building2 size={18} />
            Sucursales
          </div>

          <div
            className={itemClass("inventarioGeneral")}
            onClick={() => {
              setSection("inventarioGeneral")
              setSucursalSeleccionada(null)
              setIsOpen(false)
            }}
          >
            <Package size={18} />
            Inventario General
          </div>

          <div
            className={itemClass("movimientos")}
            onClick={() => {
              setSection("movimientos")
              setSucursalSeleccionada(null)
              setIsOpen(false)
            }}
          >
            <BarChart3 size={18} />
            Movimientos
          </div>

          <div
            className={itemClass("usuarios")}
            onClick={() => {
              setSection("usuarios")
              setSucursalSeleccionada(null)
              setIsOpen(false)
            }}
          >
            <Users size={18} />
            Usuarios
          </div>

        </nav>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition mt-6 px-3"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">

        {/* BOTÓN MENÚ (solo móvil) */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden mb-4 flex items-center gap-2 text-zinc-700"
        >
          <Menu size={22} />
          Menú
        </button>

        {section === "home" && <Home />}

        {section === "sucursales" && !sucursalSeleccionada && (
          <Sucursales onSelectSucursal={setSucursalSeleccionada} />
        )}

        {sucursalSeleccionada && (
          <InventarioSucursal
            sucursal={sucursalSeleccionada}
            volver={() => setSucursalSeleccionada(null)}
          />
        )}

        {section === "inventarioGeneral" && <InventarioGeneral />}
        {section === "movimientos" && <MovimientosGeneral />}
        {section === "usuarios" && <Usuarios />}
      </main>
    </div>
  )
}

export default AdminDashboard
