#!/bin/bash

cd $(dirname $0)
cd ../

./scripts/setup.pre.sh

pnpm exec rimraf build-cli

pnpm exec tsc -p tsconfigs/tsconfig.cli.json
pnpm exec tsc-alias -p tsconfigs/tsconfig.cli.json

pnpm exec ts-node -r tsconfig-paths/register ./src/setup/post.cli.ts
