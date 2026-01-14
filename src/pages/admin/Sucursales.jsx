import { useEffect, useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { apiFetch } from "../../Services/api"

function Sucursales({ onSelectSucursal }) {
  const [sucursales, setSucursales] = useState([])
  const { token } = useAuth()

  useEffect(() => {
    const cargarSucursales = async () => {
      try {
        const data = await apiFetch("/sucursales")
        setSucursales(data)
      } catch (err) {
        console.error("Error al cargar sucursales:", err)
      }
    }

    if (token) {
      cargarSucursales()
    }
  }, [token])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        Sucursales
      </h1>

      {sucursales.length === 0 && (
        <p className="text-slate-400">
          No hay sucursales registradas
        </p>
      )}

      {sucursales.map(sucursal => (
        <div
          key={sucursal._id}
          onClick={() => onSelectSucursal(sucursal)}
          className="
            border border-slate-200
            p-4 mb-4 rounded-lg
            cursor-pointer
            bg-white
            hover:bg-blue-100
            hover:shadow-sm
            transition
          "
        >
          <h3 className="text-xl font-semibold text-slate-800">
            {sucursal.nombre}
          </h3>

          <p className="text-slate-600">
            {sucursal.direccion}
          </p>
        </div>
      ))}
    </div>
  )
}

export default Sucursales
