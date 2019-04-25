import * as Joi from 'joi';
import { get } from 'lodash';

export function makeRoutes(identityProvider) {
  const db = {
    users: new Map()
  };

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
        handler(request) {
          console.log(`request.payload >>> ${require('util').inspect(request.payload)}`);
          identityProvider
            .consumePostAuthnRequest(request.payload)
            .then((resp) => {
              console.log(`resp >>> ${require('util').inspect(resp)}`);
            });
        },
        description: 'SSO Login'
      }
    }
  ];
}
