pragma solidity >=0.4.22 <0.9.0;

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// TODO:
// [x] Set the fee account
// [ ] Deposit Ether
// [ ] Withdraw Ether
// [ ] Deposite tokens
// [ ] Withdraw tokens
// [ ] Check balances
// [ ] Make order
// [ ] Cancel order
// [ ] fill orders
// [ ] Charge fees

contract Exchange {
    using SafeMath for uint;

    // Variables
    address public feeAccount; // the account that recieves exchange fees
    uint256 public feePercent; // the fee percentage

    // Mappings
    mapping(address => mapping(address => uint256)) public tokens;

    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]); 
    }

}
