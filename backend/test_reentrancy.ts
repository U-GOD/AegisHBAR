import { analyzeReentrancy } from './src/engine/analyzers/reentrancy';
import { parse } from '@solidity-parser/parser';

const code = `
contract A { 
    function withdraw() { 
        uint256 bal = balances[msg.sender]; 
        (bool sent, ) = msg.sender.call{value: bal}(""); 
        balances[msg.sender] = 0; 
    } 
}
`;

const ast = parse(code, { loc: true });
console.log(JSON.stringify(analyzeReentrancy(ast.children[0]), null, 2));
