Taruh Midtract.json (ABI hasil `hardhat compile`) di folder ini:

    cd contracts && npm run compile
    cp artifacts/src/Midtract.sol/Midtract.json ../shared/abi/Midtract.json

Backend & frontend sama-sama import dari sini via relative path —
jangan copy manual ke masing-masing folder, supaya tetap satu sumber.
