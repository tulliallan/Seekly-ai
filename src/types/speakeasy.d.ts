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

  interface VerifyOptions {
    secret: string;
    encoding?: 'ascii' | 'hex' | 'base32';
    token: string;
    window?: number;
    step?: number;
    time?: number;
    counter?: number;
    digits?: number;
    algorithm?: 'sha1' | 'sha256' | 'sha512';
  }

  export function generateSecret(options?: GenerateSecretOptions): Secret;
  
  export const totp: {
    generate: (options: {
      secret: string;
      encoding?: 'ascii' | 'hex' | 'base32';
      step?: number;
      time?: number;
      counter?: number;
      digits?: number;
      algorithm?: 'sha1' | 'sha256' | 'sha512';
    }) => string;
    
    verify: (options: VerifyOptions) => boolean;
  };

  export function hotp(options: {
    secret: string;
    counter: number;
    digits?: number;
    encoding?: string;
  }): string;
} 