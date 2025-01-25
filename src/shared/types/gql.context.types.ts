import type { Request, Response } from 'express'

export interface GpContext {
	req: Request
	res: Response
}
