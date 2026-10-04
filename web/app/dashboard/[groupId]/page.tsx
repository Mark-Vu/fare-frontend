import { GroupDashboard } from "@/components/dashboard/group-dashboard"
export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  return <GroupDashboard key={groupId} groupId={groupId} />
}
