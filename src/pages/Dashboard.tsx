import { SummaryCards } from '../components/dashboard/SummaryCards';
import { SpendingTrend } from '../components/dashboard/SpendingTrend';
import { TopMerchants } from '../components/dashboard/TopMerchants';
import { TopCategories } from '../components/dashboard/TopCategories';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { useOverview, useTopMerchants, useCategories, useTrends } from '../hooks/useAnalytics';

export function Dashboard() {
  const overview = useOverview();
  const merchants = useTopMerchants();
  const categories = useCategories();
  const trends = useTrends('day');

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      <SummaryCards data={overview.data} loading={overview.loading} />

      <SpendingTrend data={trends.data} loading={trends.loading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopMerchants data={merchants.data} loading={merchants.loading} />
        <TopCategories data={categories.data} loading={categories.loading} />
      </div>

      <RecentTransactions />
    </div>
  );
}
