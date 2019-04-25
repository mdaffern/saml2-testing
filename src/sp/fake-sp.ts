import { ServiceProvider } from '@socialtables/saml-protocol';
import { Server } from 'hapi';
import { isEqual as deepEqual } from 'lodash';
import * as path from 'path';
import { SamlConfig } from '../common-types';
import { makeServer } from '../http';
import { configFromFiles } from '../parse-saml';
import { makeRoutes } from './routes';

export interface SpContext {
  sp: {
    httpServer: Server;
    sendAuthnRequest(): Promise<any>;
  };
}

const resourcePath = path.join(__dirname, '..', '..', 'resources');
const idpMetaPath = path.join(resourcePath, 'idp1', 'idp-metadata.xml');
const idpKeyPath = path.join(resourcePath, 'idp1', 'key.pem');
const spMetaPath = path.join(resourcePath, 'sp1', 'sp-metadata.xml');
const spKeyPath = path.join(resourcePath, 'sp1', 'key.pem');

export function boot(): Promise<SpContext> {
  return Promise
    .all([
      configFromFiles(idpMetaPath, idpKeyPath, 'idp'),
      configFromFiles(spMetaPath, spKeyPath, 'sp'),
    ])
    .then(([idp, sp]) => {
      const idpLookup = new Map<string, SamlConfig>([
        [idp.entityID, idp]
      ]);

      const requestLookup = new Map<string, SamlConfig>();

      const serviceProvider = new ServiceProvider(sp, {
        getIdentityProvider(entityId) {
          const config = idpLookup.get(entityId);

          if (config) {
            return Promise.resolve(config);
          } else {
            return Promise.reject();
          }
        },
        storeRequestID(requestId, idpConfig: SamlConfig) {
          requestLookup.set(requestId, idpConfig);
          return Promise.resolve();
        },
        verifyRequestID(requestId, idpConfig) {
          if ("1234" == requestId) { // this matches the hardcoded default respondToId
            return Promise.resolve();
          }

          if (idpConfig && deepEqual(idpConfig, requestLookup.get(requestId))) {
            return Promise.resolve();
          }
          return Promise.reject();
        },
        invalidateRequestID(requestId) {
          requestLookup.delete(requestId);
          return Promise.resolve();
        }
      });

      return makeServer(makeRoutes(serviceProvider), 8080)
        .then((httpServer) => {
          return {
            sp: {
              httpServer,
              sendAuthnRequest() {
                return serviceProvider.produceAuthnRequest(idp);
              }
            }
          };
        });
    });
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
