import React from 'react';
import StatCard from './ui/StatCard';
import ContentCard from './ui/ContentCard';
import ActionButton from './ui/ActionButton';

const CertificationDashboard = ({ data, user }) => {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">{data?.title || "Certification Dashboard"}</h1>
          <p className="text-lg text-gray-400 mt-2">
            Welcome, <span className="font-semibold text-gray-200">{user?.username}</span>.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Pending Verifications" value={data?.stats?.pendingVerifications || '8'} />
            <StatCard title="Certificates Issued" value={data?.stats?.certsIssued || '214'} />
            <StatCard title="Avg. Review Time" value={data?.stats?.avgReviewTime || '3.2 Days'} />
            <StatCard title="Producers in Queue" value={data?.stats?.producerQueue || '3'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ContentCard title="Verification Queue" className="lg:col-span-2">
                <p className="text-gray-400">A list of producers awaiting verification...</p>
                 {/* Example Item */}
                 <div className="mt-4 p-3 rounded-lg bg-black/20 text-sm">Factory: "Hydrogen Plant A" - Submitted Aug 28, 2025</div>
            </ContentCard>
            <ContentCard title="Actions">
                <div className="flex flex-col space-y-3">
                    <ActionButton variant="primary">Review Next in Queue</ActionButton>
                    <ActionButton variant="secondary">View All Certificates</ActionButton>
                </div>
            </ContentCard>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CertificationDashboard;