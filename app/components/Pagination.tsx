import {ArrowLeftIcon, ArrowRightIcon} from 'lucide-react'
import SLink from './ui/SLink'
import {Button} from './ui/button'
import {useLocation} from '@remix-run/react'

export default function Pagination({
	searchParam,
	page,
	hasNext,
}: {
	searchParam: string
	page: number
	hasNext: boolean
}) {
	const {pathname, search} = useLocation()
	const prevParams = new URLSearchParams(search)
	prevParams.set(searchParam, String(page - 1))
	const nextParams = new URLSearchParams(search)
	nextParams.set(searchParam, String(page + 1))

	return (
		<div className='flex gap-2 justify-center'>
			{page !== 1 ? (
				<SLink
					to={`${pathname}?${prevParams}`}
					variant='ghost'
				>
					<ArrowLeftIcon />
					<span className='sr-only'>Anterior</span>
				</SLink>
			) : (
				<Button variant='ghost' disabled>
					<ArrowLeftIcon />
					<span className='sr-only'>Anterior</span>
				</Button>
			)}
			{hasNext ? (
				<SLink
					to={`${pathname}?${nextParams}`}
					variant='ghost'
				>
					<ArrowRightIcon />
					<span className='sr-only'>Próximo</span>
				</SLink>
			) : (
				<Button variant='ghost' disabled>
					<ArrowRightIcon />
					<span className='sr-only'>Próximo</span>
				</Button>
			)}
		</div>
	)
}
