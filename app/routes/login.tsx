import {Form} from '@remix-run/react'
import {Button} from '~/components/ui/button'

export default function Login() {
	return (
		<Form action='/auth/discord' method='POST'>
			<Button className='bg-purple-700'>
				Login with Discord
			</Button>
		</Form>
	)
}
