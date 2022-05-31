import cors from 'cors'
import express, { NextFunction, Request, Response, Router } from 'express'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

type TypeMethods = 'get' | 'post' | 'put' | 'delete'

const ALLOW_ORIGINS = (process.env.ALLOW_ORIGINS || '').split(/; */g)
const NEW_VALUES_LIMIT = process.env.NEW_VALUES_LIMIT || '10mb'

const requestParser = (req: Request, res: Response, next: NextFunction) => {
  function recursiveParse(obj: Record<string, any> = {}) {
    for (let r in obj) {
      switch (true) {
        case Array.isArray(obj[r]) || typeof obj[r]:
          recursiveParse(obj[r])
          break
        case /^(yes|y|true|t|on|sim|s)$/i.test(obj[r]):
          obj[r] = true
          break
        case /^(no|n|false|f|off|nao|n)$/i.test(obj[r]):
          obj[r] = false
          break
        case !isNaN(+obj[r]):
          obj[r] = +obj[r]
          break
      }
    }
  }

  recursiveParse(req.query)
  next()
}

const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
  const files = readdirSync(dirPath)
  files.forEach((file) => {
    if (statSync(join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(join(dirPath, file), arrayOfFiles)
    } else {
      arrayOfFiles.push(join(dirPath, file))
    }
  })
  return arrayOfFiles
}

export default async function configureExpressRoutes(app: Router) {
  app.use(
    cors((req, cb) => {
      const origin = req.header('Origin') || '*'

      if (ALLOW_ORIGINS.includes(origin)) {
        cb(null, { origin: true })
      } else {
        cb(null, { origin: false })
      }
    }),
  )
  // parse application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: false }))
  // parse application/json
  app.use(
    express.json({
      limit: NEW_VALUES_LIMIT,
    }),
  )
  app.use(requestParser)

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    err && console.error(err)
    res.status(500).json({ message: 'Something broke!' })
  })

  const basePath = join(process.cwd(), 'dist')
  const files = getAllFiles(join(basePath, 'api')).reverse()

  for (let path of files) {
    const module = await import('file://' + path)
    const route = path
      .replace(basePath, '')
      .replace(/\\|\//g, '/')
      .replace(/.[a-z0-1]+$/, '')
      .replace(/\/index$/, '')

    if (route.includes('/_')) continue

    console.debug('Open route:', route)

    for (let key of Object.keys(module)) {
      if (!['get', 'post', 'put', 'delete'].includes(key)) {
        continue
      }

      app[key as TypeMethods](
        route,
        ...(Array.isArray(module[key]) ? module[key] : [module[key]]),
      )
    }
  }
}
