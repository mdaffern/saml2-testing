import * as path from 'path';
import { configFromFiles } from '../parse-saml';
import { IdentityProvider } from '@socialtables/saml-protocol';
import { SamlConfig, SamlResponse } from '../common-types';

const resourcePath = path.join(__dirname, '..', '..', '..', 'resources');
const idpMetaPath = path.join(resourcePath, 'idp1', 'idp-metadata.xml');
const idpKeyPath = path.join(resourcePath, 'idp1', 'key.pem');
const spMetaPath = path.join(resourcePath, 'sp1', 'sp-metadata.xml');
const spKeyPath = path.join(resourcePath, 'sp1', 'key.pem');

export interface IdpInterface {
  consumePostAuthnRequest(formParams: any): Promise<any>;
  consumeRedirectAuthnRequest(): Promise<any>;
  produceSuccessResponse(sp: SamlConfig, respondToId: string, nameId: string, attributes: any): Promise<SamlResponse>;
  produceFailureResponse(sp: SamlConfig, respondToId: string, errorMessage: any): Promise<void>;
}

export interface IdpBinding {
  idp: IdpInterface;
  idpConfig: SamlConfig;
  spConfig: SamlConfig;
}

export async function makeIdpBinding(): Promise<IdpBinding> {
  const [idp, sp] = await Promise.all([
    configFromFiles(idpMetaPath, idpKeyPath, 'idp'),
    configFromFiles(spMetaPath, spKeyPath, 'sp')
  ]);

  const spLookup = new Map<string, SamlConfig>([
    [idp.entityID, idp]
  ]);

  const idpObj = new IdentityProvider(idp, {
    getServiceProvider(entityId) {
      const config = spLookup.get(entityId);

      if (config) {
        Promise.resolve(config);
      } else {
        Promise.reject();
      }
    }
  });

  return {
    idp: idpObj,
    idpConfig: idp,
    spConfig: sp
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
