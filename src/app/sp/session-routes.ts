import * as Boom from 'boom';
import * as Joi from 'joi';
import * as Qs from 'querystring';
import * as Status from 'http-status';
import { Db, Kind } from '../common-types';
import { hashAny } from '../primitive/hash';
import { SpBinding } from './sp-binding';

export function makeSessionRoutes(db: Db, spb: SpBinding) {
  const { sp } = spb;

  return [
    {
      method: 'GET',
      path: '/login',
      options: {
        plugins: {
          'hapi-auth-cookie': { redirectTo: false }
        },
        auth: false,
        async handler(request, h) {
          if (request.auth.isAuthenticated) {
            return h.response(Status['201_MESSAGE']).code(201);
          }
          const authReq = await sp.produceAuthnRequest(spb.idpConfig);

          return h.view('sp-login.ejs', {
            samlAuthUrl: 'localhost:7001/sso/saml2/login?' + Qs.stringify(authReq.formBody)
          });
        }
      }
    },
    {
      method: 'POST',
      // if any path tokens are added here, aparenty hapi will add them to
      // the cookie path making cookies only valid for sybling routes
      path: '/session',
      options: {
        auth: {
          mode: 'try'
        },
        tags: ['api', 'session'],
        handler(request, h) {
          const { username, password } = request.payload;
          const user = db.users.findOne(u => u.email === username);

          if (user && hashAny(password) === user.hashword) {
            request.cookieAuth.set({ id: user.uuid });
            return h.response(Status['201_MESSAGE']).code(201);
          } else {
            return Boom.unauthorized();
          }
        },
        validate: {
          payload: Joi.object({
            username: Joi.string().email().example('name1@email.tld'),
            password: Joi.string().example('password1')
          })
        }
      }
    },
    {
      method: 'DELETE',
      path: '/session',
      options: {
        tags: ['api', 'session'],
        handler(request, h) {
          request.cookieAuth.clear();
          return h.response(Status['202_MESSAGE']).code(202);
        }
      }
    },
    {
      method: 'GET',
      path: '/resource',
      options: {
        handler(_, h: any) {
          return h.view('sp-resource.ejs');
        }
      }
    }
  ];
}
