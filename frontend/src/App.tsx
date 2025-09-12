import Register from "./pages/auth/register";
import Login from "./pages/auth/login";
import Landing from "./pages/Landing"
import { createBrowserRouter,  RouterProvider } from "react-router-dom"

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Landing />,
    },
    {
      path:"/auth/register",
      element:<Register />
    },  
    {
      path:"/auth/login",
      element:<Login />
    }
  ]);

  return (
    <>
     <RouterProvider router={router} />
    </>
  )
}

export default App
