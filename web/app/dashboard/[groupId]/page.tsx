import { GroupDashboard } from "@/components/dashboard/group-dashboard"
import { LiveTrip } from "@/components/dashboard/live-trip"

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const id = decodeURIComponent(groupId)
  return <div className="space-y-16">
    <LiveTrip groupId={id} />
    <GroupDashboard key={id} groupId={id} compact />
  </div>
}
