import { getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from '../services/firebase.js'

const admin = getAdminApp()
const db = getFirestore(admin)

export const projectInvoiceGenerator: Job = ['0 0 8 20 * *', () => {}]
