export type JwtHeader = {
  alg: string | Algorithm;
  typ?: string | undefined;
  cty?: string | undefined;
  crit?: Array<string | Exclude<keyof JwtHeader, 'crit'>> | undefined;
  kid?: string | undefined;
  jku?: string | undefined;
  x5u?: string | string[] | undefined;
  'x5t#S256'?: string | undefined;
  x5t?: string | undefined;
  x5c?: string | string[] | undefined;
};

// standard claims https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
export type JwtPayload = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  iss?: string | undefined;
  sub?: string | undefined;
  aud?: string | string[] | undefined;
  exp?: number | undefined;
  nbf?: number | undefined;
  iat?: number | undefined;
  jti?: string | undefined;
};

export type Jwt = {
  header: JwtHeader;
  payload: JwtPayload | string;
  signature: string;
};

export type Algorithm =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'none';
