// ABI minimal -- cuma fungsi yang benar-benar dipakai relayer untuk operasi token biasa
// (transfer plain dari pool wallet). Ini BUKAN ABI kontrak Midtract, jangan dicampur.
export const ERC20_MINIMAL_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function decimals() view returns (uint8)',
];
