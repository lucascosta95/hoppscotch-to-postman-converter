import * as fs from 'fs';
import * as path from 'path';
import {
  HoppscotchAuth,
  HoppscotchBody,
  HoppscotchCollection,
  HoppscotchEnvironment,
  HoppscotchFolder,
  HoppscotchHeader,
  HoppscotchRequest,
  PostmanAuth,
  PostmanBody,
  PostmanCollection,
  PostmanEnvironment,
  PostmanHeader,
  PostmanItem,
} from './types';

function replacePlaceholders(value: string): string {
  if (typeof value === 'string') {
    return value.replace(/<<(.*?)>>/g, '{{$1}}');
  }
  return value;
}

function convertAuth(hoppscotchAuth: HoppscotchAuth): PostmanAuth {
  let postmanAuth: PostmanAuth = { type: 'noauth' };

  if (hoppscotchAuth.authType === 'bearer') {
    postmanAuth = {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: replacePlaceholders(hoppscotchAuth.token || ''),
          type: 'string',
        },
      ],
    };
  } else if (hoppscotchAuth.authType === 'inherit') {
    postmanAuth = {
      type: 'inherit',
    };
  } else if (hoppscotchAuth.authType === 'none') {
    postmanAuth = { type: 'noauth' };
  }
  return postmanAuth;
}

function convertHeaders(hoppscotchHeaders: HoppscotchHeader[]): PostmanHeader[] {
  return hoppscotchHeaders
    .filter((header) => header.active)
    .map((header) => ({
      key: replacePlaceholders(header.key),
      value: replacePlaceholders(header.value),
      type: 'text',
    }));
}

function convertBody(hoppscotchBody?: HoppscotchBody): PostmanBody | null {
  if (!hoppscotchBody) return null;

  if (hoppscotchBody.contentType === 'multipart/form-data' && Array.isArray(hoppscotchBody.body)) {
    return {
      mode: 'formdata',
      formdata: hoppscotchBody.body.map((item) => ({
        key: replacePlaceholders(item.key),
        value: replacePlaceholders(item.value),
        type: 'text',
      })),
    };
  }

  if (typeof hoppscotchBody.body === 'string') {
    return {
      mode: 'raw',
      raw: replacePlaceholders(hoppscotchBody.body),
    };
  }

  return { mode: 'raw', raw: '' };
}

function convertRequest(hoppscotchRequest: HoppscotchRequest): PostmanItem {
  return {
    name: hoppscotchRequest.name,
    request: {
      method: hoppscotchRequest.method,
      header: convertHeaders(hoppscotchRequest.headers || []),
      body: convertBody(hoppscotchRequest.body),
      url: {
        raw: replacePlaceholders(hoppscotchRequest.endpoint),
        host: replacePlaceholders(hoppscotchRequest.endpoint).split('/').slice(0, 1),
        path: replacePlaceholders(hoppscotchRequest.endpoint).split('/').slice(1),
      },
      auth: convertAuth(hoppscotchRequest.auth),
      description: hoppscotchRequest.description || '',
    },
  };
}

function convertFolder(hoppscotchFolder: HoppscotchFolder): PostmanItem {
  const folderItem: PostmanItem = {
    name: hoppscotchFolder.name,
    item: [],
  };

  if (hoppscotchFolder.folders) {
    for (const subfolder of hoppscotchFolder.folders) {
      folderItem.item?.push(convertFolder(subfolder));
    }
  }

  if (hoppscotchFolder.requests) {
    for (const request of hoppscotchFolder.requests) {
      folderItem.item?.push(convertRequest(request));
    }
  }

  return folderItem;
}

export function convertHoppscotchToPostmanCollection(hoppscotchJsonExportedFile: string, outputDir: string): PostmanCollection {
  const fileContent = fs.readFileSync(hoppscotchJsonExportedFile, 'utf-8');
  const hoppscotchData: HoppscotchCollection = JSON.parse(fileContent);
  
  return processCollectionConversion(hoppscotchData, hoppscotchJsonExportedFile, outputDir);
}

export function processCollectionConversion(hoppscotchData: HoppscotchCollection, originalFilePath: string, outputDir: string, suffix: string = ''): PostmanCollection {
  const postmanCollection: PostmanCollection = {
    info: {
      name: hoppscotchData.name,
      _postman_id: '',
      description: '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [],
    auth: {},
    event: [],
    variable: [],
    protocolProfileBehavior: {},
  };

  if (hoppscotchData.folders) {
    for (const folder of hoppscotchData.folders) {
      postmanCollection.item.push(convertFolder(folder));
    }
  }

  if (hoppscotchData.requests) {
    for (const request of hoppscotchData.requests) {
      postmanCollection.item.push(convertRequest(request));
    }
  }

  if (hoppscotchData.auth) {
    postmanCollection.auth = convertAuth(hoppscotchData.auth);
  }

  const fileName = path.basename(originalFilePath, '.json');
  let outputFileName;
  if (suffix) {
     outputFileName = `${fileName}_${suffix}_postman_collection.json`;
  } else {
     outputFileName = `${fileName}_postman_collection.json`;
  }
  
  const outputPath = path.join(outputDir, outputFileName);
  
  fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2), 'utf-8');
  console.log(`Conversion completed. Postman collection saved as ${outputPath}`);

  return postmanCollection;
}

export function convertHoppscotchEnvToPostmanEnv(hoppscotchJsonEnv: string, outputDir: string): PostmanEnvironment {
  const fileContent = fs.readFileSync(hoppscotchJsonEnv, 'utf-8');
  const hoppscotchEnvData: HoppscotchEnvironment = JSON.parse(fileContent);

  const postmanEnv: PostmanEnvironment = {
    id: hoppscotchEnvData.id,
    name: hoppscotchEnvData.name,
    values: [],
    _postman_variable_scope: 'environment',
    _postman_exported_at: '',
    _postman_exported_using: 'Postman Environment Converter',
  };

  for (const variable of hoppscotchEnvData.variables) {
    postmanEnv.values.push({
      key: variable.key,
      value: variable.value,
      enabled: true,
      type: 'text',
      secret: variable.secret,
    });
  }

  const fileName = path.basename(hoppscotchJsonEnv, '.json');
  const postmanEnvFileName = path.join(outputDir, `${fileName}_postman_environment.json`);
  fs.writeFileSync(postmanEnvFileName, JSON.stringify(postmanEnv, null, 2), 'utf-8');
  console.log(`Environment conversion completed. Postman environment saved as ${postmanEnvFileName}`);

  return postmanEnv;
}
