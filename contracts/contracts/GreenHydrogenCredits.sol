// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GreenHydrogenCredits is ERC1155, Ownable, Pausable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Struct to store token metadata
    struct TokenMetadata {
        address creator;
        uint256 creationTimestamp;
        string factoryId;
        address currentOwner;
        uint256 lastTransferTimestamp;
        bool isRetired;
        uint256 retirementTimestamp;
        address retiredBy;
    }
    
    // Mapping from token ID to metadata
    mapping(uint256 => TokenMetadata) public tokenMetadata;
    
    // Array to store all token IDs for admin queries
    uint256[] public allTokenIds;
    
    // Events for tracking all transactions
    event TokenMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string factoryId,
        uint256 timestamp
    );
    
    event TokenTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    event TokenRetired(
        uint256 indexed tokenId,
        address indexed retiredBy,
        uint256 timestamp
    );
    
    constructor() ERC1155("https://api.hydrofi.com/metadata/{id}.json") {}
    
    /**
     * @dev Mint a new green hydrogen credit token
     * @param to Address to mint the token to
     * @param factoryId Factory identifier where hydrogen was produced
     */
    function mintToken(address to, string memory factoryId) 
        public 
        whenNotPaused 
        returns (uint256) 
    {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mint the token (supply of 1 for NFT-like behavior)
        _mint(to, newTokenId, 1, "");
        
        // Store metadata
        tokenMetadata[newTokenId] = TokenMetadata({
            creator: to,
            creationTimestamp: block.timestamp,
            factoryId: factoryId,
            currentOwner: to,
            lastTransferTimestamp: block.timestamp,
            isRetired: false,
            retirementTimestamp: 0,
            retiredBy: address(0)
        });
        
        // Add to all tokens array for admin queries
        allTokenIds.push(newTokenId);
        
        emit TokenMinted(newTokenId, to, factoryId, block.timestamp);
        
        return newTokenId;
    }
    
    /**
     * @dev Transfer token and update metadata
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override whenNotPaused {
        require(!tokenMetadata[id].isRetired, "Cannot transfer retired token");
        
        super.safeTransferFrom(from, to, id, amount, data);
        
        // Update metadata
        tokenMetadata[id].currentOwner = to;
        tokenMetadata[id].lastTransferTimestamp = block.timestamp;
        
        emit TokenTransferred(id, from, to, block.timestamp);
    }
    
    /**
     * @dev Batch transfer with metadata updates
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override whenNotPaused {
        for (uint256 i = 0; i < ids.length; i++) {
            require(!tokenMetadata[ids[i]].isRetired, "Cannot transfer retired token");
        }
        
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
        
        // Update metadata for all tokens
        for (uint256 i = 0; i < ids.length; i++) {
            tokenMetadata[ids[i]].currentOwner = to;
            tokenMetadata[ids[i]].lastTransferTimestamp = block.timestamp;
            emit TokenTransferred(ids[i], from, to, block.timestamp);
        }
    }
    
    /**
     * @dev Retire (burn) a token to prevent double-counting
     * @param tokenId Token ID to retire
     */
    function retireToken(uint256 tokenId) public whenNotPaused {
        require(balanceOf(msg.sender, tokenId) > 0, "You don't own this token");
        require(!tokenMetadata[tokenId].isRetired, "Token is already retired");
        
        // Burn the token
        _burn(msg.sender, tokenId, 1);
        
        // Update metadata
        tokenMetadata[tokenId].isRetired = true;
        tokenMetadata[tokenId].retirementTimestamp = block.timestamp;
        tokenMetadata[tokenId].retiredBy = msg.sender;
        
        emit TokenRetired(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get token metadata (public function for transparency)
     */
    function getTokenMetadata(uint256 tokenId) 
        public 
        view 
        returns (TokenMetadata memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        return tokenMetadata[tokenId];
    }
    
    /**
     * @dev Get all token IDs (for admin dashboard)
     */
    function getAllTokenIds() public view returns (uint256[] memory) {
        return allTokenIds;
    }
    
    /**
     * @dev Get total number of tokens ever minted
     */
    function getTotalTokens() public view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Get tokens owned by a specific address
     */
    function getTokensByOwner(address owner) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory ownedTokens = new uint256[](allTokenIds.length);
        uint256 ownedCount = 0;
        
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            uint256 tokenId = allTokenIds[i];
            if (balanceOf(owner, tokenId) > 0 && !tokenMetadata[tokenId].isRetired) {
                ownedTokens[ownedCount] = tokenId;
                ownedCount++;
            }
        }
        
        // Create a new array with the correct size
        uint256[] memory result = new uint256[](ownedCount);
        for (uint256 i = 0; i < ownedCount; i++) {
            result[i] = ownedTokens[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get retired tokens
     */
    function getRetiredTokens() public view returns (uint256[] memory) {
        uint256[] memory retiredTokens = new uint256[](allTokenIds.length);
        uint256 retiredCount = 0;
        
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            uint256 tokenId = allTokenIds[i];
            if (tokenMetadata[tokenId].isRetired) {
                retiredTokens[retiredCount] = tokenId;
                retiredCount++;
            }
        }
        
        // Create a new array with the correct size
        uint256[] memory result = new uint256[](retiredCount);
        for (uint256 i = 0; i < retiredCount; i++) {
            result[i] = retiredTokens[i];
        }
        
        return result;
    }
    
    /**
     * @dev Check if a token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId <= _tokenIds.current();
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Set URI for metadata (only owner)
     */
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }
}
