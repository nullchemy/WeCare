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
import About from './routes/About'
import Report from './routes/Report'
import BotReport from './routes/BotReport'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} errorElement={<ErrorBoundary />} />
      <Route path="/auth" element={<Auth />} errorElement={<ErrorBoundary />} />
      <Route
        path="/about"
        element={<About />}
        errorElement={<ErrorBoundary />}
      />
      <Route
        path="/report"
        element={<Report />}
        errorElement={<ErrorBoundary />}
      />
      <Route
        path="/bot-report"
        element={<BotReport />}
        errorElement={<ErrorBoundary />}
      />
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
