import React from 'react';
import StatCard from './ui/StatCard';
import ContentCard from './ui/ContentCard';
import ActionButton from './ui/ActionButton';

const BuyerDashboard = ({ data, user }) => {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">{data?.title || "Buyer Dashboard"}</h1>
          <p className="text-lg text-gray-400 mt-2">
            Welcome, <span className="font-semibold text-gray-200">{user?.username}</span>.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="My Active Tokens" value={data?.stats?.activeTokens || '2,550'} />
            <StatCard title="Available on Market" value={data?.stats?.marketTokens || '1.2M'} />
            <StatCard title="Avg. Token Price" value={`$${data?.stats?.avgPrice || '24.50'}`} change="-1.5%" changeType="decrease" />
            <StatCard title="Tokens Retired" value={data?.stats?.tokensRetired || '820'} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ContentCard title="My Recent Purchases" className="lg:col-span-2">
                <p className="text-gray-400">A list of recent transactions would go here...</p>
                 {/* Example Item */}
                 <div className="mt-4 p-3 rounded-lg bg-black/20 text-sm">Purchased 150 Tokens from HYDR8628QLA5</div>
            </ContentCard>

            <ContentCard title="Marketplace">
                <div className="flex flex-col space-y-3">
                    <ActionButton variant="primary">Browse Market</ActionButton>
                    <ActionButton variant="secondary">View My Inventory</ActionButton>
                </div>
            </ContentCard>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BuyerDashboard;