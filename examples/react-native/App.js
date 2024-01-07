import { AppConfigCollection, RemoteStore } from '@divlook/remote-store-sdk/react-native'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const remoteStore = new RemoteStore({
    firestoreEmulator: {
        host: '127.0.0.1',
        port: 8080,
    },
})

export default function App() {
    const [state, setState] = useState(null)

    useEffect(() => {
        const { unsubscribeAppConfig } = remoteStore.subscribeAppConfig(
            {
                platform: 'ios',
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
        <View style={styles.container}>
            <Text>{`print:\n${JSON.stringify(state, undefined, 4)}`}</Text>
            <StatusBar style="auto" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
})


