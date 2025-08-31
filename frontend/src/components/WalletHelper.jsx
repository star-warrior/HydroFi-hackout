import React, { useState } from "react";

const WalletHelper = () => {
  const [showAddresses, setShowAddresses] = useState(false);

  // // Common test addresses from Hardhat
  // const testAddresses = [
  //   {
  //     address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  //     label: "Default Account #0 (Contract Deployer)",
  //     description: "Main test account",
  //   },
  //   {
  //     address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  //     label: "Test Account #1",
  //     description: "Industry Buyer Test Account",
  //   },
  //   {
  //     address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  //     label: "Test Account #2",
  //     description: "Another Producer Test Account",
  //   },
  //   {
  //     address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  //     label: "Test Account #3",
  //     description: "Certification Body Test Account",
  //   },
  //   {
  //     address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  //     label: "Test Account #4",
  //     description: "Regulatory Authority Test Account",
  //   },
  // ];

  // const copyToClipboard = (address) => {
  //   navigator.clipboard.writeText(address);
  //   alert(`Address copied: ${address}`);
  // };

  // return (
  //   <div
  //     style={{
  //       padding: "15px",
  //       border: "1px solid #e0e0e0",
  //       borderRadius: "8px",
  //       backgroundColor: "#f8f9fa",
  //       marginBottom: "20px",
  //     }}
  //   >
  //     <div
  //       style={{
  //         display: "flex",
  //         justifyContent: "space-between",
  //         alignItems: "center",
  //       }}
  //     >
  //       <h4 style={{ margin: 0, color: "#2196F3" }}>
  //         🔑 Wallet Address Helper
  //       </h4>
  //       <button
  //         onClick={() => setShowAddresses(!showAddresses)}
  //         style={{
  //           backgroundColor: "#2196F3",
  //           color: "white",
  //           border: "none",
  //           padding: "8px 12px",
  //           borderRadius: "4px",
  //           cursor: "pointer",
  //           fontSize: "12px",
  //         }}
  //       >
  //         {showAddresses ? "Hide" : "Show"} Test Addresses
  //       </button>
  //     </div>

  //     <p style={{ margin: "10px 0", fontSize: "14px", color: "#666" }}>
  //       For testing transfers, you need recipient wallet addresses. Use the test
  //       addresses below:
  //     </p>

  //     {showAddresses && (
  //       <div style={{ marginTop: "15px" }}>
  //         <div
  //           style={{
  //             display: "grid",
  //             gap: "10px",
  //           }}
  //         >
  //           {testAddresses.map((account, index) => (
  //             <div
  //               key={index}
  //               style={{
  //                 padding: "10px",
  //                 backgroundColor: "white",
  //                 border: "1px solid #ddd",
  //                 borderRadius: "4px",
  //                 display: "flex",
  //                 justifyContent: "space-between",
  //                 alignItems: "center",
  //               }}
  //             >
  //               <div style={{ flex: 1 }}>
  //                 <div
  //                   style={{
  //                     fontWeight: "bold",
  //                     fontSize: "12px",
  //                     color: "#333",
  //                   }}
  //                 >
  //                   {account.label}
  //                 </div>
  //                 <div
  //                   style={{
  //                     fontFamily: "monospace",
  //                     fontSize: "11px",
  //                     color: "#666",
  //                     marginTop: "2px",
  //                   }}
  //                 >
  //                   {account.address}
  //                 </div>
  //                 <div
  //                   style={{
  //                     fontSize: "11px",
  //                     color: "#888",
  //                     marginTop: "2px",
  //                   }}
  //                 >
  //                   {account.description}
  //                 </div>
  //               </div>
  //               <button
  //                 onClick={() => copyToClipboard(account.address)}
  //                 style={{
  //                   backgroundColor: "#28a745",
  //                   color: "white",
  //                   border: "none",
  //                   padding: "5px 8px",
  //                   borderRadius: "3px",
  //                   cursor: "pointer",
  //                   fontSize: "11px",
  //                 }}
  //               >
  //                 Copy
  //               </button>
  //             </div>
  //           ))}
  //         </div>

  //         <div
  //           style={{
  //             marginTop: "15px",
  //             padding: "10px",
  //             backgroundColor: "#fff3cd",
  //             border: "1px solid #ffeaa7",
  //             borderRadius: "4px",
  //           }}
  //         >
  //           <strong style={{ color: "#856404" }}>💡 How to use:</strong>
  //           <ul
  //             style={{
  //               margin: "5px 0",
  //               paddingLeft: "20px",
  //               fontSize: "12px",
  //               color: "#856404",
  //             }}
  //           >
  //             <li>Copy any address above</li>
  //             <li>Paste it in the "Recipient Wallet Address" field</li>
  //             <li>Select a token you own to transfer</li>
  //             <li>Click "Transfer Token"</li>
  //           </ul>
  //         </div>
  //       </div>
  //     )}
    <></>

};

export default WalletHelper;
