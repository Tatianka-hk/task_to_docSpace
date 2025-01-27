import { useEffect, useState } from "react"
import Navigation from "../components/Navigation"
import dynamic from "next/dynamic"
import ProtectedRoute from "../components/ProtectedRoute"
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
        name: "series-1",
        data: [],
      },
    ],
  })

  useEffect(() => {
    const fetchData = async () => {

      const data = {
        categories: ["Jan", "Feb", "Mar", "Apr", "May"],
        values: [30, 40, 35, 50, 49],
      }

      setChartData({
        options: {
          ...chartData.options,
          xaxis: {
            categories: data.categories,
          },
        },
        series: [
          {
            name: "series-1",
            data: data.values,
          },
        ],
      })
    }

    fetchData()
  }, [])

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

