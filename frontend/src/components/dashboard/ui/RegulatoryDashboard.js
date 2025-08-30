import React from 'react';
import StatCard from './ui/StatCard';
import ContentCard from './ui/ContentCard';
import ActionButton from './ui/ActionButton';

const RegulatoryDashboard = ({ data, user }) => {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">{data?.title || "Regulatory Dashboard"}</h1>
          <p className="text-lg text-gray-400 mt-2">
            Welcome, <span className="font-semibold text-gray-200">{user?.username}</span>.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Producers" value={data?.stats?.totalProducers || '142'} />
            <StatCard title="Compliance Rate" value={data?.stats?.complianceRate || '98.7%'} change="+0.2%" changeType="increase" />
            <StatCard title="Audits this Month" value={data?.stats?.auditsMonth || '28'} />
            <StatCard title="Pending Submissions" value={data?.stats?.pendingSubmissions || '5'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ContentCard title="Recent Audits" className="lg:col-span-2">
              <p className="text-gray-400">A list of recently completed audits would go here...</p>
              {/* Example Item */}
              <div className="mt-4 p-3 rounded-lg bg-black/20 text-sm">Factory ID: HYDR8628QLA5 - Compliant</div>
            </ContentCard>

            <ContentCard title="Quick Actions">
              <div className="flex flex-col space-y-3">
                <ActionButton variant="primary">Review Submissions</ActionButton>
                <ActionButton variant="secondary">Generate Compliance Report</ActionButton>
              </div>
            </ContentCard>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegulatoryDashboard;