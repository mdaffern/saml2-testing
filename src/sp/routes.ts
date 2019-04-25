import { ServerRoute } from 'hapi';
import * as Joi from 'joi';
import { get } from 'lodash';
import { inspect } from 'util';
import { SamlResponseUnpacked } from '../common-types';
import * as Status from 'http-status';

export function makeRoutes(serviceProvider): ServerRoute[] {
  return [
    {
      method: 'POST',
      path: '/sso/saml2/login',
      options: {
        handler(request, h) {
          return serviceProvider
            .consumePostResponse(request.payload)
            .then((resp: SamlResponseUnpacked) => {
              console.log(`Logged in user with ${inspect(resp)}`);
              return h.response(Status['200_MESSAGE']).code(200);
            });
        },
        description: 'SSO Login',
        tags: ['api', 'sso']
      }
    }
  ];
}
