import { NextApiRequest, NextApiResponse } from 'next';
import getNotionAssetUrls from '../../lib/notion/getNotionAssetUrls';
import { setHeaders, handleData, handleError } from '../../lib/notion/utils';

export default async function notionApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (setHeaders(req, res)) return;
  try {
    const { assetUrl, blockId } = req.query as { [k: string]: string };

    if (!assetUrl || !blockId) {
      handleData(res, {
        status: 'error',
        message: 'asset url or blockId missing',
      });
    } else {
      // we need to re-encode it since it's decoded when added to req.query
      const { signedUrls = [], ...urlsResponse } = await getNotionAssetUrls(
        res,
        assetUrl,
        blockId
      );

      if (signedUrls.length === 0) {
        console.error('Failed to get signedUrls', urlsResponse);
        return handleData(res, {
          status: 'error',
          message: 'Failed to get asset URL',
        });
      }

      res.status(307);
      res.setHeader('Location', (signedUrls as any).pop());
      res.end();
    }
  } catch (error) {
    handleError(res, error);
  }
}
