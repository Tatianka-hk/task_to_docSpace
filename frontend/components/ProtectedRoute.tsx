import { useEffect, useState } from "react"
import { useRouter } from "next/router"

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json", 
          },
          method: "GET",
        })
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute

