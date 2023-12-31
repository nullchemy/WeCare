import React, { Fragment } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'
import Home from './routes/Home'
import ErrorBoundary from './routes/ErrorBoundary'
import NotFound from './routes/NotFound'
import ProtectedRoutes from './utils/PrivateRoute'
import Chat from './routes/Chat'
import Auth from './routes/Auth'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} errorElement={<ErrorBoundary />} />
      <Route path="/auth" element={<Auth />} errorElement={<ErrorBoundary />} />
      <Route path="*" element={<NotFound />} errorElement={<ErrorBoundary />} />
        <Route
          path="/chat"
          element={<Chat />}
          errorElement={<ErrorBoundary />}
        />
      <Route element={<ProtectedRoutes />}>
      </Route>
    </>
  )
)

const Routes = () => {
  return (
    <Fragment>
      <RouterProvider router={router} />
    </Fragment>
  )
}

export default Routes
