# README

Remote store with Firestore


## Structure

| path | description
| - | -
| src/library | Commonly used things
| src/cli | CLI directory
| src/sdk | SDK directory
| examples/react-native | React-Native example directory
| examples/web | React-Native web directory
| build-* | Build directory

### CLI peer dependencies

- zod
- firebase-admin
- commander
- @commander-js/extra-typings

### SDK/Web peer dependencies

- zod
- semver

### SDK/ReactNative peer dependencies

- zod
- semver
- @react-native-firebase/firestore


## Setup

```bash
$ nvm use
$ npm i --global pnpm
$ npm i --global firebase-tools
$ firebase login
$ firebase setup:emulators:firestore
$ pnpm i
```

### Firebase 서비스 계정 키 생성

- `https://console.firebase.google.com/project/<project_id>/settings/serviceaccounts/adminsdk?hl=ko` 접속
- 새 비공개 키 생성
- `<workdir>/firebase.service-account-key.json` 경로에 다운로드


## CI/CD

### Firebase 서비스 계정 키 설정

1. 서비스 계정 키를 base64로 인코딩하여 복사합니다.

  ```bash
  base64 -i firebase.service-account-key.json | pbcopy
  ```

2. CI/CD 환경에(Github Action 등) 환경변수 FIREBASE_SERVICE_ACCOUNT_KEY를 생성하고 복사한 값을 등록합니다.

3. CI/CD pipeline 적당한 위치에 아래 명령어를 추가합니다.

  ```bash
  $ echo $FIREBASE_SERVICE_ACCOUNT_KEY | base64 -d -o firebase.service-account-key.json
  ```


## How to use CLI

```bash
$ pnpm run firebase:emulators
$ pnpm run cli:dev app-config -h

Usage: remote-store app-config [options] [command]

AppConfig Collection을 관리합니다.

Options:
  -h, --help         display help for command

Commands:
  check [options]    firestore에 생성된 document 유효성을 체크합니다.
  migrate [options]  firestore document를 local schema로 마이그레이션합니다.
  clean [options]    firestore에 생성된 document를 일괄 삭제합니다.
```

### CLI: app-config check

```bash
$ pnpm run cli:dev app-config check -h

Usage: remote-store app-config check [options]

firestore에 생성된 document 유효성을 체크합니다.

Options:
  -e, --env <dev|stg|prod>  배포할 환경을 설정합니다. (choices: "dev", "stg", "prod")
```

### CLI: app-config migrate

```bash
$ pnpm run cli:dev app-config migrate -h

Usage: remote-store app-config migrate [options]

firestore document를 local schema로 마이그레이션합니다.

Options:
  -e, --env <dev|stg|prod>  배포할 환경을 설정합니다. (choices: "dev", "stg", "prod")
  -f, --force                  기존 data를 삭제하고 새로 생성합니다. (default: false)
```

### CLI: app-config clean

```bash
$ pnpm run cli:dev app-config clean -h

Usage: remote-store app-config clean [options]

firestore에 생성된 document를 일괄 삭제합니다.

Options:
  -e, --env <dev|stg|prod>  배포할 환경을 설정합니다. (choices: "dev", "stg", "prod")
```


## How to use SDK

### SDK: Enable emulator

```bash
pnpm run firebase:emulators
pnpm run cli:dev app-config migrate -e dev
```

### SDK: Web Install

```bash
cd <project_dir>
pnpm add zod semver

pnpm add ../remote-store/build-sdk
# OR
pnpm add @divlook/remote-store-sdk
```

### SDK: Web Example

```bash
pnpm sdk:build

cd ./examples/web
pnpm i
pnpm dev
```

```ts
import RemoteStore from '@divlook/remote-store-sdk/web'

const remoteStore = new RemoteStore({
    /**
     * @see https://firebase.google.com/docs/web/learn-more?authuser=0&hl=ko#config-object
     */
    firebaseOptions: {
      ...
    },
})

const { unsubscribeAppConfig } = remoteStore.subscribeAppConfig(
    {
        platform: 'web',
        env: 'dev',
        version: '1.0.0',
    },
    (changedData, getters) => {
        if (getters.inProgressSystemMaintenance) {
            console.log('시스템 점검 중')
        }

        if (getters.isReviewMode) {
            console.log('심사 중')
        }

        switch (getters.updateType) {
            case AppConfigCollection.UpdateType.REQUIRED:
                console.log('required update')
                break

            case AppConfigCollection.UpdateType.OPTIONAL:
                console.log('optional update')
                break

            default:
                console.log('no update')
                break
        }
    },
)
```

### SDK: React-Native Install

```bash
cd <project_dir>
pnpm add zod semver @react-native-firebase/firestore
pnpm add @divlook/remote-store-sdk
```

### SDK: React-Native Settings

- metro.config.js

  ```diff
  const config = {...}

  + config.resolver.sourceExts.push('cjs')
  + config.resolver.sourceExts.push('mjs')

  module.exports = config
  ```

### SDK: React-Native Example

- [Android Setup](https://rnfirebase.io/#2-react-native-cli---android-setup)
- [iOS Setup](https://rnfirebase.io/#3-react-native-cli---ios-setup)
- [Expo Managed Workflow](https://rnfirebase.io/#expo-managed-workflow)

```bash
pnpm sdk:build

cd ./examples/react-native
npm i
npx expo prebuild --clean
npm run ios
# OR
npm run android
```

코드는 [examples/react-native/App.js](https://github.com/divlook/remote-store/blob/3e2f3e5d16474df42d0e9e861597d283fe98b467/examples/react-native/App.js#L1-L56) 파일을 참고해주세요.

https://github.com/divlook/remote-store/blob/3e2f3e5d16474df42d0e9e861597d283fe98b467/examples/react-native/App.js#L1-L56

### SDK: Update scenario

- IF minimum ≤ current AND next ≤ current
  - latest
- IF next_update_time = null
  - IF current < minimum
    - required update
  - ELSE
    - no update
- IF next ≠ null AND next_update_time ≤ now
  - IF next ≤ minimum
    - required update
  - ELSE
    - optional update
- ELSE
  - no update

```
flowchart TD
    A[start] --> B{IF minimum ≤ current AND next ≤ current}
    B --> |YES| BA[latest]
    B --> |NO| BB{IF next_update_time = null}
    BB --> |YES| BBA{IF current < minimum}
    BB --> |NO| BBB{IF next ≠ null AND next_update_time ≤ now}
    BBA --> |YES| BBAA[required update]
    BBA --> |NO| BBAB[no update]
    BBB --> |YES| BBBA{IF next ≤ minimum}
    BBB --> |NO| BBBB[no update]
    BBBA --> |YES| BBBAA[required update]
    BBBA --> |NO| BBBAB[optional update]
```

[![](https://mermaid.ink/svg/pako:eNp1ktFOgzAUhl-lOddsGZSyjagJZJp44byYNwrL0kDniNDOrmSbyAP4Fl74ZD6JBQIRor2iPf_5zhdyCohEzMCFbSqO0Y5KhR4WIUf6eMFB6fsajUZXyC9ub1CW8CTLM_T98YWiXErGFfKWC8TZSf1-LBuAX3e-P16v3pHvBSlV7KDWvdryXpdqdsXY5PtYhzYqyRi6RDxP0xbVY_le1dEaXLReg2zD7uBa8LNGdsq9cZU-F8eO4fUHeoFkr3kiWYyarvUg2Ezz_ICLYaLv3sh3v2zo3pf_E-cNeP-79eUqO7FXieA0bZNgQMZkRpNY70BR9YWgdixjIbj6M6byJYSQlzpHcyVWZx6Bq2TODGgIi4Q-S5qBu6XpQb_uKQe3gBO4GOOxYznYnDnmxJrahBhwBte2xoQQi2DLsfEcm05pwJsQmjAZTwmx55hYpjOfYGdGatxTXWxmsjhRQt41K1tvbvkD25nd6A?type=png)](https://mermaid.live/edit#pako:eNp1ktFOgzAUhl-lOddsGZSyjagJZJp44byYNwrL0kDniNDOrmSbyAP4Fl74ZD6JBQIRor2iPf_5zhdyCohEzMCFbSqO0Y5KhR4WIUf6eMFB6fsajUZXyC9ub1CW8CTLM_T98YWiXErGFfKWC8TZSf1-LBuAX3e-P16v3pHvBSlV7KDWvdryXpdqdsXY5PtYhzYqyRi6RDxP0xbVY_le1dEaXLReg2zD7uBa8LNGdsq9cZU-F8eO4fUHeoFkr3kiWYyarvUg2Ezz_ICLYaLv3sh3v2zo3pf_E-cNeP-79eUqO7FXieA0bZNgQMZkRpNY70BR9YWgdixjIbj6M6byJYSQlzpHcyVWZx6Bq2TODGgIi4Q-S5qBu6XpQb_uKQe3gBO4GOOxYznYnDnmxJrahBhwBte2xoQQi2DLsfEcm05pwJsQmjAZTwmx55hYpjOfYGdGatxTXWxmsjhRQt41K1tvbvkD25nd6A)


## Collections

### Collection: AppConfig

| field name | platform | key | format | default
| - | - | - | - | -
| 환경 | web, android, ios | env | dev \| stg \| prod |
| 플랫폼 | web, android, ios | platform | web \| android \| ios |
| 점검 시작 시간 | web, android, ios | system_maintenance.start_time | YYYY-MM-DD HH:mm:ss | null
| 점검 종료 시간 | web, android, ios | system_maintenance.end_time | YYYY-MM-DD HH:mm:ss | null
| 점검 사유 | web, android, ios | system_maintenance.reason | string | null
| 점검 중 관리자 접근 허용 | web, android, ios | system_maintenance.allowed_backdoor | boolean | false
| 최소 버전 | web, android, ios | version.minimum | string | null
| 다음 버전 | web, android, ios | version.next | string | null
| 다음 버전 출시 시간 | web, android, ios | version.next_update_time | YYYY-MM-DD HH:mm:ss | null
| 심사 버전 | android, ios | review.version | string | null
