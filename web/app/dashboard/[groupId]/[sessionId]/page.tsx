import { SessionLoader } from "@/components/session/session-loader"
import { canonicalGroupId } from "@/lib/group-id"

export default async function SessionPage({ params }: { params: Promise<{ groupId: string; sessionId: string }> }) {
  const { groupId, sessionId } = await params
  const group = canonicalGroupId(groupId)
  const session = decodeURIComponent(sessionId)
  return <SessionLoader key={`${group}-${session}`} groupId={group} sessionId={session} />
}
