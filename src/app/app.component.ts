import { Component } from '@angular/core';
import {
    FormBuilder,
    FormArray,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { CredentialDefinition, OCMConfig, Schema } from './interfaces';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval, takeUntil, takeWhile } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { QRCodeModule } from 'angularx-qrcode';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        CommonModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,

        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDividerModule,
        MatButtonModule,
        MatToolbarModule,
        MatCardModule,
        MatIconModule,
        MatGridListModule,
        MatChipsModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        MatPaginatorModule,

        QRCodeModule,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    ocmConfigs: OCMConfig[] = environment.preconfiguredOCMs;
    activeOCMConfig: OCMConfig;
    pendingConnection: string = '';
    connection: string = '';
    connectionStatus: string = '';
    invitationUrl: string = '';

    schemaForm: FormGroup;
    credentialDefinitionForm: FormGroup;

    schemas: Schema[] = [];
    schemasToDisplay: Schema[] = [];
    credentialDefinitions: Map<string, CredentialDefinition> = new Map();

    error: any;
    copiedSchemaID = false;
    copiedCredDefId = false;
    copiedText: string = '';

    showProgress = false;

    issuanceForms: { [key: string]: FormGroup } = {};

    issuanceProgress: any;
    presentationProgress: any;

    paginatorLength = 0;
    paginatorPageSize = 5;
    paginatorPageIndex = 0;
    paginatorPageSizeOptions = [5, 10, 25];

    federationLoginSchema: Schema | null = null;

    organization = '';
    organizations: string[] = [];
    organizationMap = new Map();

    roleType = 'OrgLegRep';
    roles: string[] = ['OrgLegRep', 'FedAdmin'];

    constructor(
        private http: HttpClient,
        private _snackBar: MatSnackBar,
        private fb: FormBuilder,
        public clipboard: Clipboard
    ) {
        this.activeOCMConfig = this.ocmConfigs[0];

        this.schemaForm = this.fb.group({
            name: ['', Validators.required],
            createdBy: ['', Validators.required],
            version: ['1.0', Validators.required],
            attributes: this.fb.array([this.createAttribute()]),
        });
        this.credentialDefinitionForm = this.fb.group({
            schemaID: ['', Validators.required],
            name: ['', Validators.required],
            createdBy: ['', Validators.required],
            isRevokable: [false, Validators.required],
            isAutoIssue: [false, Validators.required],
            expiryHours: [999, Validators.required],
        });
    }

    async ngOnInit(): Promise<void> {
        let storedActiveOCMName = window.localStorage.getItem('active-ocm');

        this.ocmConfigs.forEach((c) => {
            if (c.name == storedActiveOCMName) {
                this.activeOCMConfig = c;
            }
        });

        this.connection =
            window.localStorage.getItem(
                'connection' + this.activeOCMConfig.name
            ) == null
                ? ''
                : (
                      window.localStorage.getItem(
                          'connection' + this.activeOCMConfig.name
                      ) + ''
                  ).replace(this.activeOCMConfig.name, '');

        this.showProgress = true;
        await this.updateOrgs();
        await this.updateSchemas();
        await this.updateCredentialDefinitions();
        this.showProgress = false;
    }

    async updateOrgs() {
        return new Promise((resolve, reject) => {
            this.http.get<any>(environment.orgsAPI, {}).subscribe({
                next: (response) => {
                    console.log(response);

                    response.content.forEach((element: any) => {
                        let credentials =
                            element.selfDescription.verifiableCredential;
                        if (Array.isArray(credentials)) {
                            for (let vc of credentials) {
                                if (
                                    !Array.isArray(vc.credentialSubject) &&
                                    vc.credentialSubject.type ===
                                        'merlot:MerlotLegalParticipant'
                                ) {
                                    let organizationName =
                                        vc.credentialSubject[
                                            'merlot:legalName'
                                        ];
                                    this.organizations.push(organizationName);
                                    this.organizationMap.set(
                                        organizationName,
                                        vc.credentialSubject['id']
                                    );
                                }
                            }
                        } else {
                            let organizationName =
                                credentials.credentialSubject[
                                    'gax-trust-framework:legalName'
                                ]['@value'];
                            this.organizations.push(organizationName);
                            this.organizationMap.set(
                                organizationName,
                                credentials.credentialSubject['@id']
                            );
                        }
                    });

                    this.organization = this.organizations[0];
                    return resolve(1);
                },
                error: (e) => {
                    console.error(e);
                    this.error = e;
                    return reject(e);
                },
            });
        });
    }

    resetSchemaForm() {
        this.schemaForm = this.fb.group({
            name: ['', Validators.required],
            createdBy: ['', Validators.required],
            version: ['1.0', Validators.required],
            attributes: this.fb.array([this.createAttribute()]),
        });
    }

    resetCredDefForm() {
        this.credentialDefinitionForm = this.fb.group({
            schemaID: ['', Validators.required],
            name: ['', Validators.required],
            createdBy: ['', Validators.required],
            isRevokable: [false, Validators.required],
            isAutoIssue: [false, Validators.required],
            expiryHours: [999, Validators.required],
        });
    }

    activeOCMChanged() {
        this.schemas = [];
        this.schemasToDisplay = [];
        this.credentialDefinitions = new Map();
        window.localStorage.setItem('active-ocm', this.activeOCMConfig.name);
        this.ngOnInit();
    }

    copyToClipboardSchemaId(text: string) {
        this.copiedText = text;
        this.clipboard.copy(text);
        this.copiedSchemaID = true;
        setTimeout(() => {
            this.copiedSchemaID = false;
        }, 500); // 1 second
    }

    copyToClipboardCredDefId(text: string) {
        this.copiedText = text;
        this.clipboard.copy(text);
        this.copiedCredDefId = true;
        setTimeout(() => {
            this.copiedCredDefId = false;
        }, 500); // 1 second
    }

    openSnackBar(message: string) {
        this._snackBar.open(message, '', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 2000,
        });
    }

    scrollToCredDefCreationForm(): void {
        document.getElementById('credDefForm')?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
        });

        this.credentialDefinitionForm
            .get('schemaID')
            ?.setValue(this.copiedText);
    }

    handlePageEvent(e: PageEvent) {
        this.paginatorLength = e.length;
        this.paginatorPageSize = e.pageSize;
        this.paginatorPageIndex = e.pageIndex;

        this.updateSchemasToDisplay();
    }

    async startConnectionFlow() {
        this.createInvitation().subscribe({
            next: (response) => {
                if (
                    'data' in response &&
                    'connection' in response.data &&
                    'id' in response.data.connection &&
                    'invitationUrl' in response.data
                ) {
                    this.pendingConnection = response.data.connection.id;
                    this.invitationUrl = response.data.invitationUrl;

                    console.log(this.pendingConnection);
                    console.log(this.invitationUrl);

                    this.connectionStatus = 'Scan this code with the PCM app';
                    this.pollForConnectionTrusted();
                }
            },
            error: (e) => {
                console.error(e);
                this.error = e;
            },
        });
    }

    async pollForConnectionTrusted() {
        const poll$ = interval(500);
        const stopPolling$ = new Subject<void>();

        poll$.pipe(takeUntil(stopPolling$)).subscribe(() => {
            this.checkConnectionStatus(this.pendingConnection).subscribe({
                next: (response) => {
                    if (
                        'data' in response &&
                        'records' in response.data &&
                        'status' in response.data.records
                    ) {
                        this.connectionStatus = response.data.records.status;

                        if (response.data.records.status === 'trusted') {
                            this.connectionStatus = '';
                            this.connection = this.pendingConnection;
                            this.invitationUrl = '';
                            this.openSnackBar('Connection established.');
                            stopPolling$.next(); // Stop polling
                            stopPolling$.complete(); // Complete the subject
                            window.localStorage.setItem(
                                'connection' + this.activeOCMConfig.name,
                                this.connection
                            );
                        }
                    }
                },
                error: (e) => {
                    console.error(e);
                    this.error = e;
                },
            });
        });
    }

    disconnect() {
        this.connection = '';
        this.openSnackBar('Disconnected');
        window.localStorage.removeItem(
            'connection' + this.activeOCMConfig.name
        );
    }

    get attributes(): FormArray {
        return this.schemaForm.get('attributes') as FormArray;
    }

    createAttribute(): FormGroup {
        return this.fb.group({
            name: ['', Validators.required],
        });
    }

    addAttribute(): void {
        this.attributes.push(this.createAttribute());
    }

    removeAttribute(index: number): void {
        this.attributes.removeAt(index);
    }

    onCreateSchemaSubmit(): void {
        if (this.schemaForm.valid) {
            const formValue = this.schemaForm.value;
            let attributesObject = formValue.attributes;

            console.log(formValue.attributes);

            interface FormAttribute {
                name: string;
            }
            let attributes = attributesObject.map((v: FormAttribute) => {
                return v.name;
            });

            this.showProgress = true;

            this.createSchema(
                formValue.name,
                formValue.createdBy,
                formValue.version,
                attributes
            ).subscribe({
                next: (response) => {
                    console.log('Schema created successfully', response);
                    this.updateSchemas();
                    this.schemaForm.reset();
                    this.showProgress = false;
                    this.resetSchemaForm();
                },
                error: (e) => {
                    console.error(e);
                    this.error = e;
                    this.showProgress = false;
                },
            });
        }
    }

    createInvitation(): Observable<any> {
        const url = `${this.activeOCMConfig.connectionManagerURL}invitation-url?alias=trust`;
        return this.http.post(url, {});
    }

    checkConnectionStatus(connectionId: string): Observable<any> {
        const url = `${this.activeOCMConfig.connectionManagerURL}connections/${connectionId}`;
        return this.http.get(url);
    }

    createSchema(
        name: string = '',
        createdBy: string = 'command_centr_user',
        version: string = '1.0',
        attributes: string[] = []
    ): Observable<any> {
        const url = `${this.activeOCMConfig.attestationManagerURL}schemas`;
        const data = { name, createdBy, version, attributes };
        console.log(data);

        return this.http.post(url, data, {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    listSchemas(): Observable<any> {
        const url = `${this.activeOCMConfig.attestationManagerURL}schemas?pageSize=10000&page=0`;

        return this.http.get(url, {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async updateSchemas() {
        new Promise((resolve, reject) => {
            this.listSchemas().subscribe({
                next: async (response) => {
                    if (response.statusCode == 200) {
                        this.paginatorLength = response.data.count;
                        this.schemas = response.data.records;
                        console.log(this.schemas);
                        this.schemas = this.schemas.sort(
                            (a, b) =>
                                new Date(b.createdDate).getTime() -
                                new Date(a.createdDate).getTime()
                        );

                        this.schemas.forEach((schema) => {
                            const filteredAttributes = schema.attribute.filter(
                                (attr) => attr.name !== 'expirationDate'
                            );
                            const formGroup = this.fb.group({
                                comment: [
                                    'Issued via the OCM Command Center',
                                    Validators.required,
                                ],
                                attributes: this.fb.array(
                                    filteredAttributes.map((attr) =>
                                        this.fb.group({
                                            name: attr.name,
                                            value: ['', Validators.required],
                                        })
                                    )
                                ),
                            });
                            this.issuanceForms[schema.schemaID] = formGroup;

                            if (
                                this.activeOCMConfig.loginSchemaId ==
                                schema.schemaID
                            ) {
                                this.federationLoginSchema = schema;
                                const randomUserNumber = Math.floor(
                                    Math.random() * 100000
                                ).toString();

                                const formGroup = this.fb.group({
                                    comment: [
                                        'Issued via the OCM Command Center',
                                        Validators.required,
                                    ],
                                    attributes: this.fb.array(
                                        filteredAttributes.map((attr) => {
                                            switch (attr.name) {
                                                case 'Vorname':
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            `Tester`,
                                                            Validators.required,
                                                        ],
                                                    });
                                                case 'Nachname':
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            `Number ${randomUserNumber}`,
                                                            Validators.required,
                                                        ],
                                                    });
                                                case 'ID':
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            `user${randomUserNumber}@merlot.dev`,
                                                            Validators.required,
                                                        ],
                                                    });
                                                case 'sub':
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            `user${randomUserNumber}@merlot.dev`,
                                                            Validators.required,
                                                        ],
                                                    });
                                                case 'subjectDID':
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            `did:number:${randomUserNumber}`,
                                                            Validators.required,
                                                        ],
                                                    });
                                                case 'iss':
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            `ocm@merlot.dev`,
                                                            Validators.required,
                                                        ],
                                                    });
                                                case 'auth_time':
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            new Date().toISOString(),
                                                            Validators.required,
                                                        ],
                                                    });
                                                case 'Organisation':
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            this
                                                                .organizations[0],
                                                            Validators.required,
                                                        ],
                                                    });
                                                case 'Role':
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            this.roles[0],
                                                            Validators.required,
                                                        ],
                                                    });
                                                case 'issuerDID':
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            'did:mail:ocm@merlot.dev',
                                                            Validators.required,
                                                        ],
                                                    });
                                                default:
                                                    return this.fb.group({
                                                        name: attr.name,
                                                        value: [
                                                            '',
                                                            Validators.required,
                                                        ],
                                                    });
                                            }
                                        })
                                    ),
                                });
                                this.issuanceForms[schema.schemaID] = formGroup;
                            }
                        });

                        await this.updateSchemasToDisplay();
                    }

                    return resolve(0);
                },
                error: (e) => {
                    console.error(e);
                    this.error = e;
                    this.schemas = [];
                    return reject(e);
                },
            });
        });
    }

    updateSchemasToDisplay() {
        new Promise((resolve, reject) => {
            this.schemasToDisplay = [];
            for (
                let i = this.paginatorPageIndex * this.paginatorPageSize;
                i <
                this.paginatorPageIndex * this.paginatorPageSize +
                    this.paginatorPageSize;
                i++
            ) {
                this.schemasToDisplay.push(this.schemas[i]);
            }

            return resolve(1);
        });
    }

    onCreateCredDefSubmit(): void {
        if (this.credentialDefinitionForm.valid) {
            const formValue = this.credentialDefinitionForm.value;

            this.showProgress = true;

            this.createCredentialDefinition(
                formValue.schemaID,
                formValue.name,
                formValue.createdBy,
                formValue.isRevokable,
                formValue.isAutoIssue,
                formValue.expiryHours
            ).subscribe({
                next: (response) => {
                    console.log('Schema created successfully', response);
                    this.updateSchemas();
                    this.updateCredentialDefinitions();
                    this.credentialDefinitionForm.reset();
                    this.showProgress = false;
                    this.resetCredDefForm();
                },
                error: (e) => {
                    console.error(e);
                    this.showProgress = false;
                    this.error = e;
                },
            });
        }
    }

    createCredentialDefinition(
        schemaID: string,
        name: string,
        createdBy: string,
        isRevokable: boolean = false,
        isAutoIssue: boolean = false,
        expiryHours: string = '9999'
    ): Observable<any> {
        const url = `${this.activeOCMConfig.attestationManagerURL}credentialDef`;
        const data = {
            schemaID,
            name,
            createdBy,
            isAutoIssue,
            isRevokable,
            expiryHours: expiryHours + '',
        };
        console.log(data);

        return this.http.post(url, data, {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    listCredentialDefinitions(): Observable<any> {
        const url = `${this.activeOCMConfig.attestationManagerURL}credentialDef?pageSize=1000&page=0`;
        return this.http.get(url, {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async updateCredentialDefinitions() {
        new Promise((resolve, reject) => {
            this.credentialDefinitions = new Map();
            this.listCredentialDefinitions().subscribe({
                next: (response) => {
                    if (response.statusCode == 200) {
                        response.data.records.forEach(
                            (credDef: CredentialDefinition) => {
                                this.credentialDefinitions.set(
                                    credDef.schemaID,
                                    credDef
                                );
                            }
                        );
                    }
                    return resolve(1);
                },
                error: (e) => {
                    console.error(e);
                    this.error = e;
                    this.credentialDefinitions = new Map();
                    return reject(e);
                },
            });
        });
    }

    getCredentialDefinitionIdForSchema(schemaId: string): Observable<any> {
        const url = `${this.activeOCMConfig.attestationManagerURL}credentialDef?schemaID=${schemaId}`;
        return this.http.get(url, {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    createCredentialOffer(
        connectionId: string,
        credentialDefinitionId: string,
        comment: string,
        attributes: { name: string; value: string }[],
        autoAcceptCredential: string = 'always'
    ): Observable<any> {
        const url = `${this.activeOCMConfig.attestationManagerURL}create-offer-credential`;

        const data = {
            connectionId,
            credentialDefinitionId,
            comment,
            attributes,
            autoAcceptCredential,
        };

        console.log(data);

        return this.http.post(url, data, {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    getAttributes(schemaID: string): FormArray {
        return this.issuanceForms[schemaID].get('attributes') as FormArray;
    }

    checkIssuanceStatus(credentialId: string): Observable<any> {
        const url = `${this.activeOCMConfig.attestationManagerURL}credential/${credentialId}`;
        return this.http.get(url);
    }

    onIssuanceFormSubmit(schema: Schema) {
        console.log(schema);

        const form = this.issuanceForms[schema.schemaID];

        let credDef = this.credentialDefinitions.get(schema.schemaID);

        if (form.valid && this.connection && credDef) {
            const formValue = form.value;
            this.createCredentialOffer(
                this.connection,
                credDef.credDefId,
                formValue.comment,
                formValue.attributes
            ).subscribe({
                next: (response) => {
                    console.log(response);

                    const poll$ = interval(500);
                    poll$
                        .pipe(
                            takeWhile(
                                () =>
                                    this.issuanceProgress?.state !== 'done' &&
                                    this.issuanceProgress !== null
                            )
                        )
                        .subscribe(() => {
                            this.checkIssuanceStatus(
                                response.data.id
                            ).subscribe((response: any) => {
                                console.log(response);
                                if (
                                    'data' in response &&
                                    'state' in response.data
                                ) {
                                    this.issuanceProgress = response.data;
                                }
                            });
                        });
                },
                error: (e) => {
                    console.error(e);
                    this.error = e;
                },
            });
        } else {
            this.error = { message: 'No connection (top right corner).' };
        }
    }

    sendPresentationRequest(
        connectionId: string,
        comment: string,
        attributes: {
            attributeName: string;
            schemaId: string;
            // credentialDefId: string;
        }[]
    ): Observable<any> {
        console.log(connectionId, comment, attributes);

        const url = `${this.activeOCMConfig.proofManagerURL}send-presentation-request`;
        const data = {
            comment,
            connectionId,
            attributes,
        };
        return this.http.post(url, data, {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    checkPresentation(proofRecordId: string): Observable<any> {
        const url = `${this.activeOCMConfig.proofManagerURL}find-by-presentation-id?proofRecordId=${proofRecordId}`;
        return this.http.get(url);
    }

    requestPresentationForSchema(schema: Schema) {
        console.log(schema);

        // let credDef = this.credentialDefinitions.get(schema.schemaID);

        // if (!credDef) {
        //     this.error = {
        //         message: 'No credential definition for this schema.',
        //     };
        //     return;
        // }

        let attributes = schema.attribute.map((att) => {
            return {
                attributeName: att.name,
                schemaId: schema.schemaID,
                // credentialDefId: credDef.credDefId,
            };
        });

        if (this.connection) {
            this.sendPresentationRequest(
                this.connection,
                'Credential requested by OCM Command Center.',
                attributes
            ).subscribe({
                next: (response) => {
                    console.log(response);

                    const poll$ = interval(500);
                    poll$
                        .pipe(
                            takeWhile(
                                () =>
                                    this.presentationProgress?.state !==
                                        'done' &&
                                    this.presentationProgress !== null
                            )
                        )
                        .subscribe(() => {
                            this.checkPresentation(
                                response.data.proofRecordId
                            ).subscribe((response: any) => {
                                console.log(response);
                                if (
                                    'data' in response &&
                                    'state' in response.data
                                ) {
                                    this.presentationProgress = response.data;
                                }
                            });
                        });
                },
                error: (e) => {
                    console.error(e);
                    this.error = e;
                },
            });
        } else {
            this.error = { message: 'No connection (top right corner).' };
        }
    }

    jsonToPrettyString(value: any) {
        return JSON.stringify(value, null, 4); // <-- `space` increased from 2 to 4
    }
}
