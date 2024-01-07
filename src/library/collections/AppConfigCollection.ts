import semver from 'semver'
import { z } from 'zod'
import AppConfigSchema from '~/library/schema/AppConfigSchema'

namespace AppConfigCollection {
    export enum UpdateType {
        NONE,
        OPTIONAL,
        REQUIRED,
    }

    export interface Getters {
        /**
         * 시스템 점검 중인지
         */
        inProgressSystemMaintenance: boolean
        /**
         * 심사 모드 여부
         */
        isReviewMode: boolean
        updateType: UpdateType
    }

    export const path = 'app_config'

    export type DocIdPlayload = z.infer<typeof DocIdPlayload>
    export const DocIdPlayload = z.object({
        env: AppConfigSchema.shape.env,
        platform: AppConfigSchema.shape.platform,
    })

    export type SubscribeAppConfigPayload = z.infer<
        typeof SubscribeAppConfigPayload
    >
    export const SubscribeAppConfigPayload = z.objectUtil.mergeShapes(
        DocIdPlayload,
        z.object({
            version: z.string(),
        }),
    )

    export const fileds = AppConfigSchema.keyof().Values

    export const docId = (payload: DocIdPlayload) => {
        const parsedPayload = DocIdPlayload.safeParse(payload)

        if (!parsedPayload.success) {
            throw new Error('Invalid parameter')
        }

        const { env, platform } = parsedPayload.data

        return `${env}:${platform}`
    }

    export const pathWithDocId = (payload: DocIdPlayload) => {
        const docId = AppConfigCollection.docId(payload)

        return `${AppConfigCollection.path}/${docId}`
    }

    /**
     * 시스템 점검 중인지 확인
     */
    export const checkSystemMaintenance = (
        store: AppConfigSchema | null = null,
    ): boolean => {
        if (!store) {
            return false
        }

        const now = new Date()
        const startTime = store['system_maintenance:start_time']
        const endTime = store['system_maintenance:end_time']

        // 점검이 예정되지 않음
        if (!startTime) {
            return false
        }

        // 점검이 시작되지 않음
        if (now < startTime) {
            return false
        }

        // 점검이 종료됨
        if (endTime && startTime < endTime && endTime <= now) {
            return false
        }

        return true
    }

    /**
     * 업데이트 확인
     */
    export const checkUpdate = (
        store: AppConfigSchema | null = null,
        version: string,
    ): UpdateType => {
        if (!store || !semver.valid(version)) {
            return UpdateType.NONE
        }

        const now = new Date()
        const minimum = semver.valid(store['version:minimum'])
        const next = semver.valid(store['version:next'])
        const nextUpdateTime = store['version:next_update_time']

        /**
         * minimum <= current AND next ≤ current
         */
        const isLatest = (() => {
            const range: string[] = []

            if (minimum) range.push(`>=${minimum}`)
            if (next) range.push(`>=${next}`)
            if (range.length === 0) return true

            return semver.satisfies(version, range.join(' '))
        })()

        if (isLatest) {
            return UpdateType.NONE
        }

        if (!nextUpdateTime) {
            // current < minimum
            return minimum && semver.lt(version, minimum)
                ? UpdateType.REQUIRED
                : UpdateType.NONE
        }

        if (next && nextUpdateTime <= now) {
            /**
             * next ≤ minimum
             */
            if (!!minimum && semver.lte(next, minimum)) {
                return UpdateType.REQUIRED
            }

            return UpdateType.OPTIONAL
        }

        return UpdateType.NONE
    }

    /**
     * 심사모드인지 확인
     */
    export const checkReviewMode = (
        store: AppConfigSchema | null = null,
        version: string,
    ): boolean => {
        if (!store?.['review:version']) {
            return false
        }

        return store['review:version'] === version
    }
}

export default AppConfigCollection
