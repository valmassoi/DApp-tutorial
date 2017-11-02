var Conference = artifacts.require("./Conference.sol");

contract('Conference', (accounts) => {
  it("Initial conference settings should match", (done) => {
    Conference.deployed().then((conference) => {
      conference.quota.call().then((quota) => {
        assert.equal(quota, 500, "Quota doesn't match!")
      }).then(() => {
        return conference.numRegistrants.call();
      }).then((num) => {
        assert.equal(num, 0, "Registrants should be zero!");
        return conference.owner.call();
      }).then((owner) => {
        assert.equal(owner, accounts[0], "Owner doesn't match!");
        done(); // to stop these tests earlier, move this up
      }).catch(done);
    }).catch(done);
  });
  it("Should update quota", (done) => {
    Conference.deployed().then((conference) => {
      conference.quota.call().then((quota) => {
        assert.equal(quota, 500, "Quota doesn't match!");
      }).then(() => {
        return conference.changeQuota(300);
      }).then((result) => {
        console.log(result);
        // printed will be a long hex, the transaction hash
        return conference.quota.call();
      }).then((quota) => {
        assert.equal(quota, 300, "New quota is not correct!");
        done();
      }).catch(done);
    }).catch(done);
  });
  it("Should let you buy a ticket", (done) => {
    Conference.deployed().then((conference) => {
      var ticketPrice = web3.toWei(.05, 'ether'); // Web3.js provides convenience methods for converting ether to/from Wei
      // recommend keeping things in Wei in your code until users see it
      var initialBalance = web3.eth.getBalance(conference.address).toNumber();
      conference.buyTicket({ from: accounts[1], value: ticketPrice })
      .then(() => {
         var newBalance = web3.eth.getBalance(conference.address).toNumber();
         var difference = newBalance - initialBalance;
         assert.equal(difference, ticketPrice, "Difference should be what was sent");
         return conference.numRegistrants.call();
      }).then((num) => {
         assert.equal(num, 1, "there should be 1 registrant");
         return conference.registrantsPaid.call(accounts[1]);
      }).then((amount) => {
         assert.equal(amount.toNumber(), ticketPrice, "Sender's paid but is not listed");
         done();
      }).catch(done);
    }).catch(done);
  });
  it("Should issue a refund by owner only", (done) => {
    Conference.deployed().then((conference) => {
      var ticketPrice = web3.toWei(.05, 'ether');
      var initialBalance = web3.eth.getBalance(conference.address).toNumber();
      conference.buyTicket({from: accounts[1], value: ticketPrice }).then(() => {
        var newBalance = web3.eth.getBalance(conference.address).toNumber();
        var difference = newBalance - initialBalance;
        assert.equal(difference, ticketPrice, "Difference should be what was sent");
        // Now try to issue refund as second user - should fail
        return conference.refundTicket(accounts[1], ticketPrice, {from: accounts[1]});
      }).then(() => {
        var currentBalance = web3.eth.getBalance(conference.address).toNumber();
        var income = ticketPrice * 1
        var cumulatedBalance = initialBalance + income // no refund
        assert.equal(currentBalance, cumulatedBalance, "Balance should be unchanged");
        // Now try to issue refund as organizer/owner - should work
        return conference.refundTicket(accounts[1], ticketPrice, {from: accounts[0]});
      }).then(() => {
        var postRefundBalance = web3.eth.getBalance(conference.address).toNumber();
        assert.equal(postRefundBalance, initialBalance, "Balance should be initial balance");
        done();
      }).catch(done);
    }).catch(done);
  });
});
