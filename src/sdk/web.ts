import { FirebaseOptions, initializeApp } from 'firebase/app'
import {
    Firestore,
    Timestamp,
    connectFirestoreEmulator,
    doc,
    initializeFirestore,
    onSnapshot,
    persistentLocalCache,
    persistentMultipleTabManager,
} from 'firebase/firestore'
import { z } from 'zod'
import AppConfigCollection from '~/library/collections/AppConfigCollection'
import AppConfigSchema from '~/library/schema/AppConfigSchema'
import metadata from '~/metadata.json'

class RemoteStore {
    firestore: Firestore

    constructor(options: RemoteStore.Options) {
        const firebaseApp = initializeApp(
            options.firebaseOptions,
            `[RemoteStore#${++RemoteStore.lastIdx}]`,
        )

        this.firestore = initializeFirestore(firebaseApp, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
            }),
            ignoreUndefinedProperties: true,
        })

        if (options.firestoreEmulator) {
            connectFirestoreEmulator(
                this.firestore,
                options.firestoreEmulator.host,
                options.firestoreEmulator.port,
            )
        }
    }

    subscribeAppConfig(
        payload: AppConfigCollection.SubscribeAppConfigPayload,
        onChange?: (
            data: AppConfigSchema | null,
            getters: AppConfigCollection.Getters,
        ) => void,
    ) {
        const docRef = doc(
            this.firestore,
            AppConfigCollection.pathWithDocId(payload),
        )

        const unsubscribeAppConfig = onSnapshot(docRef, async (docSnapshot) => {
            const data = RemoteStore.parseDataFromFirestore(
                AppConfigSchema,
                docSnapshot.data(),
            )

            onChange?.(data, {
                inProgressSystemMaintenance:
                    AppConfigCollection.checkSystemMaintenance(data),
                isReviewMode: AppConfigCollection.checkReviewMode(
                    data,
                    payload.version,
                ),
                updateType: AppConfigCollection.checkUpdate(
                    data,
                    payload.version,
                ),
            })
        })

        return {
            unsubscribeAppConfig,
        }
    }

    static lastIdx = 0

    static get version() {
        return metadata.version
    }

    static parseDataFromFirestore<Schema extends z.ZodType>(
        schema: Schema,
        data: any,
    ): z.infer<Schema> | null {
        if (data && typeof data === 'object') {
            for (const key in data) {
                const value = data[key]

                if (value instanceof Timestamp) {
                    data[key] = value.toDate()
                }
            }
        }

        const parsedData = schema.safeParse(data)

        if (!parsedData.success) {
            return null
        }

        return parsedData.data
    }
}

namespace RemoteStore {
    export interface Options {
        /**
         * @see https://firebase.google.com/docs/web/learn-more?authuser=0&hl=ko#config-object
         */
        firebaseOptions: FirebaseOptions
        /**
         * 에뮬레이터를 사용할 때 입력합니다.
         *
         * @default 127.0.0.1:8080
         */
        firestoreEmulator?: {
            host: string
            port: number
        }
    }
}

export { AppConfigCollection, AppConfigSchema, RemoteStore }

export default RemoteStore
