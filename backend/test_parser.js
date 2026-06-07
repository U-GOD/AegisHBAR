const { parse } = require('@solidity-parser/parser');
const code = 'contract A { function b() { (bool sent,) = msg.sender.call{value: bal}(""); } }';
const ast = parse(code, { loc: true });
console.log(JSON.stringify(ast, null, 2));
