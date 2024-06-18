export const environment = {
    production: true,
    preconfiguredOCMs: [
        {
            name: 'blabby-agent',
            attestationManagerURL:
                'https://blabby-agent.jumpy.dev/attestation/',
            connectionManagerURL: 'https://blabby-agent.jumpy.dev/connection/',
            proofManagerURL: 'https://blabby-agent.jumpy.dev/proof/',
        },
    ],
};
