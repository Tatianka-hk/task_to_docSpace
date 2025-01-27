import { useState, useEffect } from "react"
import Navigation from "../components/Navigation"
import ProtectedRoute from "../components/ProtectedRoute"

interface DataItem {
  id: number
  name: string
  category: string
  value: number
  date: string
}

export default function Data() {
  const [data, setData] = useState<DataItem[]>([])
  const [filteredData, setFilteredData] = useState<DataItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof DataItem>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    const fetchData = async () => {
      const mockData: DataItem[] = [
        { id: 1, name: "Item 1", category: "A", value: 100, date: "2023-01-01" },
        { id: 2, name: "Item 2", category: "B", value: 200, date: "2023-01-02" },
        { id: 3, name: "Item 3", category: "A", value: 150, date: "2023-01-03" },
        { id: 4, name: "Item 4", category: "C", value: 300, date: "2023-01-04" },
        { id: 5, name: "Item 5", category: "B", value: 250, date: "2023-01-05" },
      ]
      setData(mockData)
      setFilteredData(mockData)
    }

    fetchData()
  }, [])

  useEffect(() => {
    const filtered = data.filter((item) =>
      Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredData(filtered)
  }, [searchTerm, data])

  const handleSort = (column: keyof DataItem) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }

    const sorted = [...filteredData].sort((a, b) => {
      if (a[column] < b[column]) return sortDirection === "asc" ? -1 : 1
      if (a[column] > b[column]) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    setFilteredData(sorted)
  }

  return (
    <ProtectedRoute>
    <div>
      <Navigation />
      <div className="container mx-auto mt-8 p-4">
        <h1 className="text-3xl font-bold mb-6">Data Table</h1>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                {["id", "name", "category", "value", "date"].map((column) => (
                  <th
                    key={column}
                    onClick={() => handleSort(column as keyof DataItem)}
                    className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                    {sortColumn === column && (sortDirection === "asc" ? " ▲" : " ▼")}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}

