import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/_components/signinform')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/_components/signinform"!</div>
}
