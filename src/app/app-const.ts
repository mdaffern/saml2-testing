import { hashAny } from './primitive/hash';

export const secret = 'cad3a4ab-7d6c-4e87-825a-feda4248ed9b';
export const secretNoDash = secret.replace('-', '');
export const secretNum = hashAny(secret);
