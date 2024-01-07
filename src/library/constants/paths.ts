import { join, resolve } from 'path'

export const ROOT_PATH = resolve(__dirname, '../../../')

export const SRC_PATH = join(ROOT_PATH, 'src')

export const FIREBASE_SERVICE_ACCOUNT_KEY_PATH = join(
    process.cwd(),
    'firebase.service-account-key.json',
)

export const BUILD_SDK_DIR = join(ROOT_PATH, 'build-sdk')

export const BUILD_SDK_WEB_DIR = join(BUILD_SDK_DIR, 'web')

export const BUILD_SDK_RN_DIR = join(BUILD_SDK_DIR, 'react-native')

export const BUILD_CLI_DIR = join(ROOT_PATH, 'build-cli')
