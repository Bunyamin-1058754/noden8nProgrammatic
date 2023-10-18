import {
  INodeProperties,
  ICredentialType,
  IAuthenticateGeneric,
  ICredentialTestRequest,
} from 'n8n-workflow';

export class WalletBalanceApi implements ICredentialType {
  name = 'walletBalanceApi';
  displayName = 'Wallet Balance API';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      default: '',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: 'Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.example.com', // Set your API base URL here
      url: '/test', // Update with the appropriate test endpoint
      method: 'GET',
    },
  };
}
