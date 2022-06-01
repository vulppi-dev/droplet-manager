import { CronJob } from 'cron'
import * as invoiceJobs from './jobs/invoice.js'

const jobs = [] as Job[]

jobs.push(...Object.values(invoiceJobs))

for (const job of jobs) {
  const c = new CronJob(...job)
  c.start()
}
