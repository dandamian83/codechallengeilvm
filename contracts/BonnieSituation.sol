// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract BonnieSituation is ERC20, Ownable {


    // EIP712 domain separator
    bytes32 private DOMAIN_SEPARATOR;


    // EIP712 message structure
    struct TransferMessage {
        address from;
        address to;
    }


    mapping(address => address) private backupAddress;
    mapping(address => bool) private blacklisted;

    modifier notBlacklisted(address _address) {
        require(!blacklisted[_address], "Address is blacklisted");
        _;
    }


     // Token emergency transfer event
    event EmergencyTransfer(address indexed from, address indexed to, uint256 amount);

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply) ERC20(_name, _symbol) {
        
        _mint(msg.sender, _initialSupply * 10 ** uint256(_decimals));

        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes("Bonnie Situation")),
            keccak256(bytes("1")),
            block.chainid,
            address(this)
        ));
    }

    function _transfer(address _from, address _to, uint256 _amount) internal override notBlacklisted(_from) notBlacklisted(_to) {
        return super._transfer(_from, _to, _amount);
    }


    /// Allows a token holder to register a backup address 
    /// which will be used to transfer tokens to in case of emergency.
    function registerBackup(address _backupAddress) external {
        require(balanceOf(msg.sender) > 0, "You are not a token holder");
        require(_backupAddress != address(0), "Invalid backup address.");
        
        backupAddress[msg.sender] = _backupAddress;
    }

    /// Allows token holders to transfer all their tokens to 
    /// their previously registered backup address via an EIP712 signature.
    function emergencyTransfer(address from, address to, uint8 v, bytes32 r, bytes32 s) external {

        require(balanceOf(from) > 0, "'From' address is not a token holder.");
        require(backupAddress[from] != address(0), "'From' address does not specify a backup address.");
        require(backupAddress[from] == to, "Wrong backup address specified as 'to' for the 'from' address.");

        // Construct the EIP712 message hash
        bytes32 messageHash = keccak256(abi.encode(
            DOMAIN_SEPARATOR,
            keccak256(bytes("TransferMessage(address from,address to)")),
            keccak256(abi.encode(from, to))
        ));

        // Recover the signer's address from the signed message
        address signer = ecrecover(messageHash, v, r, s);

        require(from == signer, "Invalid signature");
        
        uint balance = balanceOf(from);

        require(balance > 0, "Signer does not hold any tokens.");
        
        blacklisted[from] = true;

        transferFrom(from, to, balance);

        emit EmergencyTransfer(from, to, balance);
    }
    
}

