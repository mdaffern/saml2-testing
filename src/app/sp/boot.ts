import { CommonContext, SamlConfig } from '../common-types';
import { makeDb } from '../db';
import { makeRoutes } from './routes';
import { makeServer } from '../http';
import { makeSpBinding, SpInterface } from './spBinding';

export interface SpContext {
  sp: {
    serviceProvider: SpInterface;
    sendAuthnRequest(): Promise<any>;
  } & CommonContext;
}

export async function boot(): Promise<SpContext> {
  const db = makeDb();
  const spBinding = await makeSpBinding();
  const routes = makeRoutes(spBinding.sp);
  const httpServer = await makeServer(routes, 8080, db);

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
