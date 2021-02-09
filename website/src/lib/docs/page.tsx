import { getLatestTag } from '../github/api';
import { getRawFileFromRepo } from '../github/raw';
import { removeFromLast } from './utils';
import { TAG, FORCE_TAG } from './config';
import { RouteItem } from '../types';
import util from 'util';
import fs from 'fs';
import { join } from 'path';

const read = util.promisify(fs.readFile);

export async function getCurrentTag(tag?: string) {
  if (tag) return tag;
  if (FORCE_TAG) return TAG;
  return getLatestTag();
}

const postsDirectory = join(process.cwd(), '../.');

export async function getRawFileFromLocal(path: string) {
  const fullPath = join(postsDirectory, path);
  const fileContents = await read(fullPath, 'utf8');
  return fileContents;
}

export async function fetchLocalDocsManifest() {
  const routes = await getRawFileFromLocal('/docs/manifest.json');
  return JSON.parse(routes);
}

export async function fetchRemoteDocsManifest(tag: string) {
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
