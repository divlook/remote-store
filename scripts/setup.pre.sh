#!/bin/bash

cd $(dirname $0)
cd ../

pnpm exec ts-node -r tsconfig-paths/register ./src/setup/pre.ts
