/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
            orgsAPI:
                'https://api.demo.merlot-education.eu/organisations/?page=0&size=50',
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
            orgsAPI:
                'https://api.dev.merlot-education.eu/organisations/?page=0&size=50',
        },
        {
            name: 'imc-ocm-dev',
            attestationManagerURL:
                'https://ocm.dev.imc-merlot-education.eu/attestation/v1/',
            connectionManagerURL:
                'https://ocm.dev.imc-merlot-education.eu/connection/v1/',
            proofManagerURL: 'https://ocm.dev.imc-merlot-education.eu/proof/v1/',
            loginSchemaId:
                'CgG9Q9ofYeVwVufsmgYFaj:2:IMCLoginDev301024:1.0.0',
            orgsAPI:
                'https://api.dev.merlot-education.eu/organisations/?page=0&size=50',
        },
        {
            name: 'blabby-agent',
            attestationManagerURL:
                'https://blabby-agent.jumpy.dev/attestation/',
            connectionManagerURL: 'https://blabby-agent.jumpy.dev/connection/',
            proofManagerURL: 'https://blabby-agent.jumpy.dev/proof/',
            loginSchemaId: '',
            orgsAPI: '',
        },
    ],
};
