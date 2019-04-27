import * as Status from 'http-status';
import { Db, SamlResponseUnpacked } from '../common-types';
import { ServerRoute } from 'hapi';
import { SpInterface } from './sp-binding';

export function makeSsoRoutes(db: Db, serviceProvider: SpInterface): ServerRoute[] {
  return [
    {
      method: 'POST',
      path: '/sso/saml2/login',
      options: {
        auth: false,
        handler(request, h) {
          return serviceProvider
            .consumeRedirectResponse(request.payload)
            .then((resp: SamlResponseUnpacked) => {
              const user = db.users.findOne(u => u.uuid === resp.nameID);
              (request as any).cookieAuth.set({ id: user.uuid });
              return h.redirect('/resource');
            });
        },
        description: 'SSO Login',
        tags: ['api', 'sso']
      }
    }
  ];
}
