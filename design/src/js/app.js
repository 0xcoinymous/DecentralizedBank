$(function () {
    $(window).load(function () {
        //  alert("hello");
        PrepareNetwork();
    });
});

var Owner = null;


async function PrepareNetwork() {
    await loadWeb3();
    await LoadDataSmartContract();
}

async function loadWeb3() {

    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
            CurrentAccount = accounts[0];
            web3.eth.defaultAccount = CurrentAccount;
            console.log('current account: ' + CurrentAccount);
            setCurrentAccount();
        });
        //  console.log(a);
    }
    else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        //   console.log('2');
    }
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    ethereum.on('accountsChanged', handleAccountChanged);
    ethereum.on('chainChanged', handleChainChanged);

}

function setCurrentAccount() {
    // var newaddress = CurrentAccount.slice(0, 6) + " ... " + CurrentAccount.slice(38, 42);
    // $('#AddressFill').text(newaddress);
    $('#AddressFill').text(CurrentAccount);

}

async function handleAccountChanged() {
    await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
        CurrentAccount = accounts[0];
        web3.eth.defaultAccount = CurrentAccount;
        console.log('current account: ' + CurrentAccount);
        setCurrentAccount();
    });
}

async function handleChainChanged(_chainId) {

    window.location.reload();
    console.log('Chain Changed: ', _chainId);
}

async function LoadDataSmartContract() {
    await $.getJSON('Bank.json', function (contractData) {
        // console.log('JsonContract: ',contractData);
        JsonContract = contractData;
    });


    web3 = await window.web3;

    const networkId = await web3.eth.net.getId();
    // console.log('networkId: ',networkId);

    const networkData = JsonContract.networks[networkId];

    if (networkData) {
        MyContract = new web3.eth.Contract(JsonContract.abi, networkData.address);

        Owner = await MyContract.methods.getOwner().call();
        // console.log('Owner: ', Owner);

        TolalValueLocked = await MyContract.methods.getTotalValueLocked().call();
        // console.log('TolalValueLocked: ', web3.utils.fromWei(TolalValueLocked));
        $('#Locked').text(web3.utils.fromWei(TolalValueLocked));

        UTLBalance = await MyContract.methods.getUTLBalance().call();
        UTLBalance = web3.utils.fromWei(UTLBalance);
        // console.log('UTLBalance: ', UTLBalance);
        $('#UTLBalance').text(UTLBalance);

        GVNBalance = await MyContract.methods.getGVNBalance().call();
        GVNBalance = web3.utils.fromWei(GVNBalance);
        // console.log('GVNBalance: ', GVNBalance);
        $('#GVNBalance').text(GVNBalance);

        UTLStaked = await MyContract.methods.getStakingBalance().call();
        UTLStaked = web3.utils.fromWei(UTLStaked);
        // console.log('UTLStaked: ', UTLStaked);
        $('#UTLStaked').text(UTLStaked);

        ///////////////
        RewardPNL = await MyContract.methods.getRewardPNL().call();
        RewardPNL = web3.utils.fromWei(RewardPNL);
        // console.log('RewardPNL: ', RewardPNL);
        $('#RewardPNL').text(RewardPNL);

        RewardRate = await MyContract.methods.getRewardRate().call();
        // console.log('RewardRate: ', RewardRate);
        $('#RewardRate').text(RewardRate);
        $('#RewardRatemsg').text(RewardRate);


        UtilityAddress = await MyContract.methods.getUtilityAddress().call();
        // console.log('UtilityAddress: ', UtilityAddress);
        $('#UTLAddress').text(UtilityAddress);

        GovernanceAddress = await MyContract.methods.getGovernanceAddress().call();
        // console.log('GovernanceAddress: ', GovernanceAddress);
        $('#GVNAddress').text(GovernanceAddress);

    }


    $(document).on('click', '#buyUTL', buyTokenICO);
    $(document).on('click', '#stake', stake);
    $(document).on('click', '#updateRewardGVN', updateRewardGVN);
    $(document).on('click', '#rewardGVN', rewardGVN);
    $(document).on('click', '#unStake', unStake);
    $(document).on('click', '#getAirdrop', getAirdrop);


}


function unStake() {
    
    MyContract.methods.unStake().send({ from: CurrentAccount }).then(function (Instance) {
        // console.log("instance" + Instance );
        console.log("Unstake:");
        window.alert("Unstaked successfully " + Instance.events.tokenUnstaked.returnValues[1] + "UTL");
        console.log("rewardGotten:");
        window.alert("successfully send " + Instance.events.rewardGotten.returnValues[1]+ "GVN token as your reward");
        // window.alert("successfully unStaked");
        window.location.reload();
       // Instance.events.rewardGotten.returnValues[1]

    }).catch(function (error) {
        console.log("error: ", error);
        window.alert("ERROR : " + error);
    });

}

function rewardGVN() {
    
    MyContract.methods.rewardGVN().send({ from: CurrentAccount }).then(function (Instance) {

        window.alert("successfully send " + Instance.events.rewardGotten.returnValues[1]+ "GVN token as your reward")
        window.location.reload();

    }).catch(function (error) {
        console.log("error: ", error);
    });

}

function updateRewardGVN() {
    
    MyContract.methods.updateRewardGVN().send({ from: CurrentAccount }).then(function (Instance) {

        window.alert("your reward successfully updated! ")
        window.location.reload();

    }).catch(function (error) {
        console.log("error: ", error);
    });

}





function stake(){
    var stakeAmount = $(stakeValue).val();
    // console.log("stake value" + stakeAmount);
    if (Number(stakeAmount) <= 0) {
        window.alert("Fill the stake box please !");
        return;
    }
    // console.log("stake value" + stakeAmount);

    stakeAmount = web3.utils.toWei(stakeAmount, 'ether');
    console.log("stakeAmount:" + stakeAmount);

    MyContract.methods.stake(stakeAmount).send({ from: CurrentAccount}).then(async function (Instance) {
        // console.log("stake instance" + Instance );
        window.alert("Staked successfully (amount : " + Instance.events.tokenStaked.returnValues[1] + " Wei)")
        window.location.reload();

    }).catch(function (error) {
        console.log(error);

    });
}

function buyTokenICO(){
    var buyAmount = $(buyValue).val();
    // console.log("buyAmount" + buyAmount);
    if (Number(buyAmount) <= 0) {
        window.alert("Fill the stake box please !");
        return;
    }
    console.log("buyAmount" + buyAmount);

    buyAmount = web3.utils.toWei(buyAmount, 'ether');
    // console.log("buyAmount:" + buyAmount);

    MyContract.methods.buyTokenICO().send({ from: CurrentAccount, value: buyAmount }).then(async function (Instance) {
        // window.alert("Bought successfully (amount : " + Instance.events.bought.returnValues[1] + " Wei)");
        window.alert("Bought successfully (amount : " + web3.utils.fromWei(Instance.events.bought.returnValues[1] , 'ether') + " ETH)");

        window.location.reload();

    }).catch(function (error) {
        console.log(error);

    });
}

function getAirdrop() {
    MyContract.methods.getAirdrop().send({ from: CurrentAccount }).then(function (Instance) {

    window.alert("Airdrop successfully (amount : " + Instance.events.airdropped.returnValues[1] + " Wei)")
    window.location.reload();

    }).catch(function (error) {
        console.log("error: ", error);
    });
}


// function Close() {
//     window.location.reload();
// }

//////////////////////////////////////
// web3.utils.fromWei(amount , 'ether')
// web3.utils.fromWei(Instance.events.bought.returnValues[1] , 'ether')