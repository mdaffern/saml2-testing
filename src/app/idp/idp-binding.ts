import * as _glob from 'glob';
import * as path from 'path';
import { configFromFiles } from '../saml/parse-saml';
import { IdentityProvider } from '@socialtables/saml-protocol';
import { promisify } from 'util';
import { SamlConfig, SamlResponse } from '../common-types';

const glob = promisify(_glob);
const resourcePath = path.join(__dirname, '..', '..', '..', 'resources');
const idpMetaPath = path.join(resourcePath, 'identityProviders', 'idp1', 'idp-metadata.xml');
const idpKeyPath = path.join(resourcePath, 'identityProviders', 'idp1', 'key.pem');

export interface IdpInterface {
  consumePostAuthnRequest(formParams: any): Promise<any>;
  consumeRedirectAuthnRequest(): Promise<any>;
  produceSuccessResponse(sp: SamlConfig, respondToId: string, nameId: string, attributes: any): Promise<SamlResponse>;
  produceFailureResponse(sp: SamlConfig, respondToId: string, errorMessage: any): Promise<void>;
}

export interface IdpBinding {
  idp: IdpInterface;
  idpConfig: SamlConfig;
  spMap: Map<string, SamlConfig>;
}

// Only one pair of these because we are a service provider
export async function makeIdpBinding(): Promise<IdpBinding> {
  const [idp, spPaths] = await Promise.all([
    configFromFiles(idpMetaPath, idpKeyPath, 'idp'),
    glob(resourcePath + '/serviceProviders/**/sp-metadata.xml')
  ]);
  const sps = await Promise.all(spPaths.map(p => configFromFiles(p, undefined, 'sp')));
  const spLookup = new Map<string, SamlConfig>();
  sps.forEach(sp => spLookup.set(sp.entityID, sp));

  const idpObj = new IdentityProvider(idp, {
    getServiceProvider(entityId) {
      const config = spLookup.get(entityId);

      if (config) {
        return Promise.resolve(config);
      } else {
        return Promise.reject();
      }
    }
  });

  return {
    idp: idpObj,
    idpConfig: idp,
    spMap: spLookup
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
