import { CommonContext, SamlConfig, SamlResponse } from '../common-types';
import { makeDb } from '../db/db';
import { makeIdpBinding } from './idp-binding';
import { makeServer } from '../http/http';
import { makeSessionRoutes } from './session-routes';
import { makeSsoRoutes } from './sso-routes';

export interface IdpInterface {
  consumePostAuthnRequest(formParams: any): Promise<any>;
  consumeRedirectAuthnRequest(queryParams): Promise<any>;
  produceSuccessResponse(sp: SamlConfig, respondToId: string, nameId: string, attributes: any): Promise<SamlResponse>;
  produceFailureResponse(sp: SamlConfig, respondToId: string, errorMessage: any): Promise<void>;
}

export interface IdpContext {
  idp: {
    identityProvider: IdpInterface;
  } & CommonContext;
}

export async function boot(): Promise<IdpContext> {
  const db = makeDb();
  const idpBinding = await makeIdpBinding();
  const ssoRoutes = makeSsoRoutes(idpBinding.idp);
  const sessionRoutes = makeSessionRoutes(db, idpBinding);
  const httpServer = await makeServer([...ssoRoutes, ...sessionRoutes], 7001, db, 'idp');

  return {
    idp: {
      identityProvider: idpBinding.idp,
      db,
      httpServer
    }
  };
}

// IdentityProvider.prototype.consumePostAuthnRequest = function(formParams) {
// 	const request = protocolBindings.getDataFromPostBinding(formParams);
// 	return requestHandling.processAuthnRequest(this.model, this.idp, request);
// };

// IdentityProvider.prototype.consumeRedirectAuthnRequest = function(queryParams) {
// 	const request = protocolBindings.getDataFromRedirectBinding(queryParams);
// 	return requestHandling.processAuthnRequest(this.model, this.idp, request);
// };

// IdentityProvider.prototype.produceSuccessResponse = function(sp, inResponseTo, nameID, attributes) {
// 	return responseConstruction.buildBoundSuccessResponse(sp, this.idp, this.model, inResponseTo, nameID, attributes);
// };

// IdentityProvider.prototype.produceFailureResponse = function(sp, inResponseTo, errorMessage) {
// 	return responseConstruction.buildBoundAuthnFailureResponse(sp, this.idp, this.model, inResponseTo, errorMessage);
// };

// IdentityProvider.prototype.produceIDPMetadata = function(shouldSign) {
// 	return metadata.buildIDPMetadata(this.idp, (shouldSign === undefined) ? true : shouldSign);
// };

// IdentityProvider.prototype.getSPFromMetadata = function(xml) {
// 	return metadata.getSPFromMetadata(xml);
