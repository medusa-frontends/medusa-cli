import { useStore } from 'effector-react'
import React from 'react'
import { $activeRoute, RouteConfig } from '../../model'

const Route: React.FC<{ route: RouteConfig }> = ({ route }) => {
  const activeRoute = useStore($activeRoute)
  const { name, component: Component } = route
  if (name !== activeRoute) return null
  return <Component />
}

export function renderRoutes(routes: RouteConfig[]) {
  return routes.map((route) => <Route key={route.name} route={route} />)
}
