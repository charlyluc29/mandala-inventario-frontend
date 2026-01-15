import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../Services/api" // IMPORTANTE: en minúsculas
import {
  Package,
  ArrowUpRight,
  Inbox,
  ArrowUp,
  LogOut,
  Menu,
  Users
} from "lucide-react"

import UserInventario from "./user/UserInventario"
import UserTransferencia from "./user/UserTransferencia"
import UserTransferenciasEntrantes from "./user/UserTransferenciasEntrantes"
import UserTransferenciasEnviadas from "./user/UserTransferenciasEnviadas"

export default function UserDashboard({ logout }) {
  const navigate = useNavigate()

  // 🔹 Sidebar cerrado por defecto (móvil)
  const [isOpen, setIsOpen] = useState(false)
  const [seccion, setSeccion] = useState("inventario")
  const [sucursal, setSucursal] = useState(null)
  const [loadingSucursal, setLoadingSucursal] = useState(true)

  const sucursalId = localStorage.getItem("sucursal")

  // ===============================
  // Cargar sucursal del usuario
  // ===============================
  useEffect(() => {
    if (!sucursalId) {
      alert("Usuario sin sucursal asignada")
      logout()
      navigate("/")
      return
    }

    apiFetch(`/sucursales/${sucursalId}`)
      .then(data => setSucursal(data))
      .catch(err => {
        console.error(err)
        alert("Error cargando sucursal")
        logout()
        navigate("/")
      })
      .finally(() => setLoadingSucursal(false))
  }, [sucursalId, logout, navigate])

  const itemClass = (active) =>
    `flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition
     ${
       active
         ? "bg-gray-800 text-white border-l-4 border-amber-400"
         : "text-gray-400 hover:bg-gray-800 hover:text-white"
     }`

  const handleLogout = () => {
    logout()
    navigate("/")
  }

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
            className="h-11 w-auto object-contain p-1.6"
          />
          <div className="leading-tight">
  <h1
    className="text-white font-semibold text-lg"
    translate="no"
  >
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
        <div className="mb-6 px-2">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-purple-500" />
            <span className="text-white font-semibold">Usuario</span>
          </div>

          {!loadingSucursal && (
            <p className="text-sm text-gray-200 mt-1">
              Sucursal:{" "}
              <span className="font-semibold text-white">
                {sucursal?.nombre}
              </span>
            </p>
          )}
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-1">
          <div
            className={itemClass(seccion === "inventario")}
            onClick={() => {
              setSeccion("inventario")
              setIsOpen(false)
            }}
          >
            <Package size={18} />
            Mi inventario
          </div>

          <div
            className={itemClass(seccion === "transferir")}
            onClick={() => {
              setSeccion("transferir")
              setIsOpen(false)
            }}
          >
            <ArrowUpRight size={18} />
            Enviar transferencia
          </div>

          <div
            className={itemClass(seccion === "entrantes")}
            onClick={() => {
              setSeccion("entrantes")
              setIsOpen(false)
            }}
          >
            <Inbox size={18} />
            Transferencias entrantes
          </div>

          <div
            className={itemClass(seccion === "enviadas")}
            onClick={() => {
              setSeccion("enviadas")
              setIsOpen(false)
            }}
          >
            <ArrowUp size={18} />
            Transferencias enviadas
          </div>
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
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

        {loadingSucursal && (
          <div className="bg-slate-800 p-6 rounded-xl shadow text-gray-400">
            Cargando información de la sucursal...
          </div>
        )}

        {!loadingSucursal && (
          <div className="space-y-8">
            {seccion === "inventario" && (
              <UserInventario sucursal={sucursal} />
            )}
            {seccion === "transferir" && (
              <UserTransferencia sucursal={sucursal} />
            )}
            {seccion === "entrantes" && <UserTransferenciasEntrantes />}
            {seccion === "enviadas" && <UserTransferenciasEnviadas />}
          </div>
        )}
      </main>
    </div>
  )
}
