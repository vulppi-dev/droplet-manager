import * as app from 'firebase-admin/app'

const config = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS || '{}')

export const getAdminApp = () => {
  const apps = app.getApps()
  if (!apps || !apps.length) {
    return app.initializeApp({
      credential: app.cert(config),
      databaseURL: `https://${config.project_id}.firebaseio.com`,
    })
  } else {
    return app.getApp()
  }
}
