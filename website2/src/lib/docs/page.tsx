import { getLatestTag } from '../github/api';
import { getRawFileFromRepo } from '../github/raw';
import { removeFromLast } from './utils';
import { TAG, FORCE_TAG } from './config';
import { RouteItem } from '../types';

export async function getCurrentTag(tag?: string) {
  if (tag) return tag;
  if (FORCE_TAG) return TAG;
  return getLatestTag();
}

export async function fetchDocsManifest(tag: string) {
  const res = await getRawFileFromRepo('/docs/manifest.json', tag);
  return JSON.parse(res);
}

export function getPaths(
  nextRoutes: RouteItem[],
  carry: string[] = []
): string[] {
  nextRoutes.forEach(({ path, routes }) => {
    if (path) {
      carry.push(removeFromLast(path, '.'));
    } else if (routes) {
      getPaths(routes, carry);
    }
  });

  return carry;
}
