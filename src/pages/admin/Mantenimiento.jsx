import { useEffect, useState } from "react"
import { apiFetch } from "../../Services/api"
import InventarioSucursal from "./InventarioSucursal"

function Mantenimiento() {
  const [sucursal, setSucursal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await apiFetch("/sucursales/mantenimiento")
        setSucursal(data)
      } catch (err) {
        console.error(err)
        alert("No se pudo cargar mantenimiento")
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [])

  if (loading) {
    return <p className="text-center">Cargando mantenimiento...</p>
  }

  if (!sucursal) {
    return (
      <p className="text-center text-red-500">
        No existe sucursal de mantenimiento
      </p>
    )
  }

  return (
    <InventarioSucursal
      sucursal={sucursal}
      volver={null}
    />
  )
}

export default Mantenimiento
