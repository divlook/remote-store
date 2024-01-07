import { writeFileSync } from 'fs'
import * as path from 'path'
import { BUILD_CLI_DIR } from '~/library/constants/paths'
import * as pkg from '../../package.json'

writeFileSync(
    path.join(BUILD_CLI_DIR, 'package.json'),
    JSON.stringify(
        {
            name: `${pkg.name}-cli`,
            description: pkg.description,
            keywords: pkg.keywords,
            license: pkg.license,
            author: pkg.author,
            repository: pkg.repository,
            homepage: pkg.homepage,
            bugs: pkg.bugs,
            version: pkg.version,
            bin: {
                'remote-store': './cli/index.js',
            },
            main: './cli/index.js',
            dependencies: {
                zod: pkg.dependencies['zod'],
                'firebase-admin': pkg.dependencies['firebase-admin'],
                commander: pkg.dependencies['commander'],
                '@commander-js/extra-typings':
                    pkg.dependencies['@commander-js/extra-typings'],
            },
        },
        undefined,
        2,
    ),
)
