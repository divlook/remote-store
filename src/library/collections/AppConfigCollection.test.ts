import { describe, expect, it } from 'vitest'
import AppConfigCollection from '~/library/collections/AppConfigCollection'
import AppConfigSchema from '~/library/schema/AppConfigSchema'

describe('AppConfigCollection', () => {
    const makeAppConfig = (
        data?: Partial<AppConfigSchema>,
    ): AppConfigSchema => ({
        env: 'dev',
        platform: 'web',
        'system_maintenance:start_time': null,
        'system_maintenance:end_time': null,
        'system_maintenance:reason': null,
        'system_maintenance:allowed_backdoor': false,
        'version:minimum': null,
        'version:next': null,
        'version:next_update_time': null,
        'review:version': null,
        ...data,
    })

    describe('docId(payload): string', () => {
        it('success', () => {
            let env: AppConfigSchema['env']
            let platform: AppConfigSchema['platform']

            for (env in AppConfigSchema.shape.env.enum) {
                for (platform in AppConfigSchema.shape.platform.enum) {
                    expect(
                        AppConfigCollection.docId({
                            env,
                            platform,
                        }),
                    ).toEqual(`${env}:${platform}`)
                }
            }
        })

        it('fail', () => {
            expect(() => {
                AppConfigCollection.docId({
                    // @ts-expect-error
                    env: '_',
                    // @ts-expect-error
                    platform: '_',
                })
            }).toThrowError()

            expect(() => {
                // @ts-expect-error
                AppConfigCollection.docId()
            }).toThrowError()

            expect(() => {
                // @ts-expect-error
                AppConfigCollection.docId({})
            }).toThrowError()
        })
    })

    describe('pathWithDocId(payload): string', () => {
        it('success', () => {
            let env: AppConfigSchema['env']
            let platform: AppConfigSchema['platform']

            for (env in AppConfigSchema.shape.env.enum) {
                for (platform in AppConfigSchema.shape.platform.enum) {
                    expect(
                        AppConfigCollection.pathWithDocId({
                            env,
                            platform,
                        }),
                    ).toEqual(`${AppConfigCollection.path}/${env}:${platform}`)
                }
            }
        })

        it('fail', () => {
            expect(() => {
                AppConfigCollection.pathWithDocId({
                    // @ts-expect-error
                    env: '_',
                    // @ts-expect-error
                    platform: '_',
                })
            }).toThrowError()

            expect(() => {
                // @ts-expect-error
                AppConfigCollection.pathWithDocId()
            }).toThrowError()

            expect(() => {
                // @ts-expect-error
                AppConfigCollection.pathWithDocId({})
            }).toThrowError()
        })
    })

    describe('checkSystemMaintenance(payload): string', () => {
        it('예정된 점검이 없습니다.', () => {
            const appConfig = makeAppConfig({
                'system_maintenance:start_time': null,
                'system_maintenance:end_time': null,
            })

            expect(
                AppConfigCollection.checkSystemMaintenance(appConfig),
            ).toEqual(false)
        })

        it('예정된 점검이 있습니다.', () => {
            const now = new Date()
            const startTime = new Date()

            startTime.setDate(now.getDate() + 1)

            const appConfig = makeAppConfig({
                'system_maintenance:start_time': startTime,
                'system_maintenance:end_time': null,
            })

            expect(
                AppConfigCollection.checkSystemMaintenance(appConfig),
            ).toEqual(false)
        })

        it('점검 중입니다. startTime: -1, endTime: null', () => {
            const now = new Date()
            const startTime = new Date()

            startTime.setDate(now.getDate() - 1)

            expect(
                AppConfigCollection.checkSystemMaintenance(
                    makeAppConfig({
                        'system_maintenance:start_time': startTime,
                        'system_maintenance:end_time': null,
                    }),
                ),
            ).toEqual(true)
        })

        it('점검 중입니다. startTime: -1, endTime: +1', () => {
            const now = new Date()
            const startTime = new Date()
            const endTime = new Date()

            startTime.setDate(now.getDate() - 1)
            endTime.setDate(now.getDate() + 1)

            expect(
                AppConfigCollection.checkSystemMaintenance(
                    makeAppConfig({
                        'system_maintenance:start_time': startTime,
                        'system_maintenance:end_time': endTime,
                    }),
                ),
            ).toEqual(true)
        })

        it('점검 중입니다. startTime: -1, endTime: -2', () => {
            const now = new Date()
            const startTime = new Date()
            const endTime = new Date()

            startTime.setDate(now.getDate() - 1)
            endTime.setDate(now.getDate() - 2)

            expect(
                AppConfigCollection.checkSystemMaintenance(
                    makeAppConfig({
                        'system_maintenance:start_time': startTime,
                        'system_maintenance:end_time': endTime,
                    }),
                ),
            ).toEqual(true)
        })

        it('점검이 종료되었습니다.', () => {
            const now = new Date()
            const startTime = new Date()
            const endTime = new Date()

            startTime.setDate(now.getDate() - 2)
            endTime.setDate(now.getDate() - 1)

            expect(
                AppConfigCollection.checkSystemMaintenance(
                    makeAppConfig({
                        'system_maintenance:start_time': startTime,
                        'system_maintenance:end_time': endTime,
                    }),
                ),
            ).toEqual(false)
        })
    })

    describe('checkUpdate(payload): string', () => {
        const now = new Date()

        it('IF minimum ≤ current AND next ≤ current', () => {
            expect(
                (() => {
                    return AppConfigCollection.checkUpdate(
                        makeAppConfig({
                            'version:minimum': '0.9.0',
                        }),
                        '1.0.0',
                    )
                })(),
            ).toEqual(AppConfigCollection.UpdateType.NONE)

            expect(
                (() => {
                    return AppConfigCollection.checkUpdate(
                        makeAppConfig({
                            'version:next': '0.9.0',
                        }),
                        '1.0.0',
                    )
                })(),
            ).toEqual(AppConfigCollection.UpdateType.NONE)

            expect(
                (() => {
                    return AppConfigCollection.checkUpdate(
                        makeAppConfig({
                            'version:minimum': '0.9.0',
                            'version:next': '0.9.0',
                        }),
                        '1.0.0',
                    )
                })(),
            ).toEqual(AppConfigCollection.UpdateType.NONE)

            expect(
                (() => {
                    const updateTime = new Date()

                    updateTime.setDate(now.getDate() - 1)

                    return AppConfigCollection.checkUpdate(
                        makeAppConfig({
                            'version:minimum': '0.9.0',
                            'version:next': '0.9.0',
                            'version:next_update_time': updateTime,
                        }),
                        '1.0.0',
                    )
                })(),
            ).toEqual(AppConfigCollection.UpdateType.NONE)
        })

        describe('IF next_update_time = null', () => {
            it('IF current < minimum', () => {
                expect(
                    (() => {
                        return AppConfigCollection.checkUpdate(
                            makeAppConfig({
                                'version:minimum': '1.5.0',
                            }),
                            '1.0.0',
                        )
                    })(),
                ).toEqual(AppConfigCollection.UpdateType.REQUIRED)
            })

            it('ELSE', () => {
                expect(
                    (() => {
                        return AppConfigCollection.checkUpdate(
                            makeAppConfig({
                                'version:minimum': '1.5.0',
                            }),
                            '1.6.0',
                        )
                    })(),
                ).toEqual(AppConfigCollection.UpdateType.NONE)
            })
        })

        describe('IF next ≠ null AND next_update_time ≤ now', () => {
            it('IF next ≤ minimum', () => {
                expect(
                    (() => {
                        const updateTime = new Date()

                        updateTime.setDate(now.getDate() - 1)

                        return AppConfigCollection.checkUpdate(
                            makeAppConfig({
                                'version:minimum': '1.5.0',
                                'version:next': '1.5.0',
                                'version:next_update_time': updateTime,
                            }),
                            '1.0.0',
                        )
                    })(),
                ).toEqual(AppConfigCollection.UpdateType.REQUIRED)

                expect(
                    (() => {
                        const updateTime = new Date()

                        updateTime.setDate(now.getDate() - 1)

                        return AppConfigCollection.checkUpdate(
                            makeAppConfig({
                                'version:minimum': '1.5.2',
                                'version:next': '1.5.0',
                                'version:next_update_time': updateTime,
                            }),
                            '1.0.0',
                        )
                    })(),
                ).toEqual(AppConfigCollection.UpdateType.REQUIRED)
            })

            it('ELSE', () => {
                expect(
                    (() => {
                        const updateTime = new Date()

                        updateTime.setDate(now.getDate() - 1)

                        return AppConfigCollection.checkUpdate(
                            makeAppConfig({
                                'version:next': '1.5.0',
                                'version:next_update_time': updateTime,
                            }),
                            '1.0.0',
                        )
                    })(),
                ).toEqual(AppConfigCollection.UpdateType.OPTIONAL)

                expect(
                    (() => {
                        const updateTime = new Date()

                        updateTime.setDate(now.getDate() - 1)

                        return AppConfigCollection.checkUpdate(
                            makeAppConfig({
                                'version:minimum': '0.9.0',
                                'version:next': '1.5.0',
                                'version:next_update_time': updateTime,
                            }),
                            '1.0.0',
                        )
                    })(),
                ).toEqual(AppConfigCollection.UpdateType.OPTIONAL)

                expect(
                    (() => {
                        const updateTime = new Date()

                        updateTime.setDate(now.getDate() - 1)

                        return AppConfigCollection.checkUpdate(
                            makeAppConfig({
                                'version:minimum': '1.0.0',
                                'version:next': '1.5.0',
                                'version:next_update_time': updateTime,
                            }),
                            '1.0.0',
                        )
                    })(),
                ).toEqual(AppConfigCollection.UpdateType.OPTIONAL)

                expect(
                    (() => {
                        const updateTime = new Date()

                        updateTime.setDate(now.getDate() - 1)

                        return AppConfigCollection.checkUpdate(
                            makeAppConfig({
                                'version:minimum': '1.2.0',
                                'version:next': '1.5.0',
                                'version:next_update_time': updateTime,
                            }),
                            '1.0.0',
                        )
                    })(),
                ).toEqual(AppConfigCollection.UpdateType.OPTIONAL)
            })
        })

        describe('ELSE', () => {
            it('IF next ≠ null AND next_update_time > now', () => {
                expect(
                    (() => {
                        const updateTime = new Date()

                        updateTime.setDate(now.getDate() + 1)

                        return AppConfigCollection.checkUpdate(
                            makeAppConfig({
                                'version:minimum': '1.5.0',
                                'version:next': '1.5.0',
                                'version:next_update_time': updateTime,
                            }),
                            '1.0.0',
                        )
                    })(),
                ).toEqual(AppConfigCollection.UpdateType.NONE)
            })

            it('IF next = null AND next_update_time ≤ now', () => {
                expect(
                    (() => {
                        const updateTime = new Date()

                        updateTime.setDate(now.getDate() - 1)

                        return AppConfigCollection.checkUpdate(
                            makeAppConfig({
                                'version:minimum': '1.5.0',
                                'version:next': null,
                                'version:next_update_time': updateTime,
                            }),
                            '1.0.0',
                        )
                    })(),
                ).toEqual(AppConfigCollection.UpdateType.NONE)
            })
        })
    })

    describe('checkReviewMode(payload, version): string', () => {
        it('심사 버전 정보 없습니다.', () => {
            expect(
                AppConfigCollection.checkReviewMode(
                    makeAppConfig({
                        'review:version': null,
                    }),
                    '1.0.0',
                ),
            ).toEqual(false)
        })

        it('심사 버전과 일치합니다.', () => {
            expect(
                AppConfigCollection.checkReviewMode(
                    makeAppConfig({
                        'review:version': '1.0.0',
                    }),
                    '1.0.0',
                ),
            ).toEqual(true)
        })

        it('심사 버전이 아닙니다.', () => {
            expect(
                AppConfigCollection.checkReviewMode(
                    makeAppConfig({
                        'review:version': '1.0.1',
                    }),
                    '1.0.0',
                ),
            ).toEqual(false)
        })
    })
})
