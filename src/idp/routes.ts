import * as Joi from 'joi';
import { get } from 'lodash';
import * as Status from 'http-status';

export function makeRoutes(identityProvider) {
  return [
    {
      method: 'POST',
      path: '/sso/saml2/login',
      handler(request, h) {
        identityProvider
          .consumePostAuthnRequest(request.payload)
          .then((resp) => {
            console.log(`resp >>> ${require('util').inspect(resp)}`);
            return h.response(Status['200_MESSAGE']).code(200);
          });
      },
      options: {
        description: 'SSO Login',
        tags: ['api', 'sso']
      }
    }
  ];
}
