// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Utility is ERC20 {

    string public _name = "utility" ;
    string public _symbol = "UTL";
    uint private _totalSupply ;
    address private owner ;
    address private bankAddress ;


    constructor() ERC20(_name, _symbol) {
        owner = _msgSender();
        _totalSupply = (10 ** 12) * ( 10**18 );
        _mint( owner , _totalSupply );
    }  

    function verifyBankContract(address _bankAddress) public {                     // get the address of Bank contract
    require(_msgSender()== owner," only owner can execute this function ");
    bankAddress = _bankAddress ;
    }

    function advancedApprove(address user , uint amount) public {
        require(_msgSender() == bankAddress," only Bank contract can execute this function ");
        _approve( user, bankAddress, amount);
    }

}