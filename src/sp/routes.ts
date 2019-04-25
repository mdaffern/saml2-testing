import * as Joi from 'joi';
import { get } from 'lodash';
import { SamlResponseUnpacked } from '../common-types';
import { inspect } from 'util';

const db = {
  users: new Map()
};

export function makeRoutes(serviceProvider) {
  return [
    {
      method: 'GET',
      path: '/api/users',
      options: {
        handler(request) {
          const id = get(request, 'query.id');

          if (id) {
            return db.users.get(id);
          }
          return db.users.values();
        },
        description: 'Get User(s)',
        validate: {
          query: Joi.object({
            id: Joi.string().uuid().optional().example('e69da125-4e1b-423c-ba92-1252c28a3066')
          })
        }
      },
    },
    {
      method: 'POST',
      path: '/api/users',
      options: {
        handler(request) {
          request.payload.forEach((user) => {
            db.users.set(user.id, user);
          });
        },
        description: 'Create Users',
        validate: {
          payload: Joi.array().items(Joi.object({
            name: Joi.string().alphanum().example('John'),
            id: Joi.string().uuid().example('e69da125-4e1b-423c-ba92-1252c28a3066')
          }))
        }
      },
    },
    {
      method: 'DELETE',
      path: '/api/users',
      options: {
        handler(request) {
          const id = get(request, 'query.id');

          if (id) {
            db.users.delete(id);
          } else {
            db.users = new Map();
          }
        },
        description: 'Delete Users',
        validate: {
          payload: Joi.array().items(Joi.object({
            name: Joi.string().alphanum().example('John'),
            id: Joi.string().uuid().example('e69da125-4e1b-423c-ba92-1252c28a3066')
          }))
        }
      }
    },
    {
      method: 'POST',
      path: '/sso/saml2/login',
      options: {
        async handler(request) {
          return serviceProvider
            .consumePostResponse(request.payload)
            .then((resp: SamlResponseUnpacked) => {
              console.log(`Logged in user with ${inspect(resp)}`);
              return 'ok';
            });
        },
        description: 'SSO Login'
      }
    }
  ];
}
