import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import CuratedExchangersManager from "@/components/admin/leaderboard/CuratedExchangersManager"
import LiveLeaderboardViewer from "@/components/admin/leaderboard/LiveLeaderboardViewer";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";

export default function AdminLeaderboardPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Leaderboard Management" description="View live data and manage the curated list of top exchangers." />
      <Tabs defaultValue="live" className="w-full">
        <div className="flex justify-end mb-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2">
              <TabsTrigger value="live" className="flex-1 sm:flex-initial">Live Leaderboard</TabsTrigger>
              <TabsTrigger value="curated" className="flex-1 sm:flex-initial">Top Exchangers (Manual)</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="live">
          <LiveLeaderboardViewer />
        </TabsContent>
        <TabsContent value="curated">
          <CuratedExchangersManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
