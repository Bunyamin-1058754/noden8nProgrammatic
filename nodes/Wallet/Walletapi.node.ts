import {
  IExecuteFunctions,
} from 'n8n-core';


//// hier staan alle benodigden imports voor het triggeren en basis informatie van de node
import {
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
	IExecuteFunctions,
	INode,
	ITriggerEvent,
	ITriggerResponse,
} from 'n8n-workflow';

import {
	OptionsWithUri,
} from 'request';


import { ethers } from 'ethers';
const Web3 = require('web3');




/// basic input van de node o.a. informatie
export class WalletBalanceNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Wallet Balance',
    name: 'walletBalance',
    icon: 'file:walletBalance.svg',
    group: ['transform'],
    version: 1,
    description: 'Check Ethereum Wallet Balance',
    defaults: {
      name: 'Wallet Balance',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'walletBalanceApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Ethereum Address',
        name: 'ethereumAddress',
        type: 'string',
        required: true,
        default: '',
        placeholder: '0xYourEthereumAddress',
        description: 'Enter an Ethereum address to check the balance of',


      },

			{
				displayName: 'Balance Threshold Event',
				name: 'balanceThreshold',
				type: 'trigger',
				default: 'balanceThreshold',
				description: 'Triggered when the balance exceeds the threshold.',
			}
    ],
  };


	// trigger toevoegen:
	triggers: ITriggerEvent[] = [
		{
			name:'BalanceThreshold',
			displayname: 'Balance Threshold',
			description: 'Triggered when balance exceeds threshold',
			output:'main',
			/// geef aan wanneer de trigger moet worden geactiveerd
			onTrigger: async (items: INodeExecutionData[]): Promise<void> => {
				const credentials = await this.getCredentials('ethereumNode');

				if (!credentials) {
					throw new Error('Ethereum Node credentials are missing.');
				}

				const ethereumNodeURL = credentials.url; // URL of the Ethereum node

				// Create a provider to connect to the Ethereum node
				const provider = new ethers.providers.JsonRpcProvider(ethereumNodeURL);

				const threshold = 100; // Set the balance threshold here

				for (let i = 0; i < items.length; i++) {
					const item = items[i];
					const ethereumAddress = item.json.ethereumAddress as string;

					// Check the balance of the Ethereum address
					const balance = await provider.getBalance(ethereumAddress);

					// Convert the balance to Ether
					const etherBalance = ethers.utils.formatEther(balance);

					if (parseFloat(etherBalance) > threshold) {
						// Construct the response data
						const responseData = {
							ethereumAddress,
							balance: etherBalance,
						};

						// Add the response data to the output data
						this.emit([{
							json: responseData,
						}]);
					}
				}
			},
		},
	];

async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData = [];
  const ethereumAddress = this.getNodeParameter('ethereumAddress', 0) as string;
	//// hieronder moet ik de drempelwaarde instellen voor ETH waarbij de trigger reageert: aanpassen naar wens
  const threshold = 0.01; ///ETHereum

  for (let i = 0; i < items.length; i++) {
    const credentials = this.getCredentials('ethereumNode');

    if (!credentials) {
      throw new Error('Ethereum Node credentials are missing.');
    }

    const ethereumNodeURL = credentials.url; // URL van de Ethereum-node

    // Een provider maken om verbinding te maken met de Ethereum-node
    const provider = new ethers.providers.JsonRpcProvider(ethereumNodeURL);

    // Het saldo van het Ethereum-adres controleren
    const balance = await provider.getBalance(ethereumAddress);

    // Het saldo naar Ether converteren
    const etherBalance = ethers.utils.formatEther(balance);

    // Constructeer de responsgegevens
    const responseData = {
      ethereumAddress,
      balance: etherBalance,
    };

    returnData.push({ json: responseData });

    // Controleren of het saldo de drempel overschrijdt
    if (parseFloat(etherBalance) > threshold) {
      // Het saldo overschrijdt de drempel, trigger een evenement
      this.triggerEvent('balanceThreshold', [responseData]);
    }
  }

  return [returnData];
}
