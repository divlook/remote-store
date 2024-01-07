#!/bin/bash

cd $(dirname $0)
cd ../

./scripts/setup.pre.sh

pnpm exec rimraf build-sdk

SDK=web pnpm exec vite build

SDK=react-native pnpm exec vite build

pnpm exec ts-node -r tsconfig-paths/register ./src/setup/post.sdk.ts
