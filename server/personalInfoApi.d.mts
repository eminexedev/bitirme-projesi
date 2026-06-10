import type { IncomingMessage, ServerResponse } from 'node:http';

export function personalInfoApiHandler(req: IncomingMessage, res: ServerResponse): Promise<boolean>;
