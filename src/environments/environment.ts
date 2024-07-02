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
            loginSchemaId:
                'UaT2udeT53Tr1n6itV46Z:2:MerlotLoginDemo250624:1.0.0',
        },
        {
            name: 'merlot-ocm-dev',
            attestationManagerURL:
                'https://ocm.dev.merlot-education.eu/attestation/v1/',
            connectionManagerURL:
                'https://ocm.dev.merlot-education.eu/connection/v1/',
            proofManagerURL: 'https://ocm.dev.merlot-education.eu/proof/v1/',
            loginSchemaId:
                'K8j8nFTijJTCsFwrRNE3Df:2:MerlotLoginDev250624:1.0.0',
        },
        {
            name: 'blabby-agent',
            attestationManagerURL:
                'https://blabby-agent.jumpy.dev/attestation/',
            connectionManagerURL: 'https://blabby-agent.jumpy.dev/connection/',
            proofManagerURL: 'https://blabby-agent.jumpy.dev/proof/',
            loginSchemaId: '',
        },
    ],
    orgsAPI:
        'https://api.demo.merlot-education.eu/organisations/?page=0&size=50',
};
