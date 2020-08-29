import { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.slug) {
    res.clearPreviewData();
    res.writeHead(307, { Location: `/blog/${req.query.slug}` });
    res.end();
  } else {
    res.clearPreviewData();
    res.writeHead(307, { Location: `/blog` });
    res.end();
  }
};
