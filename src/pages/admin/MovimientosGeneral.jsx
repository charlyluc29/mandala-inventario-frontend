import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "../../Services/api"
import * as XLSX from "xlsx"

function MovimientosGeneral() {

  const [movimientos, setMovimientos] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [sucursalFiltro, setSucursalFiltro] = useState("")

  // ===============================
  // Cargar datos
  // ===============================
  useEffect(() => {

    const cargarTodo = async () => {

      try {

        const movs = await apiFetch("/inventario/movimientos/all")
        const sucs = await apiFetch("/sucursales")

        setMovimientos(Array.isArray(movs) ? movs : [])
        setSucursales(Array.isArray(sucs) ? sucs : [])

      } catch (err) {

        console.error("Error cargando movimientos:", err)

      }
    }

    cargarTodo()

  }, [])


  // ===============================
  // Filtrado + Orden
  // ===============================
  const movimientosFiltrados = useMemo(() => {

    let data = [...movimientos]

    // ordenar del más nuevo al más viejo
    data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    // filtrar por sucursal
    if (sucursalFiltro) {

      data = data.filter(
        m =>
          m.sucursalOrigen?._id === sucursalFiltro ||
          m.sucursalDestino?._id === sucursalFiltro
      )
    }

    return data

  }, [movimientos, sucursalFiltro])


  // ===============================
  // Helpers
  // ===============================
  const getTipo = m => {

    if (m.tipo === "transferencia") return "Transferencia"
    if (m.tipo === "entrada") return "Entrada"
    if (m.tipo === "salida") return "Salida"

    return m.tipo
  }


  const getUsuario = m => {

    if (m.tipo === "transferencia") {

      const envia = m.usuario?.username || "Sistema"
      const acepta = m.usuarioAcepta?.username || "—"

      return `${envia} → ${acepta}`
    }

    return m.usuario?.username || "Sistema"
  }


  // ===============================
  // Exportar Excel
  // ===============================
  const exportarExcel = () => {

    const data = movimientosFiltrados.map(m => ({

      Fecha: new Date(m.fecha).toLocaleString(),

      Codigo: m.producto?.codigo || "",

      Producto: m.producto?.nombre || "",

      Tipo: getTipo(m),

      Cantidad: m.cantidad,

      Origen: m.sucursalOrigen?.nombre || "",

      Destino: m.sucursalDestino?.nombre || "",

      Usuario: getUsuario(m)

    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Movimientos"
    )

    XLSX.writeFile(workbook, "movimientos.xlsx")
  }


  return (
    <div>

      <h2 className="text-3xl font-bold mb-4">
        Movimientos de Inventario
      </h2>


      {/* FILTROS */}
      <div className="flex gap-4 mb-4 items-center">

        <select
          value={sucursalFiltro}
          onChange={e => setSucursalFiltro(e.target.value)}
          className="p-2 rounded bg-slate-800 text-white"
        >

          <option value="">
            Todas las sucursales
          </option>

          {sucursales.map(s => (
            <option key={s._id} value={s._id}>
              {s.nombre}
            </option>
          ))}

        </select>


        <button
          onClick={exportarExcel}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-white"
        >
          Exportar Excel
        </button>

      </div>


      {/* TABLA */}
      <div className="overflow-x-auto">

        <table className="min-w-full border border-slate-700 text-black text-center">

          <thead className="bg-amber-400/40 text-slate">

            <tr>
              <th className="p-2">Fecha</th>
              <th className="p-2">Código</th>
              <th className="p-2">Producto</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Origen</th>
              <th className="p-2">Destino</th>
              <th className="p-2">Usuario</th>
            </tr>

          </thead>


          <tbody>

            {movimientosFiltrados.map(m => (

              <tr
                key={m._id}
                className="border-b border-slate-700"
              >

                <td className="p-2">
                  {new Date(m.fecha).toLocaleString()}
                </td>

                <td className="p-2 font-semibold">
                  {m.producto?.codigo || "—"}
                </td>

                <td className="p-2">
                  {m.producto?.nombre || "—"}
                </td>

                <td className="p-2 font-semibold">
                  {getTipo(m)}
                </td>

                <td className="p-2 font-bold">
                  {m.cantidad}
                </td>

                <td className="p-2">
                  {m.sucursalOrigen?.nombre || "—"}
                </td>

                <td className="p-2">
                  {m.sucursalDestino?.nombre || "—"}
                </td>

                <td className="p-2">
                  {getUsuario(m)}
                </td>

              </tr>

            ))}


            {movimientosFiltrados.length === 0 && (

              <tr>
                <td
                  colSpan="8"
                  className="p-4 text-center text-slate-500"
                >
                  No hay movimientos
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default MovimientosGeneral
