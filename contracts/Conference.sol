pragma solidity ^0.4.4;
// https://medium.com/@ConsenSys/a-101-noob-intro-to-programming-smart-contracts-on-ethereum-695d15c1dab4
contract Conference {
  address public owner;
  mapping (address => uint) public registrantsPaid;
  uint public numRegistrants;
  uint public quota;
  // so you can log these events
  event Deposit(address _from, uint _amount); // logged in the Ethereum Virtual Machine logs. They don’t actually do anything, but are good practice for keeping track that a transaction has happened.
  event Refund(address _to, uint _amount);
  function Conference() public { // Constructor
    owner = msg.sender;
    quota = 500;
    numRegistrants = 0;
  }
  function buyTicket() public payable returns (bool success) { // https://ethereum.stackexchange.com/questions/13268/msg-value-get-low-level-call-error
    if (numRegistrants >= quota) { return false; } // see footnote
     registrantsPaid[msg.sender] = msg.value;
     numRegistrants++;
     Deposit(msg.sender, msg.value);
     return true;
  }
  function changeQuota(uint newquota) public {
    if (msg.sender != owner) { return; }
    quota = newquota;
  }
  function refundTicket(address recipient, uint amount) public {
    if (msg.sender != owner) { return; }
    if (registrantsPaid[recipient] == amount) {
      address myAddress = this; // `this` is the contract address
      if (myAddress.balance >= amount) {
        recipient.transfer(amount);
        registrantsPaid[recipient] = 0;
        numRegistrants--;
        Refund(recipient, amount);
      }
     }
  }
  function destroy() public { // so funds not locked in contract forever
    if (msg.sender == owner) {
      selfdestruct(owner); // send funds to owner
    }
  }
}

/* [Footnote: Currently if the quota is reached, buyTicket() keeps the money in the contract but the buyer won’t get a ticket.
So buyTicket() should use ‘throw’ to revert ticket buyer’s transaction. */
