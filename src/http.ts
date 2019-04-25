import { Server } from 'hapi';
import * as HapiSwagger from 'hapi-swagger';
import * as Inert from 'inert';
import * as Vision from 'vision';

export function makeServer(routes, port): Promise<Server> {
  const httpServer = new Server({
    port
  });

  const swaggerOptions = {
    info: {
      title: 'API Documentation',
      version: '0.1.0'
    },
    swaggerUI: true
  };

  return httpServer
    .register([
      { plugin: Inert },
      { plugin: Vision },
      {
        plugin: HapiSwagger,
        options: swaggerOptions
      }
    ])
    .then(() => {
      routes.forEach((route) => httpServer.route(route));
      return httpServer;
    });
}
