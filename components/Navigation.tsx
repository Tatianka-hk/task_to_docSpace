import Link from "next/link"
import { useRouter } from "next/router"

const Navigation = () => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        router.push("/login")
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link
            href="/dashboard"
            className={`hover:text-gray-300 ${router.pathname === "/dashboard" ? "text-blue-400" : ""}`}
          >
            Dashboard
          </Link>
          <Link href="/data" className={`hover:text-gray-300 ${router.pathname === "/data" ? "text-blue-400" : ""}`}>
            Data
          </Link>
        </div>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navigation

