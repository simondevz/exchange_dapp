pragma solidity >=0.4.22 <0.9.0;

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// TODO:
// [x] Set the fee account
// [x] Deposit Ether
// [ ] Withdraw Ether
// [x] Deposite tokens
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
    address constant ETHER = address(0); // store ETHER in tokens mapping with blank address

    // Mappings
    mapping(address => mapping(address => uint256)) public tokens;

    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Fallback: reverts is Ether is sent to this smart contract by mistake
    fallback() external {
        revert();
    }

    function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]); 
    }

    function withdrawEther(uint _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        msg.sender.transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint _amount) public {
        require(_token != ETHER, "Invalid token address");
        require(Token(_token).transferFrom(msg.sender, address(this), _amount), "deposite failed");
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]); 
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER, "invalid address");
        require(tokens[_token][msg.sender] >= _amount, "insufficient funds");
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount), "could not complete transfer");
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

}
