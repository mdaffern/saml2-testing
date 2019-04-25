import * as replify from 'replify';
import { mergeContext } from '../merge-context';

mergeContext()
  .then((context) => {
    return Promise
      .all([
        context.idp.httpServer.start(),
        context.sp.httpServer.start()
      ])
      .then(() => context);
  })
  .then((context) => {
    console.log('fake-sp listening for http on %ss', context.sp.httpServer.info.uri);
    console.log('fake-idp listening for http on %ss', context.idp.httpServer.info.uri);
    replify('saml2-testing', context);
  });
