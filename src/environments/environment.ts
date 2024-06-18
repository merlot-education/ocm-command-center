export const environment = {
    production: false,
    preconfiguredOCMs: [
        {
            name: 'merlot-ocm-demo',
            attestationManagerURL:
                'https://ocm.demo.merlot-education.eu/attestation/v1/',
            connectionManagerURL:
                'https://ocm.demo.merlot-education.eu/connection/v1/',
            proofManagerURL: 'https://ocm.demo.merlot-education.eu/proof/v1/',
        },
        {
            name: 'merlot-ocm-dev',
            attestationManagerURL:
                'https://ocm.dev.merlot-education.eu/attestation/v1/',
            connectionManagerURL:
                'https://ocm.dev.merlot-education.eu/connection/v1/',
            proofManagerURL: 'https://ocm.dev.merlot-education.eu/proof/v1/',
        },
        {
            name: 'blabby-agent',
            attestationManagerURL:
                'https://blabby-agent.jumpy.dev/attestation/',
            connectionManagerURL: 'https://blabby-agent.jumpy.dev/connection/',
            proofManagerURL: 'https://blabby-agent.jumpy.dev/proof/',
        },
    ],
    orgsAPI:
        'https://api.demo.merlot-education.eu/organisations/?page=0&size=50',
    loginSchemaIds: [
        '7KuDTpQh3GJ7Gp6kErpWvM:2:MerlotFederationLoginDemo:1.0.0',
        '7KuDTpQh3GJ7Gp6kErpWvM:2:MerlotFederationLoginDev:1.0.0',
    ],
};
