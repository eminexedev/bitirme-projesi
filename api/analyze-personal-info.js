import { personalInfoApiHandler } from '../server/personalInfoApi.mjs';

export default async function handler(req, res) {
  req.url = '/api/analyze-personal-info';
  const handled = await personalInfoApiHandler(req, res);

  if (!handled) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'not_found' }));
  }
}
