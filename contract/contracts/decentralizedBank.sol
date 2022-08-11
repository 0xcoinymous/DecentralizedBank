// Decentralized Bank , Designed by Abolfazl Iraninasab
// first you should deploy Utility & Governance contracts and give the address of them as inputs of this contract constructor

// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "./governance.sol";
import "./utility.sol";

contract Bank is Context {

    address private owner;
    
    uint private totalValueLocked;
    uint8 rewardRate = 1 ;                          // by staking 10 UTL , you get 1 GVN per minute .
   
    Governance private governance ;
    Utility private utility ;
    
    constructor(Governance _governance , Utility _utility){
        governance = _governance ;
        utility = _utility ;
        owner = _msgSender();

    }

    // enum steps {                     \
    //     airdrop,                     |
    //     ICO,                         |====>>   currently not added to this project 
    //     staking                      |
    // }                                /

    // steps public step ;


    struct Staker{
        uint balance ;      // that has staked
        uint reward ;       // GVN 
        uint stakedTime ;                                // block.timestamp
        bool hasStaked ;
    }

    address[] public stakers;

    event tokenStaked(address staker , uint amount );
    event airdropped(address receiver ,uint amount);
    event tokenUnstaked(address staker , uint amount );
    event bought (address user , uint amount );
    event rewardGotten(address user, uint amount);

    mapping(address => bool) public gottenAirdrop ;     // has user been airdropped before ?
    mapping(address => Staker ) public staker;

    // mapping(address => uint ) public UTLBalance ;                                     \
    // mapping(address => uint ) public GVNBalance ;                                     |
    // mapping(address => bool) public hasStaked ;                                       |==>>>> implemented by structure 
    // mapping(address => uint ) public stakingBalance ; // UTL token user has staked    /
 

    modifier onlyOwner() {
        require(_msgSender() == owner , "only owner can execute this function ");
        _;
    }


    function getBankAddress() public view returns(address){
        return address(this);
    }

    function getUtilityAddress() public view returns(address){
        return address(utility);
    }

    function getGovernanceAddress() public view returns(address){
        return address(governance);
    }

    
    function getUTLBalance() public view returns(uint){
        // return UTLBalance[_msgSender()];
        return utility.balanceOf(_msgSender());
    }

    function getGVNBalance() public view returns(uint){
        // return GVNBalance[_msgSender()];
        return governance.balanceOf(_msgSender());

    }

    function getStakingBalance() public view returns(uint){
        return staker[_msgSender()].balance ;
    }

    function getRewardPNL() public view returns(uint){
        return staker[_msgSender()].reward ;
    }

    function getETHBalance() public view returns (uint ){
        return address(this).balance ;
    }


    function getOwner() public view returns(address){
        return owner;
    }

    function getRewardRate() public view returns(uint256){
        return rewardRate;
    }

    function getTotalValueLocked() public view returns(uint256){
        return totalValueLocked;
    }

    function getAirdrop() public{
        require( gottenAirdrop[_msgSender()] == false , "you can get Airdrop only once " );
        utility.transfer(_msgSender(), 5 * (10 ** 18));
        gottenAirdrop[_msgSender()] = true ;
        emit airdropped(_msgSender() , 5 * (10 ** 18) );                     // emit airdrop event

    }


    // To keep things simple, we just exchange 1 token for 1 Wei.
    function buyTokenICO() payable public{
        uint amountToBuy = msg.value;
        require(amountToBuy > 0, "You need to send some ether");
        utility.transfer(_msgSender(), amountToBuy);

        emit bought(_msgSender(),amountToBuy);
    }


    function stake(uint _amount) public {
        require(_amount > 0, "amount can't be 0");
       
        if(staker[_msgSender()].hasStaked){
            updateRewardGVN();
        }else {
            stakers.push(_msgSender());
            staker[_msgSender()].hasStaked = true ;
        }

        utility.advancedApprove(_msgSender() ,_amount) ;
        utility.transferFrom(_msgSender(), address(this), _amount);
        staker[_msgSender()].balance += _amount;
        staker[_msgSender()].stakedTime = block.timestamp ;

        totalValueLocked += _amount;
        emit tokenStaked(_msgSender(), _amount);
    }


    // with this unstake function you can define the amount of UTL that you want to unstake .

    // function unStake(uint _amount) public {                                      
    //     require(_amount < staker[_msgSender()].balance ,"insufficient balance");
    //     updateRewardGVN();
    //     utility.transferFrom(address(this),_msgSender(), _amount);
    //     staker[_msgSender()].balance -= _amount;
    //     staker[_msgSender()].stakedTime = block.timestamp ;
    //     rewardGVN();
    //     totalValueLocked -= _amount;
    //     emit tokenUnstaked( _msgSender() ,  _amount );

    // }


    function unStake() public {
        uint _amount = staker[_msgSender()].balance ;
        // utility.transferFrom(address(this),_msgSender(), _amount );  // in remix works but in vs code doesn't !!!!
        utility.transfer(_msgSender(), _amount );
        emit tokenUnstaked( _msgSender() ,_amount);
        staker[_msgSender()].balance = 0 ;
        totalValueLocked -= _amount;

        // staker[_msgSender()].stakedTime = block.timestamp ;
        updateRewardGVN();
        rewardGVN();
        // emit tokenUnstaked(_msgSender() , _amount );

    }


    function rewardGVN() public {
        _rewardGVN(_msgSender(),staker[_msgSender()].reward);
    }

    function _rewardGVN(address receiver , uint _amount ) private {
        // governance.transferFrom(address(this),receiver , _amount);       // in remix works but in vs code doesn't !!!!
        governance.transfer(receiver , _amount);
        emit rewardGotten(receiver , _amount);

        staker[_msgSender()].reward -= _amount;

    }


    function updateRewardGVN() public {
        _updateRewardGVN(_msgSender());
    }

    function _updateRewardGVN(address receiver) private {
        // require(staker[receiver].balance != 0 , "your cuurent balance is zero !");
        staker[receiver].reward += calcReward(receiver);
        staker[receiver].stakedTime = block.timestamp ;

    }

    function calcReward(address user) private view returns(uint ) {
        uint userBalance = staker[user].balance;
        // require((block.timestamp - staker[user].stakedTime) * userBalance >=100 , "please wait more");
        // uint _reward = staker[user].balance /10 ;
        // for(uint i = staker[user].stakedTime ; i< block.timestamp ; i++){
        //     _reward += userBalance/100 ;
        // }

        // by staking 10 UTL , you get 1 GVN per min :
        uint _reward = (block.timestamp - staker[user].stakedTime) * userBalance * rewardRate *16 / 10000 ;   
        return _reward ;

    }

}

// THE END

