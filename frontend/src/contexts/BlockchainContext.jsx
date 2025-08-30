import React, { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [tokens, setTokens] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:5000/api";

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // Mint new tokens
  const mintTokens = useCallback(async (factoryId, quantity = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/blockchain/mint`,
        { factoryId, quantity },
        getAuthHeaders()
      );

      if (response.data.success) {
        // Refresh tokens after minting
        await fetchTokens();
        return response.data;
      } else {
        throw new Error(response.data.message || "Minting failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Minting failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Transfer token
  const transferToken = useCallback(async (tokenId, toAddress) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/blockchain/transfer`,
        { tokenId, to: toAddress },
        getAuthHeaders()
      );

      if (response.data.success) {
        // Refresh tokens after transfer
        await fetchTokens();
        return response.data;
      } else {
        throw new Error(response.data.message || "Transfer failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Transfer failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Retire token
  const retireToken = useCallback(async (tokenId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/blockchain/retire`,
        { tokenId },
        getAuthHeaders()
      );

      if (response.data.success) {
        // Refresh tokens after retirement
        await fetchTokens();
        return response.data;
      } else {
        throw new Error(response.data.message || "Retirement failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Retirement failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tokens based on user role
  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/blockchain/tokens`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setTokens(response.data.tokens || []);
        setTransactions(response.data.transactions || []);
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch tokens");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch tokens";
      setError(errorMessage);
      console.error("Fetch tokens error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch blockchain statistics (admin only)
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/blockchain/stats`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setStats(response.data.stats);
        return response.data.stats;
      } else {
        throw new Error(response.data.message || "Failed to fetch statistics");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch statistics";
      setError(errorMessage);
      console.error("Fetch stats error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transaction history (admin only)
  const fetchTransactions = useCallback(async (page = 1, limit = 50) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/blockchain/transactions?page=${page}&limit=${limit}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setTransactions(response.data.transactions);
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch transactions"
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch transactions";
      setError(errorMessage);
      console.error("Fetch transactions error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get specific token metadata
  const getTokenMetadata = useCallback(async (tokenId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/blockchain/token/${tokenId}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        return response.data.token;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch token metadata"
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch token metadata";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    tokens,
    transactions,
    stats,
    loading,
    error,
    mintTokens,
    transferToken,
    retireToken,
    fetchTokens,
    fetchStats,
    fetchTransactions,
    getTokenMetadata,
    setError,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};
