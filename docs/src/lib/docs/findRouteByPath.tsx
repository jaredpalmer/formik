import { removeFromLast } from './utils';
import { RouteItem } from '../types';

// @ts-ignore
export function findRouteByPath(path: string, routes: RouteItem[]): RouteItem {
  // eslint-disable-next-line
  for (const route of routes) {
    if (route.path && removeFromLast(route.path, '.') === path) {
      return route;
    }
    const childPath = route.routes && findRouteByPath(path, route.routes);
    if (childPath) return childPath;
  }
}
