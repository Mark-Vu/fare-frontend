import { SessionLoader } from "@/components/session/session-loader"
export default async function SessionPage({ params }: { params: Promise<{ groupId: string; sessionId: string }> }) {
  const { groupId, sessionId } = await params
  const group = decodeURIComponent(groupId)
  const session = decodeURIComponent(sessionId)
  return <SessionLoader key={`${group}-${session}`} groupId={group} sessionId={session} />
}
