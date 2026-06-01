// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AuditEscrow} from "../src/AuditEscrow.sol";
import {AuditRegistry} from "../src/AuditRegistry.sol";
import {AuditCertificate} from "../src/AuditCertificate.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        AuditEscrow escrow = new AuditEscrow();
        console.log("AuditEscrow deployed at:", address(escrow));

        AuditRegistry registry = new AuditRegistry();
        console.log("AuditRegistry deployed at:", address(registry));

        AuditCertificate cert = new AuditCertificate();
        console.log("AuditCertificate deployed at:", address(cert));

        vm.stopBroadcast();
    }
}
