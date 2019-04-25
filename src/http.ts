import { Server } from 'hapi';
import * as HapiSwagger from 'hapi-swagger';
import * as Inert from 'inert';
import * as Path from 'path';
import * as Vision from 'vision';
import { makeUserRoutes } from './user-routes';

export function makeServer(routes, port): Promise<Server> {
  const httpServer = new Server({
    port,
    routes: {
      auth: false,
      files: {
        relativeTo: Path.join(__dirname, '..', 'node_modules', 'hapi-swagger', 'public')
      }
    }
  });

  const db = {
    users: new Map()
  };

  return httpServer
    .register([
      { plugin: Inert },
      { plugin: Vision },
      {
        plugin: HapiSwagger,
        options: {
          info: {
            title: 'API Documentation',
            version: '0.1.0'
          }
        }
      }
    ])
    .then(() => {
      [...routes, ...makeUserRoutes(db)].forEach((route) => httpServer.route(route));

      httpServer.route({
        method: 'GET',
        path: '/ping',
        handler: () => 'Hello world!',
        options: {
          tags: ['api', 'utility']
        }
      });

      return httpServer;
    });
}
