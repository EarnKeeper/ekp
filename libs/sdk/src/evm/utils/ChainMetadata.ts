import { ChainId } from './ChainId';

export interface ChainMetadata {
  readonly id: ChainId;
  readonly logo: string;
  readonly name: string;
  readonly token: {
    readonly coinId: string;
    readonly contractAddress: string;
    readonly decimals: number;
    readonly name: string;
    readonly symbol: string;
  };
}