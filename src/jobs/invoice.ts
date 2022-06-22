import {
  CollectionReference,
  DocumentData,
  Firestore,
  getFirestore,
} from 'firebase-admin/firestore'
import { getAdminApp } from '../services/firebase'

/**
 * Map of projects with user ids
 */
const getProjectsToInvoiceMap = async (
  projectsRef: CollectionReference<DocumentData>,
  usersRef: CollectionReference<DocumentData>,
) => {
  const projectsMap: Record<string, string[]> = {}

  const projectsSnapshot = await projectsRef.get()

  for (const doc of projectsSnapshot.docs) {
    const data = doc.data()
    if (data.orphaned) continue

    projectsMap[doc.id] = []

    if (data?.invoiceCustomerId) {
      projectsMap[doc.id].push(data.invoiceCustomerId)
    }
  }

  const usersSnapshot = await usersRef.get()

  await Promise.all(
    usersSnapshot.docs.map(async (userDoc) => {
      const adminClaim = await userDoc.ref
        .collection('claims')
        .doc('admin')
        .get()
      const adminClaimData = adminClaim.data() || {}
      const adminClaimProjects = adminClaimData.projects || []
      for (const pid of adminClaimProjects) {
        if (!projectsMap[pid]) continue

        projectsMap[pid].push(userDoc.id)
      }
    }),
  )

  return projectsMap
}

/**
 * Map of tools with your plans
 */
const getToolsPlansMap = async (db: Firestore) => {
  const toolsPlansMap: Record<string, Record<string, any>> = {}
  const toolsSnapshot = await db.collection('market-tools').get()

  for (const doc of toolsSnapshot.docs) {
    const data = doc.data()
    const limit = data?.tierLimits || []

    toolsPlansMap[doc.id] = limit.reduce((acc: any, cur: any) => {
      acc[cur.tier] = {
        price: cur.price,
        priceCalc: cur.priceCalc,
      }
      return acc
    }, {})
  }

  return toolsPlansMap
}

/**
 * Calculate amount based in the plan
 */
const calcAmount = (plan: any, size: number = 1) => {
  // eval use this to calculate the price
  const q = size
  const p = plan.price as number

  let amount = p
  if (plan.planCalc) {
    amount = eval(plan.planCalc)
  }
  return Math.ceil(amount * 100)
}

/**
 * Merge invoices
 */

const mergeInvoices = (invoice: Invoice, ...invoices: Invoice[]) => {
  const merged: Invoice = JSON.parse(JSON.stringify(invoice))

  for (const i of invoices) {
    merged.uid = merged.uid
      .concat(i.uid)
      .filter((v, i, a) => a.indexOf(v) === i)
    merged.items = merged.items.concat(i.items)
  }
  return merged
}

/**
 * get total value of invoice
 */
const getTotal = (invoice: Invoice) => {
  return invoice.items.reduce((acc, cur) => acc + cur.amount, 0)
}

/**
 * every day 20 in 8:00 am generate invoice for all projects than not orphaned
 */
export const computeInvoiceForProjects: Job = [
  '0 0 8 20 * *',
  async () => {
    const app = getAdminApp()
    const db = getFirestore(app)
    const projectsRef = db.collection('projects')
    const usersRef = db.collection('users')

    const projectsMap = await getProjectsToInvoiceMap(projectsRef, usersRef)
    const toolsPlansMap = await getToolsPlansMap(db)

    for (const entry of Object.entries(projectsMap)) {
      const projectId = entry[0]
      const userIds = entry[1].filter((id, i, l) => l.indexOf(id) === i)

      if (userIds.length > 0) {
        // create invoice
        let invoice: Invoice = {
          uid: userIds,
          pid: projectId,
          items: [],
        }

        const projectMeta = await projectsRef
          .doc(projectId)
          .collection('meta')
          .get()

        for (const doc of projectMeta.docs) {
          const meta = doc.data() as ToolMeta
          const plan = toolsPlansMap[doc.id][meta.tier]

          if (plan) {
            const amount = calcAmount(plan, meta.size)

            invoice.items.push({
              amount,
              description: meta.name,
              createdAt: new Date(),
            })
          }
        }

        const projectSystemInvoicePool = await projectsRef
          .doc(projectId)
          .collection('system')
          .doc('invoice-pool')
          .get()

        if (projectSystemInvoicePool.exists) {
          invoice = mergeInvoices(
            invoice,
            projectSystemInvoicePool.data() as Invoice,
          )
        }

        const total = getTotal(invoice)

        if (total > 100) {
          const invoicesRef = db.collection('invoices')
          await invoicesRef.add(invoice)
          await projectSystemInvoicePool.ref.delete()
        } else {
          projectSystemInvoicePool.ref.set(invoice)
        }
      }
    }
  },
]
