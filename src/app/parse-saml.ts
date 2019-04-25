import { parse } from 'fast-xml-parser';
import { readFile as readFileCb } from 'fs';
import { get } from 'lodash';
import { promisify } from 'util';
import { Kind, SamlConfig } from './common-types';

const readFile = promisify(readFileCb);

const xmlParseOptions = {
  attributeNamePrefix : '',
  textNodeName : 'value',
  ignoreAttributes: false,
  ignoreNameSpace: true,
  allowBooleanAttributes: true,
  parseAttributeValue: true,
  trimValues: true,
  parseTrueNumberOnly: false
};

function parseXml(fileName) {
  return readFile(fileName)
    .then((b) => parse(b.toString(), xmlParseOptions));
}

function getEndpoints(descriptor, kind: Kind) {
  switch (kind) {
    case 'sp': {
      return {
        assert: get(descriptor, 'AssertionConsumerService.Location'),
        logout: get(descriptor, 'SingleLogoutService.Location')
      };
    }
    case 'idp': {
      return {
        login: get(descriptor, 'SingleSignOnService.Location'),
        logout: get(descriptor, 'SingleLogoutService.Location')
      };
    }
  }
}

function metadataToConfig(metadata, privateKey, kind: Kind): SamlConfig {
  const descriptorKey = kind === 'idp' ? 'IDPSSODescriptor' : 'SPSSODescriptor';

  const credentials = get(metadata, `EntityDescriptor.${descriptorKey}.KeyDescriptor`)
    .map((cred) => {
      return {
        certificate: get(cred, 'KeyInfo.X509Data.X509Certificate'),
        privateKey
      };
    });

  return {
    entityID: get(metadata, 'EntityDescriptor.entityID'),
    credentials,
    endpoints: getEndpoints(get(metadata, `EntityDescriptor.${descriptorKey}`), kind),
    signAllRequests: true,
    signAllResponses: true,
    requireSignedRequests: true,
    requireSignedResponses: true
  };
}

export function configFromFiles(metadataPath, privateKeyPath, kind: Kind) {
  return Promise
    .all([
      parseXml(metadataPath),
      readFile(privateKeyPath).then((b) => b.toString())
    ])
    .then(([metadataJson, privateKey]) => {
      return metadataToConfig(metadataJson, privateKey, kind);
    });
}
