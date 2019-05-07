import * as path from 'path';
import { configFromFiles } from '../saml/parse-saml';
import { Db, SamlConfig, SamlResponseUnpacked } from '../common-types';
import { isEqual as deepEqual } from 'lodash';
import { secret } from '../app-const';
import { ServiceProvider } from '@socialtables/saml-protocol';

const resourcePath = path.join(__dirname, '..', '..', '..', 'resources');
const idpMetaPath = path.join(resourcePath, 'identityProviders', 'idp1', 'idp-metadata.xml');
const idpKeyPath = path.join(resourcePath, 'identityProviders', 'idp1', 'key.pem');
const spMetaPath = path.join(resourcePath, 'serviceProviders', 'sp1', 'sp-metadata.xml');
const spKeyPath = path.join(resourcePath, 'serviceProviders', 'sp1', 'key.pem');

export interface SpInterface {
  produceAuthnRequest(idp: SamlConfig): Promise<any>;
  consumePostResponse(formParams: any): Promise<SamlResponseUnpacked>;
  consumeRedirectResponse(queryParams: any): Promise<SamlResponseUnpacked>;
}

export interface SpBinding {
  sp: SpInterface;
  idpConfig: SamlConfig;
  spConfig: SamlConfig;
}

export async function makeSpBinding(db: Db): Promise<SpBinding> {
  const [idp, sp] = await Promise.all([
    configFromFiles(idpMetaPath, idpKeyPath, 'idp'),
    configFromFiles(spMetaPath, spKeyPath, 'sp'),
  ]);

  const idpLookup = new Map<string, SamlConfig>([
    [idp.entityID, idp]
  ]);

  const spObj = new ServiceProvider(sp, {
    getIdentityProvider(entityId) {
      const config = idpLookup.get(entityId);

      if (config) {
        return Promise.resolve(config);
      } else {
        return Promise.reject();
      }
    },
    storeRequestID(requestId, idpConfig: SamlConfig) {
      db.ssoRequests.set(requestId, idpConfig);
      return Promise.resolve();
    },
    verifyRequestID(requestId, idpConfig) {
      if (secret == requestId) { // this matches the hardcoded default respondToId
        return Promise.resolve();
      }
      // _548851ece455ad159dcffcc20a8a4eb09a9d30ba1f
      if (idpConfig && deepEqual(idpConfig, db.ssoRequests.get(requestId))) {
        return Promise.resolve();
      }
      return Promise.reject();
    },
    invalidateRequestID(requestId) {
      db.ssoRequests.delete(requestId);
      return Promise.resolve();
    }
  });

  return {
    sp: spObj,
    idpConfig: idp,
    spConfig: sp
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
