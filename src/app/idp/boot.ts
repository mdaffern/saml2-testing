import * as qs from 'querystring';
import Axios from 'axios';
import { CommonContext, SamlConfig, SamlResponse } from '../common-types';
import { format } from 'url';
import { makeDb } from '../db/db';
import { makeIdpBinding } from './idp-binding';
import { makeServer } from '../http/http';
import { makeSessionRoutes } from './session-routes';
import { makeSsoRoutes } from './sso-routes';
import { secret } from '../app-const';

export interface IdpInterface {
  consumePostAuthnRequest(formParams: any): Promise<any>;
  consumeRedirectAuthnRequest(queryParams): Promise<any>;
  produceSuccessResponse(sp: SamlConfig, respondToId: string, nameId: string, attributes: any): Promise<SamlResponse>;
  produceFailureResponse(sp: SamlConfig, respondToId: string, errorMessage: any): Promise<void>;
}

export interface IdpContext {
  idp: {
    identityProvider: IdpInterface;
    sendAssertion(entityId: string): Promise<any>;
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
      httpServer,
      sendAssertion(nameId = 'e69da125-4e1b-423c-ba92-1252c28a3066') {
        const attributes = db.users.findOne(u => u.uuid == nameId);
        // This is for the flow where the sp sends an authn request first
        // this would be used to correlate request with response
        // this matches the hardcoded default respondToId in fake-sp
        const respondToId = secret;

        return idpBinding.idp
          .produceSuccessResponse(idpBinding.spConfig, respondToId, nameId, attributes)
          .then((samlResp) => {
            return Axios.post(format(samlResp.url), qs.stringify(samlResp.formBody), {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            });
          });
      }
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
