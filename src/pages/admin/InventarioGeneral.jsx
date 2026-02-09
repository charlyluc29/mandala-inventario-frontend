import { useEffect, useState } from "react"
import { apiFetch } from "../../Services/api"
import { Pencil, Boxes, Trash2 } from "lucide-react"
import * as XLSX from "xlsx"

function InventarioGeneral() {
  const [inventario, setInventario] = useState([])
  const [productos, setProductos] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [loading, setLoading] = useState(true)

  // filtros
  const [productoTexto, setProductoTexto] = useState("")
  const [productoId, setProductoId] = useState("")
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState("")

  // edición
  const [editando, setEditando] = useState(null)
  const [formEdit, setFormEdit] = useState({
    caracteristicas: "",
    precio: "",
    cantidad: ""
  })

  // =========================
  // Cargar inventario
  // =========================
  const cargarInventario = async () => {
    try {
      setLoading(true)

      const data = await apiFetch("/inventario")

      const prod = []
      const suc = []

      data.forEach(i => {
        if (i.producto && !prod.find(p => p._id === i.producto._id)) {
          prod.push(i.producto)
        }

        if (i.sucursal && !suc.find(s => s._id === i.sucursal._id)) {
          suc.push(i.sucursal)
        }
      })

      setInventario(data)
      setProductos(prod)
      setSucursales(suc)

    } catch (err) {
      console.error(err)
      alert("Error al cargar inventario")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarInventario()
  }, [])

  // =========================
  // Buscar producto
  // =========================
  const handleProductoChange = value => {
    setProductoTexto(value)

    const encontrado = productos.find(
      p => `${p.nombre} (${p.codigo})` === value
    )

    setProductoId(encontrado ? encontrado._id : "")
  }

  // =========================
  // Filtrar inventario
  // =========================
  const inventarioFiltrado = () => {
  let data = [...inventario]

  // filtro por producto
  if (productoId) {
    data = data.filter(i => i.producto?._id === productoId)
  }

  // filtro por sucursal seleccionada
  if (sucursalSeleccionada) {
    data = data.filter(i => i.sucursal?._id === sucursalSeleccionada)
  }

  // ocultar SIN STOCK solo en mantenimiento
  data = data.filter(i => {
    const nombreSucursal = i.sucursal?.nombre
      ?.toLowerCase()
      .trim()

    return !(
      i.cantidad === 0 &&
      nombreSucursal === "mantenimiento"
    )
  })

  return data
}


  // =========================
  // Exportar Excel (solo con stock)
  // =========================
  const exportarExcel = () => {
    const data = inventarioFiltrado()
      .filter(i => i.cantidad > 0)
      .map(i => ({
        Codigo: i.producto?.codigo || "",
        Nombre: i.producto?.nombre || "",
        Caracteristicas: i.producto?.caracteristicas || "",
        Cantidad: i.cantidad,
        Sucursal: i.sucursal?.nombre || "",
        Precio: i.producto?.precio || ""
      }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario")

    XLSX.writeFile(workbook, "inventario.xlsx")
  }

  // =========================
  // Guardar cambios
  // =========================
  const guardarCambios = async () => {
    try {

      await apiFetch(`/productos/codigo/${editando.producto.codigo}`, {
        method: "PUT",
        body: JSON.stringify({
          caracteristicas: formEdit.caracteristicas,
          precio: Number(formEdit.precio)
        })
      })

      const diferencia =
        Number(formEdit.cantidad) - editando.cantidad

      if (diferencia > 0) {
        await apiFetch("/inventario/entrada", {
          method: "POST",
          body: JSON.stringify({
            sucursal: editando.sucursal._id,
            producto: editando.producto._id,
            cantidad: diferencia
          })
        })
      }

      if (diferencia < 0) {
        await apiFetch("/inventario/salida", {
          method: "POST",
          body: JSON.stringify({
            sucursal: editando.sucursal._id,
            producto: editando.producto._id,
            cantidad: Math.abs(diferencia)
          })
        })
      }

      setEditando(null)
      cargarInventario()

    } catch (err) {
      console.error(err)
      alert("Error al guardar cambios")
    }
  }

  // =========================
  // Eliminar
  // =========================
  const eliminarProducto = async item => {

    if (!confirm(`¿Eliminar "${item.producto?.nombre}" de ${item.sucursal?.nombre}?`))
      return

    try {
      await apiFetch(`/inventario/item/${item._id}`, {
        method: "DELETE"
      })

      cargarInventario()

    } catch (err) {
      console.error(err)
      alert("Error al eliminar")
    }
  }

  // =========================
  // Loading
  // =========================
  if (loading) {
    return <p className="text-slate-500">Cargando inventario...</p>
  }

  return (
    <div>

      {/* TITULO */}
      <div className="mb-6 flex items-center gap-3">
        <Boxes size={30} className="text-blue-600" />

        <h1 className="text-3xl font-bold text-slate-800">
          Inventario General
        </h1>
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-4 mb-6">

        <input
          list="productos"
          placeholder="Buscar producto"
          value={productoTexto}
          onChange={e => handleProductoChange(e.target.value)}
          className="p-2 rounded bg-slate-800 text-white min-w-[280px]"
        />

        <datalist id="productos">
          {productos.map(p => (
            <option
              key={p._id}
              value={`${p.nombre} (${p.codigo})`}
            />
          ))}
        </datalist>

        <select
          value={sucursalSeleccionada}
          onChange={e => setSucursalSeleccionada(e.target.value)}
          className="p-2 rounded bg-slate-800 text-white min-w-[220px]"
        >
          <option value="">Todas</option>

          {sucursales.map(s => (
            <option key={s._id} value={s._id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setProductoTexto("")
            setProductoId("")
            setSucursalSeleccionada("")
          }}
          className="px-4 py-2 bg-slate-600 rounded text-white"
        >
          Limpiar
        </button>

        <button
          onClick={exportarExcel}
          className="px-4 py-2 bg-blue-600 rounded text-white"
        >
          Exportar Excel
        </button>

      </div>

      {/* TABLA */}
      <table className="min-w-full border border-slate-700 text-center">

        <thead className="bg-amber-400/40 text-slate-900">
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Características</th>
            <th>Cantidad</th>
            <th>Sucursal</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {inventarioFiltrado().length === 0 && (
            <tr>
              <td colSpan="7" className="p-4 text-slate-400">
                No hay resultados
              </td>
            </tr>
          )}

          {inventarioFiltrado().map(i => (

            <tr
              key={i._id}
              className={`border-b transition
                ${i.cantidad === 0
                  ? "bg-red-900/30 text-red-800 font-semibold"
                  : "hover:bg-slate-100 text-slate-800"}
              `}
            >

              <td>{i.producto?.codigo}</td>
              <td>{i.producto?.nombre}</td>
              <td>{i.producto?.caracteristicas}</td>

              <td className="font-bold">
                {i.cantidad === 0 ? "SIN STOCK" : i.cantidad}
              </td>

              <td>{i.sucursal?.nombre}</td>
              <td>${i.producto?.precio}</td>

              <td className="flex justify-center gap-2 p-2">

                <button
                  onClick={() => {
                    setEditando(i)
                    setFormEdit({
                      caracteristicas: i.producto.caracteristicas,
                      precio: i.producto.precio,
                      cantidad: i.cantidad
                    })
                  }}
                  className="p-2 rounded-lg bg-blue-600 text-white"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => eliminarProducto(i)}
                  className="p-2 rounded-lg bg-red-600 text-white"
                >
                  <Trash2 size={18} />
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* MODAL */}
      {editando && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-white p-6 rounded w-96">

            <h2 className="text-xl font-bold mb-4">
              Editar producto
            </h2>

            <input
              className="w-full p-2 border mb-2"
              value={formEdit.caracteristicas}
              onChange={e =>
                setFormEdit({
                  ...formEdit,
                  caracteristicas: e.target.value
                })
              }
            />

            <input
              className="w-full p-2 border mb-2"
              type="number"
              value={formEdit.precio}
              onChange={e =>
                setFormEdit({
                  ...formEdit,
                  precio: e.target.value
                })
              }
            />

            <input
              className="w-full p-2 border mb-4"
              type="number"
              value={formEdit.cantidad}
              onChange={e =>
                setFormEdit({
                  ...formEdit,
                  cantidad: Number(e.target.value)
                })
              }
            />

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setEditando(null)}
                className="px-4 py-2 bg-gray-400 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={guardarCambios}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Guardar
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default InventarioGeneral
