import { execSync as exec } from 'child_process'
import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'

const scriptsPath = process.env.SCRIPTS_PATH!
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

      try {
        exec(
          `HOST="https://${ownerName}:${githubKey}@github.com/${repoFullName}" NAME="${repoName}" ${scriptsPath}/build.sh`,
        )
        console.log('success'.green)
        res.status(StatusCodes.OK).end()
        return
      } catch (err: any) {
        console.error(err.message || err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
        return
      }
    }
    res.status(StatusCodes.UNAUTHORIZED).end()
  },
]
