import { getOctets } from './string';

export function hashAny(toHash: any): number {
  let input = toHash;

  if (typeof toHash != 'string') {
    input = JSON.stringify(input);
  }
  return hash(getOctets(input));
}

const maxUint32 = 0xffffffff;
const FNV_PRIME_32 = 16777619;
const FNV_OFFSET_32 = 2166136261;

export function hash(octets: number[]): number {
  let output = FNV_OFFSET_32;

  for (const octet of octets) {
    output = (output ^ octet) * FNV_PRIME_32 & maxUint32;
  }
  return output;
}
