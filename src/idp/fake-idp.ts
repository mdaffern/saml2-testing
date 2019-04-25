import { IdentityProvider } from '@socialtables/saml-protocol';
import { Server } from 'hapi';
import * as path from 'path';
import { IdProvider, SamlConfig, SamlResponse } from '../common-types';
import { makeServer } from '../http';
import { configFromFiles } from '../parse-saml';
import { makeRoutes } from './routes';
import Axios from 'axios';
import * as qs from 'querystring';
import { format } from 'url';

export interface IdpContext {
  idp: {
    httpServer: Server;
    sendAssertion(entityId: string): Promise<any>;
  };
}

const resourcePath = path.join(__dirname, '..', '..', 'resources');
const idpMetaPath = path.join(resourcePath, 'idp1', 'idp-metadata.xml');
const idpKeyPath = path.join(resourcePath, 'idp1', 'key.pem');
const spMetaPath = path.join(resourcePath, 'sp1', 'sp-metadata.xml');
const spKeyPath = path.join(resourcePath, 'sp1', 'key.pem');

export function boot(): Promise<IdpContext> {
  return Promise
    .all([
      configFromFiles(idpMetaPath, idpKeyPath, 'idp'),
      configFromFiles(spMetaPath, spKeyPath, 'sp')
    ])
    .then(([idp, sp]) => {
      const spLookup = new Map<string, SamlConfig>([
        [idp.entityID, idp]
      ]);

      const identityProvider: IdProvider = new IdentityProvider(idp, {
        getServiceProvider(entityId) {
          const config = spLookup.get(entityId);

          if (config) {
            Promise.resolve(config);
          } else {
            Promise.reject();
          }
        }
      });

      return makeServer(makeRoutes(identityProvider), 7001)
        .then((httpServer) => {
          return {
            idp: {
              httpServer,
              sendAssertion(nameId = 'e69da125-4e1b-423c-ba92-1252c28a3066') {
                const attributes = { name: 'john' };
                // This is for the flow where the sp sends an authn request first
                // this would be used to correlate request with response
                const respondToId = '1234';

                return identityProvider
                  .produceSuccessResponse(sp, respondToId, nameId, attributes)
                  .then((samlResp) => {
                    return Axios.post(format(samlResp.url), qs.stringify(samlResp.formBody), {
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                      },
                    });
                  })
                  .then(resp => resp.statusText)
                  .catch((thrown) => console.log(`t >>> ${require('util').inspect(thrown)}`));
              }
            }
          };
        });
    });
}
// app.idp.sendAssertion().then(x => console.log(`x >>> ${require('util').inspect(x)}`))
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
