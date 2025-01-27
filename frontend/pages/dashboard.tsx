import { useEffect, useState } from "react"
import Navigation from "../components/Navigation"
import ProtectedRoute from "../components/ProtectedRoute"
import dynamic from "next/dynamic"
import type { DataItem } from "../types/data"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function Dashboard() {
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [],
      },
    },
    series: [
      {
        name: "Value",
        data: [],
      },
    ],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/data", {
          credentials: "include",
        })
        if (response.ok) {
          const data: DataItem[] = await response.json()
          const categories = data.map((item) => item.name)
          const values = data.map((item) => item.value)

          setChartData({
            options: {
              ...chartData.options,
              xaxis: {
                categories: categories,
              },
            },
            series: [
              {
                name: "Value",
                data: values,
              },
            ],
          })
        } else {
          console.error("Failed to fetch data")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [chartData.options]) // Added chartData.options to dependencies

  return (
    <ProtectedRoute>
      <div>
        <Navigation />
        <div className="container mx-auto mt-8 p-4">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Data Trend</h2>
            <Chart options={chartData.options} series={chartData.series} type="bar" width="100%" height={320} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

