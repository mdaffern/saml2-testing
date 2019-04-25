import { ServerRoute } from 'Hapi';
import * as Status from 'http-status';
import * as Joi from 'joi';
import { get } from 'lodash';

export function makeUserRoutes(db): ServerRoute[] {
  return [
    {
      method: 'GET',
      path: '/api/users',
      handler(request, h) {
        const id = get(request, 'query.id');

        if (id) {
          return h.response(db.users.get(id)).code(200);
        }
        return h.response(Array.from(db.users.values())).code(200);
      },
      options: {
        description: 'Get User(s)',
        tags: ['api', 'users'],
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
      handler(request, h) {
        (request.payload as any[]).forEach((user) => {
          db.users.set(user.id, user);
        });
        return h.response(Status['201_MESSAGE']).code(201);
      },
      options: {
        description: 'Create Users',
        tags: ['api', 'users'],
        validate: {
          payload: Joi.array().items(Joi.object({
            name: Joi.string().alphanum().example('John'),
            id: Joi.string().uuid().example('e69da125-4e1b-423c-ba92-1252c28a3066')
          }))
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/users',
      handler(request, h) {
        const id = get(request, 'query.id');

        if (id) {
          db.users.delete(id);
        } else {
          db.users = new Map();
        }
        return h.response(Status['202_MESSAGE']).code(202);
      },
      options: {
        description: 'Delete Users',
        tags: ['api', 'users'],
        validate: {
          query: Joi.object({
            id: Joi.string().uuid().example('e69da125-4e1b-423c-ba92-1252c28a3066')
          })
        }
      }
    },
  ];
}
