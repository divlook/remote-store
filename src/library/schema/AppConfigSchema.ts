import { z } from 'zod'

type AppConfigSchema = z.infer<typeof AppConfigSchema>

const AppConfigSchema = z.object({
    env: z.enum(['dev', 'stg', 'prod']),
    platform: z.enum(['web', 'ios', 'android']),
    /** 점검 시작 시간 */
    'system_maintenance:start_time': z.date().nullable().default(null),
    /** 점검 종료 시간 */
    'system_maintenance:end_time': z.date().nullable().default(null),
    /** 점검 사유 */
    'system_maintenance:reason': z.string().nullable().default(null),
    /**
     * 백도어 허용 여부
     */
    'system_maintenance:allowed_backdoor': z.boolean().default(false),
    /** 최소 버전 */
    'version:minimum': z.string().nullable().default(null),
    /** 다음 버전 */
    'version:next': z.string().nullable().default(null),
    /** 다음 버전 출시 시간 */
    'version:next_update_time': z.date().nullable().default(null),
    /** 심사 버전 */
    'review:version': z.string().nullable().default(null),
})

export default AppConfigSchema
