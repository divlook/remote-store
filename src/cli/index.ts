import { Command, Option } from '@commander-js/extra-typings'
import AppConfigController from '~/cli/controllers/AppConfigController'
import AppConfigSchema from '~/library/schema/AppConfigSchema'
import { version } from '~/metadata.json'

const program = new Command()

program
    .name('remote-store')
    .version(version)
    .addCommand(
        (() => {
            const opts = {
                env: new Option(
                    '-e, --env <dev|stg|prod>',
                    '배포할 환경을 설정합니다.',
                )
                    .choices(['dev', 'stg', 'prod'] as AppConfigSchema['env'][])
                    .makeOptionMandatory(),
            }

            const appConfig = new AppConfigController()

            return new Command('app-config')
                .description('AppConfig Collection을 관리합니다.')
                .addCommand(
                    new Command('check')
                        .description(
                            'firestore에 생성된 document 유효성을 체크합니다.',
                        )
                        .addOption(opts.env)
                        .action(async (opt) => {
                            await appConfig.check({
                                env: opt.env,
                            })
                        }),
                )
                .addCommand(
                    new Command('migrate')
                        .description(
                            'firestore document를 local schema로 마이그레이션합니다.',
                        )
                        .addOption(opts.env)
                        .option(
                            '-f, --force',
                            '기존 data를 삭제하고 새로 생성합니다.',
                            false,
                        )
                        .action(async (opt) => {
                            await appConfig.migrate({
                                env: opt.env,
                                force: opt.force,
                            })
                        }),
                )
                .addCommand(
                    new Command('clean')
                        .description(
                            'firestore에 생성된 document를 일괄 삭제합니다.',
                        )
                        .addOption(opts.env)
                        .action(async (opt) => {
                            await appConfig.clean({
                                env: opt.env,
                            })
                        }),
                )
        })(),
    )
    .parse(process.argv)
