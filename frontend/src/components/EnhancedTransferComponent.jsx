import React, { useState } from 'react';
import axios from 'axios';

const EnhancedTransferComponent = ({ userTokens, onTransferSuccess, onTransferError }) => {
  const [transferData, setTransferData] = useState({
    tokenId: '',
    recipientIdentifier: ''
  });
  const [loading, setLoading] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState(null);

  const handleRecipientChange = async (identifier) => {
    setTransferData(prev => ({ ...prev, recipientIdentifier: identifier }));
    
    if (identifier.length >= 3) {
      try {
        const response = await axios.get(`/api/blockchain/resolve-recipient/${identifier}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setRecipientInfo(response.data.user);
        } else {
          setRecipientInfo(null);
        }
      } catch (error) {
        setRecipientInfo(null);
      }
    } else {
      setRecipientInfo(null);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!transferData.tokenId || !transferData.recipientIdentifier) {
      onTransferError('Please fill in all fields');
      return;
    }

    if (!recipientInfo) {
      onTransferError('Recipient not found. Please enter a valid username, factory ID, or user ID');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/blockchain/transfer-by-identifier', {
        tokenId: transferData.tokenId,
        recipientIdentifier: transferData.recipientIdentifier
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setTransferData({ tokenId: '', recipientIdentifier: '' });
        setRecipientInfo(null);
        onTransferSuccess();
      } else {
        onTransferError(response.data.message || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      onTransferError(error.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleTransfer} style={{ marginTop: '15px' }}>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="tokenSelect" style={{ display: 'block', marginBottom: '5px' }}>
          Select Token to Transfer:
        </label>
        <select
          id="tokenSelect"
          value={transferData.tokenId}
          onChange={(e) => setTransferData(prev => ({ ...prev, tokenId: e.target.value }))}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
          required
        >
          <option value="">Select a token...</option>
          {userTokens
            .filter(token => !token.isRetired)
            .map(token => (
              <option key={token.tokenId} value={token.tokenId}>
                Token #{token.tokenId} - Factory: {token.factoryId}
              </option>
            ))}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="recipient" style={{ display: 'block', marginBottom: '5px' }}>
          Recipient (Username, Factory ID, or User ID):
        </label>
        <input
          type="text"
          id="recipient"
          value={transferData.recipientIdentifier}
          onChange={(e) => handleRecipientChange(e.target.value)}
          placeholder="Enter username, factory ID, or user ID..."
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
          required
        />
        
        {/* Recipient validation feedback */}
        {transferData.recipientIdentifier.length >= 3 && (
          <div style={{ marginTop: '8px', fontSize: '14px' }}>
            {recipientInfo ? (
              <div style={{ 
                color: '#28a745', 
                backgroundColor: '#d4edda', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid #c3e6cb'
              }}>
                ✓ Found: {recipientInfo.username} ({recipientInfo.role})
                {recipientInfo.factoryName && ` - ${recipientInfo.factoryName}`}
              </div>
            ) : (
              <div style={{ 
                color: '#dc3545', 
                backgroundColor: '#f8d7da', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid #f5c6cb'
              }}>
                ✗ Recipient not found
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !recipientInfo || userTokens.filter(token => !token.isRetired).length === 0}
        style={{
          backgroundColor: (!recipientInfo || loading) ? '#ccc' : '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: (!recipientInfo || loading) ? 'not-allowed' : 'pointer',
          opacity: (!recipientInfo || loading) ? 0.6 : 1
        }}
      >
        {loading ? 'Transferring...' : 'Transfer Token'}
      </button>

      {userTokens.filter(token => !token.isRetired).length === 0 && (
        <p style={{
          marginTop: '10px',
          color: '#d32f2f',
          fontSize: '14px'
        }}>
          No transferable tokens available. You can only transfer tokens you currently own.
        </p>
      )}
    </form>
  );
};

export default EnhancedTransferComponent;
