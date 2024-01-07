import { credential } from 'firebase-admin'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { FIREBASE_SERVICE_ACCOUNT_KEY_PATH } from '~/library/constants/paths'

export const firebaseApp = initializeApp({
    credential: credential.cert(FIREBASE_SERVICE_ACCOUNT_KEY_PATH),
})

export const firestore = getFirestore(firebaseApp)
