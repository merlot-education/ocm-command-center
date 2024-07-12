/*
 *  Copyright 2023-2024 Dataport AöR
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

export interface OCMConfig {
    name: string;
    attestationManagerURL: string;
    connectionManagerURL: string;
    proofManagerURL: string;
    loginSchemaId: string;
    orgsAPI: string;
}

export interface Schema {
    id: string;
    schemaID: string;
    name: string;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
    attribute: Attribute[];
}

export interface Attribute {
    name: string;
}

export interface CredentialDefinition {
    id: string;
    schemaID: string;
    name: string;
    credDefId: string;
    isAutoIssue: boolean;
    isRevokable: boolean;
    expiryHours: string;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
}
