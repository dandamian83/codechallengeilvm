// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

import "../node_modules/hardhat/console.sol";

contract BonnieSituation is ERC20, Ownable {

    // EIP712 domain separator
    bytes32 private DOMAIN_SEPARATOR;

    // EIP712 message structure
    struct EmergencyTransfer {
        // The user needs to send just an operation code 
        // so that we'll be sure that he knows about our implementation.
        // Other than that we know everything about the operation
        // the 'from' address will be deducted from the EIP712 signature
        // and the 'to' address will be deducted from the corresponding 
        // backup address.
        uint8 operationCode;
    }

    // EmergencyTransfer type
    string private EMERGENCY_TRANSFER_TYPE = "EmergencyTransfer(uint8 operationCode)";

    // Mapping holding the backup address for each token holder
    mapping(address => address) private _backupAddress;

    // Mapping holding all the blacklisted address.
    // A blacklisted address is one who was hacked and for whom
    // the emergencyTransfer was excuted, so that 
    // now they can't hold any tokens anymore.
    mapping(address => bool) private blacklisted;

     // Token emergency transfer event
    event EmergencyTransferEvent(address indexed from, address indexed to, uint256 amount);

    modifier notBlacklisted(address _address) {
        require(!blacklisted[_address], "Address is blacklisted");
        _;
    }

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply) ERC20(_name, _symbol) {
        
        // Minting the initial supply of tokens
        _mint(msg.sender, _initialSupply * 10 ** uint256(_decimals));

        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
            keccak256('Bonnie Situation'),
            keccak256('1'),
            block.chainid,
            address(this)
        ));
    }

    function hashEmergencyTransfer(EmergencyTransfer memory _emergencyTransfer) private view returns (bytes32) {
        return keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                keccak256('EmergencyTransfer(uint8 operationCode)'),
                _emergencyTransfer.operationCode))
            )
        );
    }   


    // Allows token holders to transfer all their tokens to 
    // their previously registered backup address via an EIP712 signature.
    function emergencyTransfer(address from, EmergencyTransfer memory _emergencyTransfer, uint8 v, bytes32 r, bytes32 s) external {
        
        address tokenHolder = ecrecover(hashEmergencyTransfer(_emergencyTransfer), v, r, s);

        require(from == tokenHolder, "Invalid signature");

        require(!blacklisted[from], "Blacklisted address");

        require(_emergencyTransfer.operationCode == 1, "Bad operation code");

        require(balanceOf(from) > 0, "Address does not hold tokens.");

        require(_backupAddress[from] != address(0), "No backup address registered.");
        

        uint amount = balanceOf(from);

        require(amount > 0, "Signer does not hold any tokens.");
        
        _transfer(from, _backupAddress[from], amount);

        blacklisted[from] = true;

        emit EmergencyTransferEvent(from, _backupAddress[from], amount);
    }

    function _transfer(address _from, address _to, uint256 _amount) internal override {
        if (blacklisted[_to]) {
            require(_backupAddress[_to] != address(0), "Attempt to transfer to blacklisted address without a backup address.");
            return super._transfer(_from, _backupAddress[_to], _amount);
        }
        return super._transfer(_from, _to, _amount);
    }

    // Allows a token holder to register a backup address 
    // which will be used to transfer tokens to in case of emergency.
    function registerBackup(address _address) external {
        require(balanceOf(msg.sender) > 0, "You are not a token holder");
        require(_address != address(0), "Invalid backup address.");
        
        _backupAddress[msg.sender] = _address;
    }

    function backupAddress() public view returns(address) {
        return _backupAddress[msg.sender];
    }
}