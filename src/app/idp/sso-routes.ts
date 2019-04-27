import * as Qs from 'querystring';
import { Db } from '../common-types';
import { IdpInterface } from './boot';

export function makeSsoRoutes(identityProvider: IdpInterface) {
  return [
    {
      method: 'GET',
      path: '/sso/saml2/login',
      handler(request, h) {
        return identityProvider
          .consumeRedirectAuthnRequest(request.query)
          .then((resp) => {
            return h.redirect('/login?' + Qs.stringify({ samlReqId: resp.requestID }));
          });
      },
      options: {
        auth: false,
        description: 'SSO Login Redirect',
        tags: ['api', 'sso']
      }
    }
  ];
}
