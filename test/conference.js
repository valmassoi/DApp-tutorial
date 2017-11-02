var Conference = artifacts.require("./Conference.sol");

contract('Conference', function(accounts) {
  it("Initial conference settings should match", function(done) {
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
});
