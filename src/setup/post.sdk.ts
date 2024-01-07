import { writeFileSync } from 'fs'
import * as path from 'path'
import * as pkg from '~/../package.json'
import {
    BUILD_SDK_DIR,
    BUILD_SDK_RN_DIR,
    BUILD_SDK_WEB_DIR,
} from '~/library/constants/paths'

writeFileSync(
    path.join(BUILD_SDK_WEB_DIR, 'package.json'),
    JSON.stringify({
        main: './index.js',
        browser: './index.umd.js',
        types: './index.d.ts',
    }),
)

writeFileSync(
    path.join(BUILD_SDK_RN_DIR, 'package.json'),
    JSON.stringify({
        main: './index.mjs',
        types: './index.d.ts',
    }),
)

writeFileSync(
    path.join(BUILD_SDK_DIR, 'package.json'),
    JSON.stringify(
        {
            name: `${pkg.name}-sdk`,
            description: pkg.description,
            keywords: pkg.keywords,
            license: pkg.license,
            author: pkg.author,
            repository: pkg.repository,
            homepage: pkg.homepage,
            bugs: pkg.bugs,
            version: pkg.version,
            main: './web/index.js',
            browser: './web/index.umd.js',
            types: './web/index.d.ts',
            exports: {
                '.': {
                    types: './web/index.d.ts',
                    require: './web/index.js',
                    import: './web/index.mjs',
                    default: './web/index.umd.js',
                },
                './web': {
                    types: './web/index.d.ts',
                    require: './web/index.js',
                    import: './web/index.mjs',
                    default: './web/index.umd.js',
                },
                './react-native': {
                    types: './react-native/index.d.ts',
                    require: './react-native/index.js',
                    import: './react-native/index.mjs',
                    default: './react-native/index.mjs',
                },
            },
            dependencies: {
                zod: pkg.dependencies['zod'],
                semver: pkg.dependencies['semver'],
            },
            peerDependencies: {
                zod: pkg.dependencies['zod'],
                semver: pkg.dependencies['semver'],
            },
        },
        undefined,
        4,
    ),
)
