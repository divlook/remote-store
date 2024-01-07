export const Method = {
    Timelog(enabled = false) {
        return function (_method: any, _context: ClassMethodDecoratorContext) {
            if (!enabled) return

            const methodName = String(_context.name)

            return async function (this: any, ...args: any[]) {
                const startMs = Date.now()

                console.log(`${methodName}: entered`)

                const result = await _method.call(this, ...args)

                const endMs = Date.now() - startMs
                const duration = (() => {
                    const texts: string[] = []
                    const ms = endMs % 1000
                    const sec = Math.floor((endMs - ms) / 1000)
                    texts.push(`${sec}s`)
                    if (sec) texts.push(`${sec}s`)
                    if (!sec || ms) texts.push(`${ms}ms`)
                    return texts.join(' ')
                })()

                console.log(`${methodName}: exiting - ${duration}`)
                return result
            }
        }
    },
} as const
