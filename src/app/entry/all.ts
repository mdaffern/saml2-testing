import * as replify from 'replify';
import { mergeContext } from '../saml/merge-context';

mergeContext()
  .then(async (context) => {
    await Promise.all([
      context.idp.httpServer.start(),
      context.sp.httpServer.start()
    ]);

    console.log('Service Provider listening for http on %s', context.sp.httpServer.info.uri);
    console.log('Identity Provider listening for http on %s', context.idp.httpServer.info.uri);
    replify('saml2-testing', context);
  });
