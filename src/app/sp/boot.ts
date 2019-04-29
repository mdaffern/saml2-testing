import { CommonContext } from '../common-types';
import { makeDb } from '../db/db';
import { makeServer } from '../http/http';
import { makeSessionRoutes } from './session-routes';
import { makeSpBinding, SpInterface } from './sp-binding';
import { makeSsoRoutes } from './sso-routes';

export interface SpContext {
  sp: {
    serviceProvider: SpInterface;
    sendAuthnRequest(): Promise<any>;
  } & CommonContext;
}

export async function boot(): Promise<SpContext> {
  const db = makeDb();
  const spBinding = await makeSpBinding(db);
  const ssoRoutes = makeSsoRoutes(db, spBinding.sp);
  const sessionRoutes = makeSessionRoutes(db, spBinding);
  const httpServer = await makeServer([...ssoRoutes, ...sessionRoutes], 8070, db, 'sp');

  return {
    sp: {
      serviceProvider: spBinding.sp,
      db,
      httpServer,
      sendAuthnRequest() {
        return spBinding.sp.produceAuthnRequest(spBinding.idpConfig);
      }
    }
  };
}

// ServiceProvider.prototype.produceAuthnRequest = function(idp) {
// 	return requestConstruction.createBoundAuthnRequest(this.sp, idp, this.model);
// };

// ServiceProvider.prototype.consumePostResponse = function(formParams) {
// 	const response = protocolBindings.getDataFromPostBinding(formParams);
// 	return responseHandling.processResponse(this.model, this.sp, response);
// };

// ServiceProvider.prototype.consumeRedirectResponse = function(queryParams) {
// 	const response = protocolBindings.getDataFromRedirectBinding(queryParams);
// 	return responseHandling.processResponse(this.model, this.sp, response);
// };

// ServiceProvider.prototype.produceSPMetadata = function(shouldSign) {
// 	return metadata.buildSPMetadata(this.sp, (shouldSign === undefined) ? true : shouldSign);
// };

// ServiceProvider.prototype.getIDPFromMetadata = function(xml) {
// 	return metadata.getIDPFromMetadata(xml);
// };
