# Enterprise CRM Ingestion Gateway (Node.js + Dynamics 365)

[![Node.js](https://img.shields.io/badge/Node.js-18.x%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-blueviolet.svg)](https://railway.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A resilient, cloud-native Node.js microservice engineered to capture incoming web lead payloads and securely synchronize them into **Microsoft Dynamics 365 Web API (v9.2)** using Azure Active Directory OAuth 2.0 authentication.

---

## 📌 Architecture Overview

This gateway acts as a secure reverse-proxy middleware. It abstracts sensitive Azure Active Directory credentials from client-facing intake forms, normalizes heterogeneous form payloads into Microsoft Dataverse schemas, and handles upstream token lifecycles.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / Browser
    participant Gateway as Node.js Gateway (Railway)
    participant AzureAD as Azure Active Directory
    participant CRM as Microsoft Dynamics 365 API

    User->>Gateway: POST /api/submit-lead (Form Data)
    Note over Gateway: Validate & sanitize input fields
    Gateway->>AzureAD: POST /oauth2/v2.0/token (client_credentials)
    AzureAD-->>Gateway: 200 OK (access_token)
    Note over Gateway: Map payload to Dataverse contact schema
    Gateway->>CRM: POST /api/data/v9.2/contacts (Bearer Token)
    CRM-->>Gateway: 201 Created (contactid)
    Gateway-->>User: 201 Created (JSON confirmation)
