import { CronJob } from 'cron'
import * as invoiceJobs from './jobs/invoice'
import * as orphansJobs from './jobs/orphans'

const jobs = [] as Job[]

jobs.push(...Object.values(invoiceJobs), ...Object.values(orphansJobs))

for (const job of jobs) {
  const c = new CronJob(...job)
  c.start()
}
