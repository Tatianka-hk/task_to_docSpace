import { useState, useEffect } from "react"
import Navigation from "../components/Navigation"
import ProtectedRoute from "../components/ProtectedRoute"
import type { DataItem, DataItemCreate } from "../types/data"
import DataForm from "../components/DataForm"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal"

export default function Data() {
  const [data, setData] = useState<DataItem[]>([])
  const [filteredData, setFilteredData] = useState<DataItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<"value" | "date">("value")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DataItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<DataItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const filtered = data.filter((item) =>
      Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredData(filtered)
  }, [searchTerm, data])

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/data", {
        credentials: "include",
      })
      if (response.ok) {
        const fetchedData = await response.json()
        setData(fetchedData)
        setFilteredData(fetchedData)
      } else {
        console.error("Failed to fetch data")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleSort = (column: "value" | "date") => {
    const newDirection = column === sortColumn && sortDirection === "asc" ? "desc" : "asc"
    setSortColumn(column)
    setSortDirection(newDirection)

    const sorted = [...filteredData].sort((a, b) => {
      if (a[column] < b[column]) return newDirection === "asc" ? -1 : 1
      if (a[column] > b[column]) return newDirection === "asc" ? 1 : -1
      return 0
    })

    setFilteredData(sorted)
  }

  const handleCreate = async (newItem: DataItemCreate) => {
    try {
      const response = await fetch("http://localhost:8000/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
        credentials: "include",
      })

      if (response.ok) {
        const createdItem = await response.json()
        setData([...data, createdItem])
        setIsFormOpen(false)
      } else {
        console.error("Failed to create item")
      }
    } catch (error) {
      console.error("Error creating item:", error)
    }
  }

  const handleUpdate = async (updatedItem: DataItem) => {
    try {
      const response = await fetch(`http://localhost:8000/api/data/${updatedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedItem),
        credentials: "include",
      })

      if (response.ok) {
        const updated = await response.json()
        setData(data.map((item) => (item.id === updated.id ? updated : item)))
        setEditingItem(null)
      } else {
        console.error("Failed to update item")
      }
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/data/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setData(data.filter((item) => item.id !== id))
        setIsDeleteModalOpen(false)
        setDeleteItem(null)
      } else {
        console.error("Failed to delete item")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const confirmDelete = (item: DataItem) => {
    setDeleteItem(item)
    setIsDeleteModalOpen(true)
  }

  return (
    <ProtectedRoute>
      <div>
        <Navigation />
        <div className="container mx-auto mt-8 p-4">
          <h1 className="text-3xl font-bold mb-6">Data Table</h1>
          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded"
            />
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add New Item
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr>
                  {["id", "name", "category", "value", "date", "actions"].map((column) => (
                    <th
                      key={column}
                      onClick={() =>
                        (column === "value" || column === "date") && handleSort(column as "value" | "date")
                      }
                      className={`px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider ${
                        column === "value" || column === "date" ? "cursor-pointer hover:bg-gray-100" : ""
                      }`}
                    >
                      {column.charAt(0).toUpperCase() + column.slice(1)}
                      {(column === "value" || column === "date") &&
                        sortColumn === column &&
                        (sortDirection === "asc" ? " ▲" : " ▼")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.id}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.name}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.category}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.value}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{item.date}</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <button onClick={() => setEditingItem(item)} className="text-blue-600 hover:text-blue-900 mr-2">
                        Edit
                      </button>
                      <button onClick={() => confirmDelete(item)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {(isFormOpen || editingItem) && (
          <DataForm
            onSubmit={editingItem ? handleUpdate : handleCreate}
            initialData={editingItem}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingItem(null)
            }}
          />
        )}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => deleteItem && handleDelete(deleteItem.id)}
          itemName={deleteItem?.name}
        />
      </div>
    </ProtectedRoute>
  )
}

