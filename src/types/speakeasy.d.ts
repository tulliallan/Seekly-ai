declare module 'speakeasy' {
  interface GenerateSecretOptions {
    name?: string;
    issuer?: string;
    length?: number;
    symbols?: boolean;
    otpauth_url?: boolean;
  }

  interface Secret {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url?: string;
  }

  export function generateSecret(options?: GenerateSecretOptions): Secret;
  
  export function totp({
    secret,
    encoding,
    step,
    time,
    counter,
    digits,
    algorithm
  }: {
    secret: string;
    encoding?: 'ascii' | 'hex' | 'base32';
    step?: number;
    time?: number;
    counter?: number;
    digits?: number;
    algorithm?: 'sha1' | 'sha256' | 'sha512';
  }): string;

  export function hotp(options: {
    secret: string;
    counter: number;
    digits?: number;
    encoding?: string;
  }): string;
} 