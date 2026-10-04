import { SessionLoader } from "@/components/session/session-loader"
export default async function SessionPage({ params }: { params: Promise<{ groupId: string; sessionId: string }> }) {
  const { groupId, sessionId } = await params
  return <SessionLoader key={`${groupId}-${sessionId}`} groupId={groupId} sessionId={sessionId} />
}
