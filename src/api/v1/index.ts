export const get: RequestHandler[] = [
  async ({}, res) => {
    res.json({
      message: 'Vulppi API v1',
    })
  },
]
