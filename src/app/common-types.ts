import { Server } from 'hapi';
import { Url } from 'url';
import { User } from './user-routes';
import { UserDao } from './db/db';

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

export interface SamlResponseUnpacked {
  attributes: any[];
  idp: SamlConfig;
  nameID: string;
  nameIDFormat: string;
}

export type Predicate<T> = (i: T) => boolean;

export interface Dao<T> {
  findOne(p: Predicate<T>): T | undefined;
  findAll(p: Predicate<T>): T[];
  add(i: T): Dao<T>;
  remove(i: T): Dao<T>;
}

export interface Db {
  users: Dao<User>;
  ssoRequests: Map<string, SamlConfig>;
  sessionStorage: Map<string, any>;
}

export interface CommonContext {
  httpServer: Server;
  db: Db;
}
