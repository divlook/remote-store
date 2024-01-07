import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import z from 'zod'
import {
    BUILD_SDK_RN_DIR,
    BUILD_SDK_WEB_DIR,
    SRC_PATH,
} from './src/library/constants/paths.ts'

const SDK = z
    .enum(['web', 'react-native'])
    .default('web')
    .parse(process.env.SDK)

const OUT_DIR = (() => {
    switch (SDK) {
        case 'web':
            return BUILD_SDK_WEB_DIR
        case 'react-native':
            return BUILD_SDK_RN_DIR
    }
})()

const config = defineConfig({
    resolve: {
        alias: {
            '~': SRC_PATH,
        },
    },
    build: {
        lib: {
            entry: {
                index: path.join(SRC_PATH, `sdk/${SDK}.ts`),
            },
            formats: SDK === 'web' ? ['cjs', 'es', 'umd'] : ['cjs', 'es'],
            name: 'RemoteStore',
        },
        rollupOptions: {
            external: ['zod', 'semver', /@react-native-firebase\/.+/],
            output: {
                exports: 'named',
            },
        },
        outDir: OUT_DIR,
        sourcemap: true,
    },
    plugins: [
        dts({
            insertTypesEntry: true,
            exclude: ['**/*.test.ts'],
            include: ['src/sdk', 'src/library'],
        }),
    ],
})

export default config
