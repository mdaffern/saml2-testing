import * as replify from 'replify';
import { boot } from '../idp/fake-idp';

boot().then((context) => {
  context.idp.httpServer.start().then(() => {
    console.log('fake-idp listening for http on %ss', context.idp.httpServer.info.uri);
    replify('fake-idp', context);
  });
});
