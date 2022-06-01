import type { RequestHandler } from 'express'

export const get: RequestHandler[] = [
  async ({}, res) => {
    res.json({
      message: 'Vulppi Jobs API v1',
    })
  },
]
