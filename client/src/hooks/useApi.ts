
import { useState, useCallback } from "react"

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

type ApiFunction<T, P extends any[]> = (...args: P) => Promise<T>

export function useApi<T, P extends any[]>(apiFunction: ApiFunction<T, P>) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: P) => {
      try {
        setState({ data: null, loading: true, error: null })
        const data = await apiFunction(...args)
        setState({ data, loading: false, error: null })
        return data
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error })
        throw error
      }
    },
    [apiFunction],
  )

  return {
    ...state,
    execute,
  }
}

export default useApi
