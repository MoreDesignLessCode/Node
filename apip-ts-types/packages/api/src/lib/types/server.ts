import * as http from 'http';
import * as https from 'https';
import * as http2 from 'http2';

export type Server =
  | http.Server
  | https.Server
  | http2.Http2Server
  | http2.Http2SecureServer;
