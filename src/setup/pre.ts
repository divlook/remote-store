import { writeFileSync } from 'fs'
import * as path from 'path'
import { SRC_PATH } from '~/library/constants/paths'
import * as pkg from '../../package.json'

writeFileSync(
    path.join(SRC_PATH, 'metadata.json'),
    JSON.stringify(
        {
            version: pkg.version,
        },
        undefined,
        4,
    ),
)
