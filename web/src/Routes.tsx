import React, { Fragment } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'
import Home from './routes/Home'
import Test from './routes/Test'
import ErrorBoundary from './routes/ErrorBoundary'
import NotFound from './routes/NotFound'
import ProtectedRoutes from './utils/PrivateRoute'
import Chat from './routes/Chat'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} errorElement={<ErrorBoundary />} />
      <Route path="/test" element={<Test />} errorElement={<ErrorBoundary />} />
      <Route path="*" element={<NotFound />} errorElement={<ErrorBoundary />} />
      <Route element={<ProtectedRoutes />}>
        <Route
          path="/chat"
          element={<Chat />}
          errorElement={<ErrorBoundary />}
        />
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
