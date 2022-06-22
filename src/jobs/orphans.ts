import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from '../services/firebase.js'

/**
 * every day 1:00 am check for orphaned projects
 */
export const computeOrphans: Job = [
  '0 0 1 * * *',
  async () => {
    const app = getAdminApp()
    const db = getFirestore(app)
    const projectsRef = db.collection('projects')
    const usersRef = db.collection('users')

    const projectsMap: Record<string, string[]> = {}

    const projectsSnapshot = await projectsRef.get()

    projectsSnapshot.docs.forEach((doc) => {
      projectsMap[doc.id] = []
    })

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
          projectsMap[pid].push(userDoc.id)
        }
      }),
    )

    console.log(`found ${Object.keys(projectsMap).length} projects`)

    for (const entry of Object.entries(projectsMap)) {
      const projectId = entry[0]
      const userIds = entry[1]

      if (userIds.length > 0) {
        await projectsRef.doc(projectId).set(
          {
            orphaned: FieldValue.delete(),
          },
          { merge: true },
        )
      } else {
        console.log(`orphaned project ${projectId}`)
        await projectsRef.doc(projectId).set(
          {
            orphaned: new Date(),
          },
          { merge: true },
        )
      }
    }
  },
]

/**
 * every day 1:00 am if a project has been orphaned for more than two months,
 * delete it
 */
export const deleteOrphanedProjects: Job = [
  '0 0 1 * * *',
  async () => {
    const app = getAdminApp()
    const db = getFirestore(app)
    const projectsRef = db.collection('projects')

    const projectsSnapshot = await projectsRef
      .where('orphaned', '>', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))
      .get()

    console.log(`found ${projectsSnapshot.size} orphaned projects`)

    await Promise.all(
      projectsSnapshot.docs.map(async (doc) => {
        await db.recursiveDelete(doc.ref)
        await db.recursiveDelete(db.collection('tools-data').doc(doc.id))
      }),
    )
  },
]
