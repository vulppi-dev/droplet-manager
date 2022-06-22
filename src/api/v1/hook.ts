import { execSync as exec } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import { StatusCodes } from 'http-status-codes'
import path from 'path'

const mainPath = process.env.APPS_PATH!
const githubKey = process.env.GITHUB_TOKEN_ACCESS!
const secret = process.env.WEBHOOK_SECRET!

export const post: RequestHandler[] = [
  async ({ body, headers }, res) => {
    console.log('PAYLOAD:', body)

    const payload = JSON.stringify(body)
    const hmac = crypto.createHmac('sha256', secret)

    let signature = 'sha256='
    signature += hmac.update(payload).digest('hex')

    if (headers['x-hub-signature-256'] === signature) {
      const repoName = body.repository.name
      const repoFullName = body.repository.full_name
      const ownerName = body.repository.owner.login
      const repoPath = path.join(mainPath, repoName)
      const pkgPath = path.join(repoPath, 'package.json')

      try {
        exec(`pm2 stop ${repoName}`)
        console.log('success stop'.green)
      } catch (err) {}

      const firstTime = !fs.existsSync(repoPath)

      if (firstTime) {
        exec(
          `cd ${mainPath} && git clone https://${ownerName}:${githubKey}@github.com/${repoFullName}`,
        )
      } else {
        exec(`cd ${repoPath} && git reset --hard && git pull`)
      }

      const hasPkg = !fs.existsSync(pkgPath)

      if (!hasPkg) {
        res.status(StatusCodes.OK).send()
        return
      }

      exec(
        `cd ${repoPath} && npm i --production=false && npm run build && npm i`,
      )

      if (firstTime) {
        try {
          exec(`pm2 start ${repoPath}`)
          exec(`pm2 save`)
          console.log('success start'.green)
        } catch (err) {}
      } else {
        try {
          exec(`pm2 restart ${repoName} --update-env`)
          console.log('success restart'.green)
        } catch (err) {}
      }

      console.log('success'.green)
      res.status(StatusCodes.OK).end()
      return
    }
    res.status(StatusCodes.UNAUTHORIZED).end()
  },
]
