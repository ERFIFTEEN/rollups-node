import { BytesLike } from "@ethersproject/bytes";
import epochStatus from "./epoch-status.json";

interface OutputValidityProofV1 {
    outputIndex: number;
    outputHashesRootHash: BytesLike;
    vouchersEpochRootHash: BytesLike;
    noticesEpochRootHash: BytesLike;
    machineStateHash: BytesLike;
    keccakInHashesSiblings: BytesLike[];
    outputHashesInEpochSiblings: BytesLike[];
}

function setupVoucherProof(epochInputIndex: number): OutputValidityProofV1 {
    let voucherDataKeccakInHashes =
        epochStatus.processedInputs[epochInputIndex].acceptedData.vouchers[0]
            .keccakInVoucherHashes;
    let voucherHashesInEpoch =
        epochStatus.processedInputs[epochInputIndex].voucherHashesInEpoch
            .siblingHashes;
    var siblingKeccakInHashesV: BytesLike[] = [];
    var voucherHashesInEpochSiblings: BytesLike[] = [];
    voucherDataKeccakInHashes.siblingHashes.forEach((element: any) => {
        siblingKeccakInHashesV.push(element.data);
    });
    voucherHashesInEpoch.forEach((element: any) => {
        voucherHashesInEpochSiblings.push(element.data);
    });
    let voucherProof: OutputValidityProofV1 = {
        outputIndex: 0,
        outputHashesRootHash: voucherDataKeccakInHashes.rootHash.data,
        vouchersEpochRootHash: epochStatus.mostRecentVouchersEpochRootHash.data,
        noticesEpochRootHash: epochStatus.mostRecentNoticesEpochRootHash.data,
        machineStateHash: epochStatus.mostRecentMachineHash.data,
        keccakInHashesSiblings: siblingKeccakInHashesV.reverse(),
        outputHashesInEpochSiblings: voucherHashesInEpochSiblings.reverse(),
    };
    return voucherProof;
}

function setupNoticeProof(epochInputIndex: number): OutputValidityProofV1 {
    let noticeDataKeccakInHashes =
        epochStatus.processedInputs[epochInputIndex].acceptedData.notices[0]
            .keccakInNoticeHashes;
    let noticeHashesInEpoch =
        epochStatus.processedInputs[epochInputIndex].noticeHashesInEpoch
            .siblingHashes;
    var siblingKeccakInHashesN: BytesLike[] = [];
    var noticeHashesInEpochSiblingsN: BytesLike[] = [];
    noticeDataKeccakInHashes.siblingHashes.forEach((element) => {
        siblingKeccakInHashesN.push(element.data);
    });
    noticeHashesInEpoch.forEach((element) => {
        noticeHashesInEpochSiblingsN.push(element.data);
    });
    let noticeProof: OutputValidityProofV1 = {
        outputIndex: 0,
        outputHashesRootHash: noticeDataKeccakInHashes.rootHash.data,
        vouchersEpochRootHash: epochStatus.mostRecentVouchersEpochRootHash.data,
        noticesEpochRootHash: epochStatus.mostRecentNoticesEpochRootHash.data,
        machineStateHash: epochStatus.mostRecentMachineHash.data,
        keccakInHashesSiblings: siblingKeccakInHashesN.reverse(), // from top-down to bottom-up
        outputHashesInEpochSiblings: noticeHashesInEpochSiblingsN.reverse(),
    };
    return noticeProof;
}

function buildSolCodes(voucherProof: OutputValidityProofV1, noticeProof: OutputValidityProofV1, libraryName: string): string {
    const array1 = noticeProof.keccakInHashesSiblings;
    const array2 = noticeProof.outputHashesInEpochSiblings;
    const array3 = voucherProof.keccakInHashesSiblings;
    const array4 = voucherProof.outputHashesInEpochSiblings;
    const lines: string[] = [
        "// SPDX-License-Identifier: UNLICENSED",
        "",
        "pragma solidity ^0.8.13;",
        "",
        "// THIS FILE WAS AUTOMATICALLY GENERATED BY `genProofLibraries.ts`.",
        "",
        'import {OutputValidityProofV1} from "contracts/library/LibOutputValidationV1.sol";',
        'import {OutputValidityProofV2} from "contracts/library/LibOutputValidationV2.sol";',
        "",
        `library ${libraryName} {`,
        "    function getNoticeProofV1() internal pure returns (OutputValidityProofV1 memory) {",
        `        uint256[${array1.length}] memory array1 = [${array1}];`,
        `        uint256[${array2.length}] memory array2 = [${array2}];`,
        `        bytes32[] memory keccakInHashesSiblings = new bytes32[](${array1.length});`,
        `        bytes32[] memory outputHashesInEpochSiblings = new bytes32[](${array2.length});`,
        `        for (uint256 i; i < ${array1.length}; ++i) { keccakInHashesSiblings[i] = bytes32(array1[i]); }`,
        `        for (uint256 i; i < ${array2.length}; ++i) { outputHashesInEpochSiblings[i] = bytes32(array2[i]); }`,
        `        return OutputValidityProofV1({`,
        `            outputIndex: ${noticeProof.outputIndex},`,
        `            outputHashesRootHash: ${noticeProof.outputHashesRootHash},`,
        `            vouchersEpochRootHash: ${noticeProof.vouchersEpochRootHash},`,
        `            noticesEpochRootHash: ${noticeProof.noticesEpochRootHash},`,
        `            machineStateHash: ${noticeProof.machineStateHash},`,
        "            keccakInHashesSiblings: keccakInHashesSiblings,",
        "            outputHashesInEpochSiblings: outputHashesInEpochSiblings",
        "        });",
        "    }",
        "    function getNoticeProofV2() internal pure returns (OutputValidityProofV2 memory) {",
        `        uint256[${array1.length}] memory array1 = [${array1}];`,
        `        uint256[${array2.length}] memory array2 = [${array2}];`,
        `        bytes32[] memory keccakInHashesSiblings = new bytes32[](${array1.length});`,
        `        bytes32[] memory outputHashesInEpochSiblings = new bytes32[](${array2.length});`,
        `        for (uint256 i; i < ${array1.length}; ++i) { keccakInHashesSiblings[i] = bytes32(array1[i]); }`,
        `        for (uint256 i; i < ${array2.length}; ++i) { outputHashesInEpochSiblings[i] = bytes32(array2[i]); }`,
        `        return OutputValidityProofV2({`,
        `            outputIndex: ${noticeProof.outputIndex},`,
        `            outputHashesRootHash: ${noticeProof.outputHashesRootHash},`,
        `            outputsEpochRootHash: ${noticeProof.noticesEpochRootHash},`,
        `            machineStateHash: ${noticeProof.machineStateHash},`,
        "            keccakInHashesSiblings: keccakInHashesSiblings,",
        "            outputHashesInEpochSiblings: outputHashesInEpochSiblings",
        "        });",
        "    }",
        "    function getVoucherProofV1() internal pure returns (OutputValidityProofV1 memory) {",
        `        uint256[${array3.length}] memory array3 = [${array3}];`,
        `        uint256[${array4.length}] memory array4 = [${array4}];`,
        `        bytes32[] memory keccakInHashesSiblings = new bytes32[](${array3.length});`,
        `        bytes32[] memory outputHashesInEpochSiblings = new bytes32[](${array4.length});`,
        `        for (uint256 i; i < ${array3.length}; ++i) { keccakInHashesSiblings[i] = bytes32(array3[i]); }`,
        `        for (uint256 i; i < ${array4.length}; ++i) { outputHashesInEpochSiblings[i] = bytes32(array4[i]); }`,
        `        return OutputValidityProofV1({`,
        `            outputIndex: ${voucherProof.outputIndex},`,
        `            outputHashesRootHash: ${voucherProof.outputHashesRootHash},`,
        `            vouchersEpochRootHash: ${voucherProof.vouchersEpochRootHash},`,
        `            noticesEpochRootHash: ${voucherProof.noticesEpochRootHash},`,
        `            machineStateHash: ${voucherProof.machineStateHash},`,
        "            keccakInHashesSiblings: keccakInHashesSiblings,",
        "            outputHashesInEpochSiblings: outputHashesInEpochSiblings",
        "        });",
        "    }",
        "    function getVoucherProofV2() internal pure returns (OutputValidityProofV2 memory) {",
        `        uint256[${array3.length}] memory array3 = [${array3}];`,
        `        uint256[${array4.length}] memory array4 = [${array4}];`,
        `        bytes32[] memory keccakInHashesSiblings = new bytes32[](${array3.length});`,
        `        bytes32[] memory outputHashesInEpochSiblings = new bytes32[](${array4.length});`,
        `        for (uint256 i; i < ${array3.length}; ++i) { keccakInHashesSiblings[i] = bytes32(array3[i]); }`,
        `        for (uint256 i; i < ${array4.length}; ++i) { outputHashesInEpochSiblings[i] = bytes32(array4[i]); }`,
        `        return OutputValidityProofV2({`,
        `            outputIndex: ${voucherProof.outputIndex},`,
        `            outputHashesRootHash: ${voucherProof.outputHashesRootHash},`,
        `            outputsEpochRootHash: ${voucherProof.noticesEpochRootHash},`,
        `            machineStateHash: ${voucherProof.machineStateHash},`,
        "            keccakInHashesSiblings: keccakInHashesSiblings,",
        "            outputHashesInEpochSiblings: outputHashesInEpochSiblings",
        "        });",
        "    }",
        "}",
        "",
    ];
    return lines.join("\n");
}

const fs = require("fs");

epochStatus.processedInputs.forEach((value, index) => {
    let libraryName = `LibOutputProof${index}`;
    let noticeProof = setupNoticeProof(index);
    let voucherProof = setupVoucherProof(index);
    let solidityCode = buildSolCodes(voucherProof, noticeProof, libraryName);
    let fileName = `${libraryName}.sol`;
    fs.writeFile(fileName, solidityCode, (err: any) => {
        if (err) throw err;
        console.log(`File '${fileName}' was generated.`);
    });
});
