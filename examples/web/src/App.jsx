import RemoteStore, { AppConfigCollection } from '@divlook/remote-store-sdk/web'
import { useEffect, useState } from 'react'

const remoteStore = new RemoteStore({
    firebaseOptions: {
        // https://firebase.google.com/docs/web/learn-more?authuser=0&hl=ko#config-object
    },
    firestoreEmulator: {
        host: '127.0.0.1',
        port: 8080,
    },
})

function App() {
    const [state, setState] = useState(null)

    useEffect(() => {
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

                setState({
                    data: changedData,
                    getters,
                })
            },
        )

        return () => {
            unsubscribeAppConfig()
        }
    }, [])

    return (
        <>
            <div>
                <div>print:</div>
                <div
                    style={{
                        whiteSpace: 'pre',
                    }}
                >
                    {JSON.stringify(state, undefined, 4)}
                </div>
            </div>
        </>
    )
}

export default App
