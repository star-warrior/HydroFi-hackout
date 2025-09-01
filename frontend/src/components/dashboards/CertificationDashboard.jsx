import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useBlockchain } from "../../contexts/BlockchainContext";
import { FiHome, FiDatabase, FiCreditCard, FiSend, FiArchive, FiSettings, FiLogOut, FiBarChart2, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { FaIndustry } from "react-icons/fa";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
                <div className="text-slate-400 mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:opacity-90 transition-opacity"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const NavItem = ({ icon: Icon, label, navName, activeNav, setActiveNav }) => (
    <button
      onClick={() => setActiveNav(navName)}
      className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors group relative ${activeNav === navName 
        ? 'font-semibold text-white bg-teal-500/10' 
        : 'text-gray-400 hover:bg-gray-800/50'}`}
    >
      {activeNav === navName && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-teal-500 rounded-r-full"></div>}
      <Icon className={`mr-3 transition-colors ${activeNav === navName ? 'text-teal-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
      {label}
    </button>
);

const StatCard = ({ title, value, change, changeType, description }) => (
    <div className="bg-gradient-to-br from-[#21312E] to-[#263834] border border-gray-700/50 rounded-xl p-5 shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] transition-all duration-300">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">{title}</p>
        {change && (
          <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${changeType === 'positive' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {changeType === 'positive' ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-4xl font-bold text-slate-100 mt-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400">{value}</h3>
      <p className="text-sm text-gray-400 mt-1 flex items-center">
        {description}
      </p>
    </div>
);

const TabButton = ({ label, tabName, activeMainTab, setActiveMainTab }) => (
    <button
      onClick={() => setActiveMainTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 relative ${activeMainTab === tabName 
        ? 'text-white' 
        : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'}`}
    >
      {activeMainTab === tabName && 
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></span>
      }
      {label}
    </button>
);

const CertificationDashboard = () => {
  const [certificationData, setCertificationData] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [activeMainTab, setActiveMainTab] = useState("overview");

  const {
    tokens,
    transactions,
    stats,
    loading,
    error,
    fetchTokens,
    fetchStats,
    fetchTransactions,
  } = useBlockchain();

  useEffect(() => {
    const fetchCertificationData = async () => {
      try {
        // Mock data for demonstration
        const mockData = {
          inspectionQueue: [
            { id: 1, company: "HydroGen Solutions", scheduled: "2023-06-15", auditor: "Dr. Emily Chen" },
            { id: 2, company: "GreenH2 Innovations", scheduled: "2023-06-22", auditor: "Prof. Michael Rodriguez" },
            { id: 3, company: "AquaPower Systems", scheduled: "2023-06-30", auditor: "Dr. Sarah Johnson" },
          ],
          certificationStats: {
            issued: 42,
            pending: 8,
            expired: 3
          }
        };
        setCertificationData(mockData);
      } catch (err) {
        console.error("Failed to fetch certification data:", err);
      }
    };

    fetchCertificationData();
    fetchTokens();
    fetchStats();
    fetchTransactions();
  }, [fetchTokens, fetchStats, fetchTransactions]);

  const formatAddress = (address) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getTokensByFactory = () => {
    const factoryGroups = {};
    tokens.forEach((token) => {
      if (!factoryGroups[token.factoryId]) {
        factoryGroups[token.factoryId] = [];
      }
      factoryGroups[token.factoryId].push(token);
    });
    return factoryGroups;
  };

  // Derived state with useMemo for performance
  const { verifiedTokens, tokensByFactory } = useMemo(() => {
    const safeTokens = Array.isArray(tokens) ? tokens : [];
    const verifiedTokens = safeTokens.filter((token) => token && !token.isRetired);
    const tokensByFactory = getTokensByFactory();
    
    return { verifiedTokens, tokensByFactory };
  }, [tokens]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1A2421] to-[#1F2C28] text-gray-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#111827]/50 flex flex-col p-4 border-r border-gray-800">
        <div className="flex items-center mb-8 p-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center mr-3 shadow-lg">
            <FiBarChart2 className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">HydroCredit</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavItem icon={FiHome} label="Dashboard" navName="dashboard" activeNav={activeNav} setActiveNav={setActiveNav} />
          <NavItem icon={FiDatabase} label="Verification Data" navName="verification" activeNav={activeNav} setActiveNav={setActiveNav}/>
          <NavItem icon={FiCreditCard} label="Credits" navName="credits" activeNav={activeNav} setActiveNav={setActiveNav}/>
          <NavItem icon={FiSend} label="Transactions" navName="transactions" activeNav={activeNav} setActiveNav={setActiveNav}/>
          <NavItem icon={FaIndustry} label="Facilities" navName="facilities" activeNav={activeNav} setActiveNav={setActiveNav}/>
          <NavItem icon={FiArchive} label="Archive" navName="archive" activeNav={activeNav} setActiveNav={setActiveNav}/>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-gray-800 space-y-2">
          <NavItem icon={FiSettings} label="Settings" navName="settings" activeNav={activeNav} setActiveNav={setActiveNav}/>
          <button 
            className="flex items-center px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800/50 rounded-lg w-full group"
          >
            <FiLogOut className="mr-3 text-gray-500 group-hover:text-gray-300" />
            Logout
          </button>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-800 bg-transparent">
      
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Verified Credits" 
              value={verifiedTokens.length} 
              change="+12.5%" 
              changeType="positive" 
              description="Credits currently verified" 
            />
            <StatCard 
              title="Certified Facilities" 
              value={Object.keys(tokensByFactory).length} 
              change="+4.5%" 
              changeType="positive" 
              description="Facilities with active certification" 
            />
            <StatCard 
              title="Retired Credits" 
              value={stats?.totalRetired || 0} 
              change="-5.2%" 
              changeType="negative" 
              description="Credits permanently retired" 
            />
            <StatCard 
              title="Total Transactions" 
              value={stats?.totalTransactions || 0} 
              description="All on-chain transactions" 
            />
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#21312E]/50 border border-gray-700/50 rounded-xl shadow-xl mb-8">
            <div className="p-2 border-b border-gray-700/50 flex items-center space-x-2">
              <TabButton label="Overview" tabName="overview" activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />
              <TabButton label="Verification" tabName="verification" activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />
              <TabButton label="Facilities" tabName="facilities" activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />
            </div>
            
            <div className="p-6 min-h-[300px]">
              {activeMainTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Certification Overview */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Certification System Overview</h3>
                    {stats ? (
                      <div>
                        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <strong className="text-teal-300">Verification Activity</strong>
                          <div className="mt-2 text-sm">
                            <div>Total Credits Verified: {stats.totalMinted}</div>
                            <div>Active Facilities: {Object.keys(tokensByFactory).length}</div>
                            <div>Verification Rate: 100% (All tokens are verified on-chain)</div>
                          </div>
                        </div>

                        <div className="mt-5">
                          <strong className="text-teal-300">Credit Lifecycle:</strong>
                          <div className="w-full bg-slate-700 rounded-full h-5 mt-2 flex">
                            <div
                              className="bg-teal-500 h-5 rounded-l-full flex items-center justify-center text-xs text-white"
                              style={{
                                width: `${
                                  stats.totalMinted > 0
                                    ? (stats.totalActive / stats.totalMinted) * 100
                                    : 0
                                }%`
                              }}
                            >
                              {stats.totalActive > 0 ? 'Active' : ''}
                            </div>
                            <div
                              className="bg-slate-500 h-5 rounded-r-full flex items-center justify-center text-xs text-white"
                              style={{
                                width: `${
                                  stats.totalMinted > 0
                                    ? (stats.totalRetired / stats.totalMinted) * 100
                                    : 0
                                }%`
                              }}
                            >
                              {stats.totalRetired > 0 ? 'Retired' : ''}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Active: {stats.totalActive}</span>
                            <span>Retired: {stats.totalRetired}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">Loading statistics...</p>
                    )}
                  </div>

                  {/* Inspection Queue */}
                  {certificationData && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-white mb-4">Upcoming Inspections</h3>
                      <div className="space-y-3">
                        {certificationData.inspectionQueue.map((inspection) => (
                          <div
                            key={inspection.id}
                            className="p-3 border border-slate-600 rounded-lg bg-slate-700/30"
                          >
                            <div className="flex justify-between items-start">
                              <strong className="text-white">{inspection.company}</strong>
                              <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded-full">
                                Scheduled
                              </span>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              <div>Scheduled: {inspection.scheduled}</div>
                              <div>Auditor: {inspection.auditor}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Verification Activity */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Verification Activity</h3>
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                      {transactions.slice(0, 10).map((tx, index) => (
                        <div
                          key={tx._id || index}
                          className="p-3 border border-slate-600 rounded-lg bg-slate-700/30"
                        >
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              tx.type === "mint" 
                                ? "bg-green-500/20 text-green-300" 
                                : tx.type === "transfer"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-slate-500/20 text-slate-300"
                            }`}>
                              {tx.type === "mint" ? "Verified" : tx.type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {tx.timestamp ? formatDate(tx.timestamp) : "N/A"}
                            </span>
                          </div>
                          <div className="text-sm mt-1">
                            Token #{tx.tokenId}
                            {tx.factoryId && (
                              <span className="ml-2 text-gray-400">
                                Factory: {tx.factoryId}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certification Statistics */}
                  {certificationData && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 lg:col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">Certification Statistics</h3>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="text-2xl font-bold text-white">{certificationData.certificationStats.issued}</div>
                          <div className="text-xs text-gray-400 mt-1">Issued</div>
                        </div>
                        <div className="text-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                          <div className="text-2xl font-bold text-amber-300">{certificationData.certificationStats.pending}</div>
                          <div className="text-xs text-amber-300/70 mt-1">Pending</div>
                        </div>
                        <div className="text-center p-3 bg-rose-500/10 rounded-lg border border-rose-500/30">
                          <div className="text-2xl font-bold text-rose-300">{certificationData.certificationStats.expired}</div>
                          <div className="text-xs text-rose-300/70 mt-1">Expired</div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-teal-300 font-medium mb-2">Approval Rate:</p>
                        <div className="w-full bg-slate-700 rounded-full h-4">
                          <div
                            className="bg-green-500 h-4 rounded-full flex items-center justify-center text-xs text-white"
                            style={{
                              width: `${
                                (certificationData.certificationStats.issued /
                                  (certificationData.certificationStats.issued +
                                    certificationData.certificationStats.pending)) *
                                100
                              }%`
                            }}
                          >
                            {Math.round(
                              (certificationData.certificationStats.issued /
                                (certificationData.certificationStats.issued +
                                  certificationData.certificationStats.pending)) *
                                100
                            )}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeMainTab === 'verification' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Token Verification Registry</h3>
                  <div className="mb-6 flex items-center space-x-4 text-sm">
                    <span className="text-gray-300">
                      Total Verified: <strong className="text-white">{tokens.length}</strong>
                    </span>
                    <span className="text-gray-300">
                      Active: <strong className="text-teal-300">{verifiedTokens.length}</strong>
                    </span>
                    <span className="text-gray-300">
                      Retired: <strong className="text-rose-300">{tokens.filter((t) => t.isRetired).length}</strong>
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-700/50">
                          <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-slate-600">Token ID</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-slate-600">Factory</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-slate-600">Creator</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-slate-600">Verification Status</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-slate-600">Created</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-slate-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {tokens.map((token) => (
                          <tr key={token.tokenId} className="hover:bg-slate-700/30">
                            <td className="p-3 text-sm text-white">#{token.tokenId}</td>
                            <td className="p-3 text-sm text-gray-300">{token.factoryId}</td>
                            <td className="p-3 text-sm text-gray-300">{formatAddress(token.creator)}</td>
                            <td className="p-3 text-sm">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                                Verified
                              </span>
                              {token.isRetired && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 ml-2">
                                  Retired
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-sm text-gray-300">
                              {token.creationTimestamp ? new Date(token.creationTimestamp).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="p-3 text-sm">
                              <button
                                onClick={() => setSelectedToken(token)}
                                className="px-3 py-1 text-xs bg-teal-500/20 text-teal-300 rounded-md hover:bg-teal-500/30 transition-colors"
                              >
                                Verify Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeMainTab === 'facilities' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Certified Facilities</h3>
                  <div className="mb-4 text-sm text-gray-300">
                    Total Facilities: <strong className="text-white">{Object.keys(tokensByFactory).length}</strong>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(tokensByFactory).map(
                      ([factoryId, factoryTokens]) => {
                        const activeTokens = factoryTokens.filter(
                          (t) => !t.isRetired
                        );
                        const retiredTokens = factoryTokens.filter(
                          (t) => t.isRetired
                        );

                        return (
                          <div
                            key={factoryId}
                            className="border border-slate-600 rounded-xl p-4 bg-slate-800/30"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-md font-semibold text-white">{factoryId}</h4>
                              <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">
                                Certified
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                                <div className="text-lg font-bold text-teal-300">{factoryTokens.length}</div>
                                <div className="text-xs text-gray-400 mt-1">Total Credits</div>
                              </div>
                              <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                                <div className="text-lg font-bold text-blue-300">{activeTokens.length}</div>
                                <div className="text-xs text-gray-400 mt-1">Active</div>
                              </div>
                              <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                                <div className="text-lg font-bold text-rose-300">{retiredTokens.length}</div>
                                <div className="text-xs text-gray-400 mt-1">Retired</div>
                              </div>
                            </div>

                            <div className="text-xs text-gray-400">
                              First Production:{" "}
                              {new Date(
                                Math.min(
                                  ...factoryTokens.map(
                                    (t) => new Date(t.creationTimestamp)
                                  )
                                )
                              ).toLocaleDateString()}
                              <br />
                              Last Production:{" "}
                              {new Date(
                                Math.max(
                                  ...factoryTokens.map(
                                    (t) => new Date(t.creationTimestamp)
                                  )
                                )
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Token Details Modal */}
      {selectedToken && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Verification Details - Token #{selectedToken.tokenId}
            </h3>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300">
                <strong>✓ VERIFIED ON BLOCKCHAIN</strong>
              </div>

              <div>
                <p className="text-gray-400">Factory ID:</p>
                <p className="text-white">{selectedToken.factoryId}</p>
              </div>
              
              <div>
                <p className="text-gray-400">Creator:</p>
                <p className="text-white">{selectedToken.creator}</p>
              </div>
              
              <div>
                <p className="text-gray-400">Current Owner:</p>
                <p className="text-white">{selectedToken.currentOwner}</p>
              </div>
              
              <div>
                <p className="text-gray-400">Created:</p>
                <p className="text-white">{formatDate(selectedToken.creationTimestamp)}</p>
              </div>
              
              <div>
                <p className="text-gray-400">Last Transfer:</p>
                <p className="text-white">{formatDate(selectedToken.lastTransferTimestamp)}</p>
              </div>
              
              <div>
                <p className="text-gray-400">Status:</p>
                <p className={selectedToken.isRetired ? "text-rose-300" : "text-teal-300"}>
                  {selectedToken.isRetired ? "Retired" : "Active"}
                </p>
              </div>

              {selectedToken.isRetired && (
                <>
                  <div>
                    <p className="text-gray-400">Retired By:</p>
                    <p className="text-white">{selectedToken.retiredBy}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400">Retirement Date:</p>
                    <p className="text-white">{formatDate(selectedToken.retirementTimestamp)}</p>
                  </div>
                </>
              )}

              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-gray-400">
                <strong>Verification Notes:</strong>
                <br />
                This token has been verified on the blockchain and represents
                a legitimate green hydrogen credit. All metadata is immutable
                and publicly verifiable.
              </div>
            </div>
            
            <button
              onClick={() => setSelectedToken(null)}
              className="mt-6 w-full px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-rose-500/20 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg shadow-lg max-w-xs z-50">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default CertificationDashboard;