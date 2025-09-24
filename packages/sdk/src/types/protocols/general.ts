import type { BaseProtocol } from '@/protocols/base/BaseProtocol';

/**
 * Base information that can be used to identify a protocol
 */
export interface ProtocolInfo {
  id: string;
  name: string;
  website: string;
  logo: string;
  supportedChains: number[];
  riskLevel: 'low' | 'medium' | 'high';
  isPremium: boolean;
}

export interface Protocol {
  instance: BaseProtocol;
  info: ProtocolInfo;
}

/**
 * The protocols router config that defines which protocols should be used for an integrator
 */
export interface ProtocolsRouterConfig {
  riskLevel: 'low' | 'medium' | 'high';
  minApy?: number;
  apiKey?: string;
}
