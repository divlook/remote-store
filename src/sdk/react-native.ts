import Firestore from '@react-native-firebase/firestore'
import { z } from 'zod'
import AppConfigCollection from '~/library/collections/AppConfigCollection'
import AppConfigSchema from '~/library/schema/AppConfigSchema'
import metadata from '~/metadata.json'

class RemoteStore {
    firestore: ReturnType<typeof Firestore>

    constructor(options: RemoteStore.Options) {
        this.firestore = Firestore()

        if (options.firestoreEmulator) {
            this.firestore.useEmulator(
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
        const docRef = this.firestore.doc(
            AppConfigCollection.pathWithDocId(payload),
        )

        const unsubscribeAppConfig = docRef.onSnapshot((docSnapshot) => {
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

                if (value instanceof Firestore.Timestamp) {
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
