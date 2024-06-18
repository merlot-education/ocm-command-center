export interface OCMConfig {
    name: string;
    attestationManagerURL: string;
    connectionManagerURL: string;
    proofManagerURL: string;
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
