import { Url } from 'url';

export type Kind = 'idp' | 'sp';

interface Credentials {
  certificate: string;
  privateKey: string;
}

type Endpoints = {
  logout: string;
} & ({
  login: string;
} | {
  assert: string;
});

export interface SamlConfig {
  entityID: string;
  credentials: Credentials[];
  endpoints: Endpoints;
  signAllRequests: boolean;
  signAllResponses: boolean;
  requireSignedRequests: boolean;
  requireSignedResponses: boolean;
}

export interface SamlResponse {
  method: 'POST' | 'GET';
  contentType?: 'x-www-form-urlencoded';
  formBody: { SAMLResponse: string };
  url: Url;
}

export interface IdProvider {
  produceSuccessResponse(sp: SamlConfig, respondToId: string, nameId: string, attributes: any): Promise<SamlResponse>;
}

export interface SamlResponseUnpacked {
  attributes: any[];
  idp: SamlConfig;
  nameID: string;
  nameIDFormat: string;
}
