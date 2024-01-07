import { z } from 'zod'
import { firestore } from '~/cli/firebase'
import AppConfigCollection from '~/library/collections/AppConfigCollection'
import { Method } from '~/library/decorators'
import AppConfigSchema from '~/library/schema/AppConfigSchema'

class AppConfigController {
    static CheckPayload = z.object({
        env: AppConfigSchema.shape['env'],
    })

    static MigratePayload = z.object({
        env: AppConfigSchema.shape['env'],
        force: z.boolean().default(false).optional(),
    })

    static CleanPayload = z.object({
        env: AppConfigSchema.shape['env'],
    })

    @Method.Timelog(true)
    async check(payload: z.infer<typeof AppConfigController.CheckPayload>) {
        const parsedPayload =
            AppConfigController.CheckPayload.required().safeParse(payload)

        if (!parsedPayload.success) {
            throw parsedPayload.error
        }

        const collectionRef = firestore.collection(AppConfigCollection.path)
        const querySnapshot = await collectionRef
            .where(
                AppConfigCollection.fileds['env'],
                '==',
                parsedPayload.data.env,
            )
            .get()

        return querySnapshot.docs.map((doc) => {
            const row = AppConfigSchema.safeParse(doc.data())
            const key = doc.id
            const value = row.success ? 'true' : row.error.toString()

            console.log(`${key}: ${value}`)

            return row
        })
    }

    @Method.Timelog(true)
    async migrate(payload: z.infer<typeof AppConfigController.MigratePayload>) {
        const parsedPayload =
            AppConfigController.MigratePayload.required().safeParse(payload)

        if (!parsedPayload.success) {
            throw parsedPayload.error
        }

        const collectionRef = firestore.collection(AppConfigCollection.path)
        const querySnapshot = await collectionRef
            .where(
                AppConfigCollection.fileds['env'],
                '==',
                parsedPayload.data.env,
            )
            .get()
        const batch = firestore.batch()

        const dataMap = new Map<
            AppConfigSchema['platform'],
            FirebaseFirestore.QueryDocumentSnapshot
        >()

        querySnapshot.docs.forEach((doc) => {
            const row = AppConfigSchema.safeParse(doc.data())

            if (!row.success || parsedPayload.data.force) {
                batch.delete(doc.ref)
                return
            }

            dataMap.set(row.data['platform'], doc)
        })

        for (const _platform in AppConfigSchema.shape['platform'].Values) {
            const platform = _platform as AppConfigSchema['platform']
            const doc = dataMap.get(platform)
            const docId = AppConfigCollection.docId({
                env: parsedPayload.data.env,
                platform,
            })
            const docRef = doc?.ref ?? collectionRef.doc(docId)
            const data = (doc?.data() ?? {
                env: parsedPayload.data.env,
                platform: platform,
                'system_maintenance:start_time': null,
                'system_maintenance:end_time': null,
                'system_maintenance:reason': null,
                'system_maintenance:allowed_backdoor': false,
                'version:minimum': null,
                'version:next': null,
                'version:next_update_time': null,
                'review:version': null,
            }) as AppConfigSchema

            batch.set(docRef, data)
        }

        return await batch.commit()
    }

    @Method.Timelog(true)
    async clean(payload: z.infer<typeof AppConfigController.CleanPayload>) {
        const parsedPayload =
            AppConfigController.CleanPayload.required().safeParse(payload)

        if (!parsedPayload.success) {
            throw parsedPayload.error
        }

        const collectionRef = firestore.collection(AppConfigCollection.path)
        const querySnapshot = await collectionRef
            .where(
                AppConfigCollection.fileds['env'],
                '==',
                parsedPayload.data.env,
            )
            .get()
        const batch = firestore.batch()

        querySnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref)
        })

        return await batch.commit()
    }
}

export default AppConfigController
