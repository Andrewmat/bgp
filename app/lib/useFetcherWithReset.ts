import {SerializeFrom} from '@remix-run/node'
import {
	FetcherWithComponents,
	useFetcher,
} from '@remix-run/react'
import {useEffect, useState} from 'react'

export type FetcherWithComponentsReset<TData> =
	FetcherWithComponents<SerializeFrom<TData>> & {
		reset: () => void
	}

export function useFetcherWithReset<
	TData,
>(): FetcherWithComponentsReset<TData> {
	const fetcher = useFetcher<TData>()
	const [data, setData] = useState(fetcher.data)
	useEffect(() => {
		if (fetcher.state === 'idle') {
			setData(fetcher.data)
		}
	}, [fetcher.state, fetcher.data])
	return {
		...fetcher,
		data: data as SerializeFrom<TData>,
		reset: () => {
			setData(undefined)
		},
	}
}
