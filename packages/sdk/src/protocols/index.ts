// Exports protocols module
export { ProtocolNamespace } from './ProtocolNamespace';
export { ProtocolManager } from './base/ProtocolManager';
export { BaseProtocol } from './base/BaseProtocol';

// Specific protocols
export { BeefyProtocol } from './implementations/BeefyProtocol';
// export { AaveProtocol } from './implementations/AaveProtocol';
// export { MorphoProtocol } from './implementations/MorphoProtocol';

// Types
export type { ProtocolInfo, VaultInfo, VaultOperations } from '../types/protocol';