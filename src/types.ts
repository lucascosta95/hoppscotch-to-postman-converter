// Hoppscotch Types

export interface HoppscotchAuth {
  authType: 'bearer' | 'inherit' | 'none';
  token?: string;
  [key: string]: any;
}

export interface HoppscotchHeader {
  key: string;
  value: string;
  active: boolean;
}

export interface HoppscotchBody {
  contentType: string;
  body: string | Array<{ key: string; value: string }>;
}

export interface HoppscotchRequest {
  name: string;
  method: string;
  endpoint: string;
  headers: HoppscotchHeader[];
  auth: HoppscotchAuth;
  body?: HoppscotchBody;
  description?: string;
}

export interface HoppscotchFolder {
  name: string;
  folders?: HoppscotchFolder[];
  requests?: HoppscotchRequest[];
}

export interface HoppscotchCollection {
  name: string;
  folders: HoppscotchFolder[];
  requests?: HoppscotchRequest[];
  auth?: HoppscotchAuth;
}

export interface HoppscotchEnvVariable {
  key: string;
  value: string;
  secret: boolean;
}

export interface HoppscotchEnvironment {
  id: string;
  name: string;
  variables: HoppscotchEnvVariable[];
}

// Postman Types

export interface PostmanAuth {
  type: string;
  bearer?: Array<{ key: string; value: string; type: string }>;
  [key: string]: any;
}

export interface PostmanHeader {
  key: string;
  value: string;
  type: string;
}

export interface PostmanBody {
  mode: string;
  formdata?: Array<{ key: string; value: string; type: string }>;
  raw?: string;
}

export interface PostmanUrl {
  raw: string;
  host: string[];
  path: string[];
}

export interface PostmanRequest {
  method: string;
  header: PostmanHeader[];
  body: PostmanBody | null;
  url: PostmanUrl;
  auth: PostmanAuth;
  description: string;
}

export interface PostmanItem {
  name: string;
  item?: PostmanItem[];
  request?: PostmanRequest;
}

export interface PostmanInfo {
  name: string;
  _postman_id: string;
  description: string;
  schema: string;
}

export interface PostmanCollection {
  info: PostmanInfo;
  item: PostmanItem[];
  auth: PostmanAuth | {};
  event: any[];
  variable: any[];
  protocolProfileBehavior: {};
}

export interface PostmanEnvValue {
  key: string;
  value: string;
  enabled: boolean;
  type: string;
  secret: boolean;
}

export interface PostmanEnvironment {
  id: string;
  name: string;
  values: PostmanEnvValue[];
  _postman_variable_scope: string;
  _postman_exported_at: string;
  _postman_exported_using: string;
}
