import { useState, useCallback } from "react";
export function useApi(apiFunction) {
    const [state, setState] = useState({
        data: null,
        loading: false,
        error: null,
    });
    const execute = useCallback(async (...args) => {
        try {
            setState({ data: null, loading: true, error: null });
            const data = await apiFunction(...args);
            setState({ data, loading: false, error: null });
            return data;
        }
        catch (error) {
            setState({ data: null, loading: false, error: error });
            throw error;
        }
    }, [apiFunction]);
    return {
        ...state,
        execute,
    };
}
export default useApi;
