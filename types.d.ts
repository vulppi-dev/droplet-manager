declare type Job = [string, VoidFunction]

declare interface InvoiceItem {
  quantity?: number
  amount: number
  currency?: string
  description: string
  createdAt: import('firebase-admin/firestore').Timestamp | Date
}

declare interface Invoice {
  uid: string[]
  pid: string
  items: InvoiceItem[]
  defaultTaxRates?: string[]
  description?: string
  status?: string
  emails?: string[]
  stripeCustomerId?: string
  stripeInvoiceId?: string
  stripeInvoiceUrl?: string
}

declare interface ToolMeta {
  name: string
  size: number
  tier: number
  [k: string]: any
}
