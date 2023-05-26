import fetch from 'isomorphic-unfetch';
import { RAW_GITHUB_URL, REPO_NAME } from './constants';

function getErrorText(res: Response) {
  try {
    return res.text();
  } catch (err) {
    return res.statusText;
  }
}

type GHError = Error & { status?: Response['status']; headers?: any };

async function getError(res: Response): Promise<GHError> {
  const errorText = await getErrorText(res);
  const error: GHError = new Error(
    `GitHub raw download error (${res.status}): ${errorText}`
  );

  error.status = res.status;
  error.headers = (res.headers as any).raw();

  return error;
}

export async function getRawFileFromGitHub(path: string) {
  const res = await fetch(RAW_GITHUB_URL + path);

  if (res.ok) return res.text();
  throw await getError(res);
}

export async function getRawFileFromRepo(path: string, tag: string) {
  return getRawFileFromGitHub(`/${REPO_NAME}/${tag}${path}`);
}
