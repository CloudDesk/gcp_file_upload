# Knowledge Transfer (KT) Document

## GCP File Upload Service - REVO Platform

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Project Name:** clouddeskpdf (GCP File Upload Service)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Technology Stack](#2-architecture--technology-stack)
3. [Project Structure](#3-project-structure)
4. [Key Features & Functionalities](#4-key-features--functionalities)
5. [API Endpoints Documentation](#5-api-endpoints-documentation)
6. [Configuration & Environment Variables](#6-configuration--environment-variables)
7. [Development Setup](#7-development-setup)
8. [Deployment Process](#8-deployment-process)
9. [Key Components & Responsibilities](#9-key-components--responsibilities)
10. [Integration Points](#10-integration-points)
11. [File Upload Flow](#11-file-upload-flow)
12. [Document Generation Flow](#12-document-generation-flow)
13. [Troubleshooting & Common Issues](#13-troubleshooting--common-issues)
14. [Best Practices](#14-best-practices)
15. [Security Considerations](#15-security-considerations)

---

## 1. Project Overview

### 1.1 Purpose

The GCP File Upload Service is a microservice designed to handle file uploads, document generation, and image processing for the REVO platform. It provides RESTful APIs for:

- **File Uploads**: Uploading various file types to Google Cloud Storage (GCS)
- **Document Generation**: Creating PDF documents from Word templates (PO, PR, Invoices, Tickets, Cost Estimations)
- **Image Processing**: Resizing and optimizing product images
- **Multi-tenant Support**: Organization-based file management

### 1.2 Key Capabilities

- ✅ Multi-file upload support with size validation (150MB max)
- ✅ Dynamic document generation using DOCX templates
- ✅ PDF conversion using LibreOffice
- ✅ Image resizing (Large, Medium, Small variants)
- ✅ Google Cloud Storage integration
- ✅ Organization-based bucket management
- ✅ Integration with external REVO APIs

---

## 2. Architecture & Technology Stack

### 2.1 Technology Stack

| Component               | Technology              | Version      |
| ----------------------- | ----------------------- | ------------ |
| **Runtime**             | Node.js                 | 20           |
| **Framework**           | Fastify                 | ^5.0.0       |
| **Language**            | TypeScript              | ^5.9.3       |
| **Cloud Storage**       | Google Cloud Storage    | ^7.13.0      |
| **Document Processing** | Docxtemplater           | ^3.51.2      |
| **PDF Conversion**      | LibreOffice             | (via Docker) |
| **Image Processing**    | Jimp                    | ^0.22.12     |
| **File Upload**         | Multer / Fastify-Multer | ^2.0.3       |
| **Container Platform**  | Docker                  | -            |
| **Deployment**          | Google Cloud Run        | -            |

### 2.2 Architecture Pattern

- **Pattern**: RESTful API Microservice
- **Architecture Style**: Layered Architecture (Controller → Service → Storage)
- **Deployment**: Serverless (Cloud Run)

### 2.3 System Architecture Flow

```
Client Request
    ↓
Fastify Server (Port 4500)
    ↓
Routes Layer (routes.ts)
    ↓
Controller Layer (Business Logic)
    ↓
Service Layer (Data Processing)
    ↓
Cloud Storage / Document Generation
    ↓
Response to Client
```

---

## 3. Project Structure

```
gcp_file_upload/
├── src/                          # TypeScript source files
│   ├── index.ts                  # Application entry point
│   ├── routes/
│   │   └── routes.ts             # API route definitions
│   ├── controller/               # Request handlers
│   │   ├── docgen.controller.ts
│   │   ├── fileupload.controller.ts
│   │   ├── revoBanner.controller.ts
│   │   ├── revoBlog.controller.ts
│   │   ├── revoPoInvoce.controller.ts
│   │   ├── revoproductimage.controller.ts
│   │   ├── revoPrQuotes.controller.ts
│   │   ├── revoratinguploads.controller.ts
│   │   └── revoTicketController.ts
│   ├── service/                  # Business logic layer
│   │   ├── docgen.service.ts
│   │   ├── fileupload.service.ts
│   │   ├── revoBanner.service.ts
│   │   ├── revoBlogs.service.ts
│   │   ├── revoPoInvoice.service.ts
│   │   ├── revoproductimage.service.ts
│   │   ├── revoPrQuotes.service.ts
│   │   ├── revoratinguploads.service.ts
│   │   └── revoTicketImages.service.ts
│   ├── cloudstorge/
│   │   └── cloudstorage.ts       # GCS upload utilities
│   ├── multer/
│   │   └── multer.ts             # File upload middleware
│   ├── docxtemplate/
│   │   ├── docx.ts               # DOCX generation logic
│   │   └── docx_pdf_conversion.ts
│   ├── utils/
│   │   ├── config.ts             # Environment configuration
│   │   └── imageresize.ts        # Image processing utilities
│   └── interface/
│       └── fileupload.interface.ts
├── build/                        # Compiled JavaScript files
├── uploads/                      # Temporary file storage
├── po/                          # PO templates
├── pr/                          # PR templates
├── invoice/                     # Invoice templates
├── costestimation/              # Cost estimation templates
├── src/template/                # Template files
├── dockerfile                   # Docker configuration
├── cloudbuildprod.yaml          # Production CI/CD config
├── cloudbuilduat.yaml          # UAT CI/CD config
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── .env                         # Environment variables (not in repo)
```

---

## 4. Key Features & Functionalities

### 4.1 File Upload Features

#### 4.1.1 General File Upload

- **Endpoint**: `POST /file-upload/:organisation`
- **Purpose**: Upload files to organization-specific GCS buckets
- **Features**:
  - Automatic bucket creation if not exists
  - Organization name sanitization
  - Multiple file support
  - File size validation (150MB max)

#### 4.1.2 Product Image Upload

- **Endpoint**: `POST /product/images/:productid`
- **Purpose**: Upload and resize product images
- **Features**:
  - Automatic image resizing (Large, Medium, Small)
  - Organized storage by product ID
  - JPEG optimization
  - Multiple size variants generation

#### 4.1.3 Rating Images Upload

- **Endpoint**: `POST /uploadrating/images`
- **Purpose**: Upload images for product ratings
- **Features**:
  - Multiple image support
  - Integration with rating API
  - Product ID validation

#### 4.1.4 Banner Image Upload

- **Endpoint**: `POST /banner/image/`
- **Purpose**: Upload banner images for marketing

#### 4.1.5 Blog PDF Upload

- **Endpoint**: `POST /blog/pdf/`
- **Purpose**: Upload PDF files for blog posts

### 4.2 Document Generation Features

#### 4.2.1 Purchase Order (PO) Generation

- **Template**: `po/Revo-PO new 1.docx`
- **Output**: PDF document
- **Bucket**: `REVO_PO_BUCKET`
- **Integration**: `REVO_PO_GENERATE_API`

#### 4.2.2 Purchase Request (PR) Generation

- **Template**: `pr/Revo-PR.docx`
- **Output**: PDF document
- **Bucket**: `REVO_PR_BUCKET`
- **Integration**: `REVO_PR_GENERATE_API`

#### 4.2.3 Cost Estimation Generation

- **Template**: `costestimation/costestimation.docx`
- **Output**: PDF document
- **Bucket**: `REVO_COST_ESTIMATION_BUCKET`
- **Integration**: `REVO_COST_ESTIMATTION_GENERATE_API`

#### 4.2.4 Invoice Generation

- **Product Invoice Template**: `invoice/revoinvoiceproduct.docx`
- **Product Invoice (In-store) Template**: `invoice/revoinvoiceproductinstore.docx`
- **Service Invoice Template**: `invoice/revoinvoiceservice.docx`
- **Output**: PDF document
- **Buckets**: `REVO_PRODUCT_INVOICE_BUCKET`, `REVO_SERVICE_INVOICE_BUCKET`
- **Integration**: `REVO_INVOICE_GENERATE_API`

#### 4.2.5 Ticket Document Generation

- **Purpose**: Generate ticket-related documents
- **Integration**: `REVO_TICKETS_IMAGES_API`

### 4.3 Document Processing Flow

1. **Template Selection**: Based on `templatetype` parameter
2. **Data Binding**: Merge data with DOCX template using Docxtemplater
3. **DOCX Generation**: Create DOCX file in `/uploads` directory
4. **PDF Conversion**: Convert DOCX to PDF using LibreOffice (`soffice`)
5. **GCS Upload**: Upload PDF to appropriate GCS bucket
6. **URL Return**: Return GCS public URL

---

## 5. API Endpoints Documentation

### 5.1 Health Check

**Endpoint**: `GET /`  
**Description**: Health check endpoint  
**Response**:

```json
{
  "hello": "world"
}
```

### 5.2 PDF Generation

**Endpoint**: `POST /pdf`  
**Description**: Generate PDF from uploaded file  
**Request**: Multipart form data  
**Response**: Generated PDF URL

### 5.3 File Upload (Organization-based)

**Endpoint**: `POST /file-upload/:organisation`  
**Description**: Upload files to organization-specific bucket  
**Parameters**:

- `organisation` (path): Organization name

**Request**: Multipart form data with file(s)  
**Response**:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "filename": "filename.pdf",
  "url": "https://storage.cloud.google.com/bucket/filename.pdf"
}
```

### 5.4 Get Files

**Endpoint**: `GET /get-files/:organisation`  
**Description**: Retrieve list of files for an organization  
**Parameters**:

- `organisation` (path): Organization name

**Response**: Array of file metadata with signed URLs

### 5.5 Product Image Upload

**Endpoint**: `POST /product/images/:productid`  
**Description**: Upload and resize product images  
**Parameters**:

- `productid` (path): Product ID

**Request**: Multipart form data with image file(s)  
**Response**:

```json
{
  "url": {
    "Large": ["https://storage.cloud.google.com/..."],
    "Medium": ["https://storage.cloud.google.com/..."],
    "Small": ["https://storage.cloud.google.com/..."]
  }
}
```

### 5.6 PO Invoice Upload

**Endpoint**: `POST /po/invoice`  
**Description**: Upload PO invoice files  
**Request**: Multipart form data  
**Response**: Upload confirmation with URL

### 5.7 PR Quotes Upload

**Endpoint**: `POST /pr/quotes`  
**Description**: Upload PR quote files  
**Request**: Multipart form data  
**Response**: Upload confirmation with URL

### 5.8 Ticket Images Upload

**Endpoint**: `POST /tickets/images`  
**Description**: Upload ticket-related images  
**Request**: Multipart form data  
**Response**: Upload confirmation with URL

### 5.9 Banner Image Upload

**Endpoint**: `POST /banner/image/`  
**Description**: Upload banner images  
**Request**: Multipart form data  
**Response**: Upload confirmation with URL

### 5.10 Blog PDF Upload

**Endpoint**: `POST /blog/pdf/`  
**Description**: Upload blog PDF files  
**Request**: Multipart form data  
**Response**: Upload confirmation with URL

### 5.11 Rating Images Upload

**Endpoint**: `POST /uploadrating/images`  
**Description**: Upload rating images and create rating  
**Request Body**:

- `productid` (required): Product ID
- `file`: Image file(s)

**Response**: Rating creation response from API

### 5.12 Document Generation

**Endpoint**: `POST /generate-document/:templatetype`  
**Description**: Generate document from template  
**Parameters**:

- `templatetype` (path): One of `po`, `pr`, `costestimation`, `productinvoice`, `serviceinvoice`

**Request Headers**:

- `Authorization`: Bearer token

**Request Body**: JSON data matching template variables  
**Response**: Generated document URL

**Example Request**:

```json
{
  "ponumber": "REVO-PO-0000000001",
  "suppliername": "ABC Suppliers",
  "items": [...]
}
```

---

## 6. Configuration & Environment Variables

### 6.1 Required Environment Variables

All environment variables are loaded from `.env` file using `dotenv`.

#### 6.1.1 API Endpoints

```env
REVO_PRODUCT_IMAGE_API=https://api.revo.com/product/image
REVO_PRODUCT_RATING_API=https://api.revo.com/product/rating
REVO_PO_INVOICE_API=https://api.revo.com/po/invoice
REVO_PR_QUOTES_API=https://api.revo.com/pr/quotes
REVO_TICKETS_IMAGES_API=https://api.revo.com/tickets/images
REVO_PO_GENERATE_API=https://api.revo.com/po/generate
REVO_PR_GENERATE_API=https://api.revo.com/pr/generate
REVO_COST_ESTIMATTION_GENERATE_API=https://api.revo.com/cost-estimation/generate
REVO_INVOICE_GENERATE_API=https://api.revo.com/invoice/generate
REVO_BANNER_IMAGES_API=https://api.revo.com/banner/images
REVO_BLOGS_IMAGES_API=https://api.revo.com/blogs/images
```

#### 6.1.2 GCS Bucket Names

```env
REVO_PO_BUCKET=revo-po
REVO_PR_BUCKET=revo-pr
REVO_COST_ESTIMATION_BUCKET=revo-cost-estimation
REVO_PRODUCT_INVOICE_BUCKET=revo-product-invoice
REVO_SERVICE_INVOICE_BUCKET=revo-service-invoice
REVO_PRODUCT_IMAGES_BUCKET=revo-product-images
REVO_RATINGS_IMAGES_BUCKET=revo-ratings-images
REVO_PO_INVOICE_BUCKET=revo-po-invoice
REVO_PR_QUOTES_BUCKET=revo-pr-quotes
REVO_TICKET_IMAGES_BUCKET=revo-ticket-images
REVO_BANNER_IMAGES_BUCKET=revo-banner-images
REVO_BLOG_PDF_BUCKET=revo-blog-pdf
```

### 6.2 Configuration File

The configuration is centralized in `src/utils/config.ts`:

- Loads all environment variables
- Exports constants for use across the application
- Ensures type safety

---

## 7. Development Setup

### 7.1 Prerequisites

- **Node.js**: Version 20 or higher
- **npm** or **pnpm**: Package manager
- **TypeScript**: ^5.9.3
- **Google Cloud SDK**: For GCS access
- **Docker**: For local testing with LibreOffice

### 7.2 Local Development Steps

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd gcp_file_upload
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure Environment**

   - Create `.env` file in root directory
   - Add all required environment variables (see Section 6.1)

4. **Set Up Google Cloud Credentials**

   ```bash
   # Option 1: Service Account Key
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"

   # Option 2: Application Default Credentials
   gcloud auth application-default login
   ```

5. **Build TypeScript**

   ```bash
   npm run build
   ```

6. **Run Development Server**
   ```bash
   npm run dev
   ```
   Server will start on `http://localhost:4500`

### 7.3 Development Scripts

| Script             | Command                          | Description                      |
| ------------------ | -------------------------------- | -------------------------------- |
| Development        | `npm run dev`                    | Run with tsx (hot reload)        |
| Build              | `npm run build`                  | Compile TypeScript to JavaScript |
| Docker Build (SIT) | `npm run revo-fileupload-build`  | Build Docker image for SIT       |
| Docker Tag (SIT)   | `npm run revo-fileupload-tag`    | Tag Docker image                 |
| Docker Push (SIT)  | `npm run revo-fileupload-push`   | Push to GCR                      |
| Deploy (SIT)       | `npm run revo-fileupload-deploy` | Deploy to Cloud Run              |
| Full Deploy (SIT)  | `npm run fileupload-all`         | Build, tag, push, and deploy     |

---

## 8. Deployment Process

### 8.1 Deployment Environments

The project supports three environments:

1. **SIT (System Integration Testing)**: `revo-dev-and-test` project
2. **UAT (User Acceptance Testing)**: `revo-dev-and-test` project
3. **Production**: `revo-prod-445604` project

### 8.2 Cloud Run Deployment

#### 8.2.1 SIT Environment

- **Service Name**: `revo-fileupload-sit`
- **Project**: `revo-dev-and-test`
- **Region**: `us-central1`
- **Port**: `4500`
- **Service Account**: `revo-dev-fileupload@revo-dev-and-test.iam.gserviceaccount.com`

#### 8.2.2 UAT Environment

- **Service Name**: `revo365-fileupload-uat`
- **Project**: `revo-dev-and-test`
- **Region**: `us-central1`
- **Port**: `4500`
- **Service Account**: `revo-test-fileupload@revo-dev-and-test.iam.gserviceaccount.com`

#### 8.2.3 Production Environment

- **Service Name**: `revo-file-upload`
- **Project**: `revo-prod-445604`
- **Region**: `us-central1`
- **Port**: `4500`
- **Service Account**: `revo-file-upload@revo-prod-445604.iam.gserviceaccount.com`

### 8.3 CI/CD Pipeline

#### 8.3.1 Using Cloud Build (Recommended)

**For UAT:**

```bash
gcloud builds submit --config cloudbuilduat.yaml
```

**For Production:**

```bash
gcloud builds submit --config cloudbuildprod.yaml
```

#### 8.3.2 Manual Deployment Steps

1. **Build Docker Image**

   ```bash
   docker build -t revo-fileupload-sit .
   ```

2. **Tag Image**

   ```bash
   docker tag revo-fileupload-sit gcr.io/revo-dev-and-test/revo-fileupload-sit
   ```

3. **Push to GCR**

   ```bash
   docker push gcr.io/revo-dev-and-test/revo-fileupload-sit
   ```

4. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy revo-fileupload-sit \
     --image gcr.io/revo-dev-and-test/revo-fileupload-sit:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 4500 \
     --service-account revo-dev-fileupload@revo-dev-and-test.iam.gserviceaccount.com \
     --execution-environment gen2
   ```

### 8.4 Docker Configuration

The `dockerfile` includes:

- Node.js 20 base image
- LibreOffice installation (for PDF conversion)
- Application dependencies
- Production build

**Key Dockerfile Features:**

- Multi-stage optimization
- LibreOffice for DOCX to PDF conversion
- Non-root user (security best practice)
- Optimized layer caching

---

## 9. Key Components & Responsibilities

### 9.1 Controllers

Controllers handle HTTP requests and responses. They:

- Validate request data
- Call appropriate services
- Handle errors
- Format responses

**Key Controllers:**

| Controller                       | Purpose                                                 |
| -------------------------------- | ------------------------------------------------------- |
| `fileupload.controller.ts`       | Document generation (PO, PR, Invoices, Cost Estimation) |
| `docgen.controller.ts`           | General document generation and file operations         |
| `revoPoInvoce.controller.ts`     | PO invoice uploads                                      |
| `revoPrQuotes.controller.ts`     | PR quote uploads                                        |
| `revoTicketController.ts`        | Ticket image uploads                                    |
| `revoproductimage.controller.ts` | Product image uploads with resizing                     |
| `revoBanner.controller.ts`       | Banner image uploads                                    |
| `revoBlog.controller.ts`         | Blog PDF uploads                                        |

### 9.2 Services

Services contain business logic and orchestrate operations:

| Service                       | Purpose                              |
| ----------------------------- | ------------------------------------ |
| `fileupload.service.ts`       | Document generation orchestration    |
| `docgen.service.ts`           | File upload and retrieval operations |
| `revoPoInvoice.service.ts`    | PO invoice processing                |
| `revoPrQuotes.service.ts`     | PR quote processing                  |
| `revoTicketImages.service.ts` | Ticket image processing              |
| `revoproductimage.service.ts` | Product image processing             |
| `revoBanner.service.ts`       | Banner image processing              |
| `revoBlogs.service.ts`        | Blog PDF processing                  |

### 9.3 Cloud Storage Module

**File**: `src/cloudstorge/cloudstorage.ts`

**Key Functions:**

1. **`uploadRevoFiles()`**

   - Uploads multiple files to GCS
   - Supports folder organization
   - Returns upload results with URLs

2. **`uploadProductImage()`**

   - Uploads product images with size variants
   - Organizes by product ID and size

3. **`uploadPoInvoice()`**

   - Uploads PO invoice files
   - Supports folder organization

4. **`uploadFilesToGcs2()`**

   - Uploads files from buffer to GCS
   - Used for generated documents

5. **`getBucketFiles()`**

   - Retrieves files from bucket
   - Generates signed URLs
   - Supports pagination

6. **`uploadFileToGcp()`**
   - Organization-based file upload
   - Auto-creates buckets if needed

### 9.4 Document Generation Module

**File**: `src/docxtemplate/docx.ts`

**Process:**

1. Load DOCX template
2. Parse template with Docxtemplater
3. Render data into template
4. Generate DOCX file
5. Convert DOCX to PDF using LibreOffice
6. Return file URL

**Key Functions:**

- `GenerateDocx()`: Main generation function
- `fileGeneration()`: Individual file generation
- `convertToPdf()`: DOCX to PDF conversion

### 9.5 Image Processing Module

**File**: `src/utils/imageresize.ts`

**Features:**

- Reads image from stream
- Resizes to three sizes: Large, Medium, Small
- Converts to JPEG format
- Uploads each size variant to GCS
- Returns grouped URLs by size

**Size Specifications:**

- **Large**: Original size
- **Medium**: 50% of original width
- **Small**: 100px width

### 9.6 Multer Configuration

**File**: `src/multer/multer.ts`

**Configuration:**

- Storage: Disk storage
- Destination: `/uploads` directory
- Filename: Timestamp + original name
- Max file size: 150MB
- Multiple files: Supported

---

## 10. Integration Points

### 10.1 External APIs

The service integrates with multiple REVO APIs:

| API                  | Purpose                      | Endpoint Variable                    |
| -------------------- | ---------------------------- | ------------------------------------ |
| Product Image API    | Store product image metadata | `REVO_PRODUCT_IMAGE_API`             |
| Product Rating API   | Create ratings with images   | `REVO_PRODUCT_RATING_API`            |
| PO Invoice API       | Store PO invoice data        | `REVO_PO_INVOICE_API`                |
| PR Quotes API        | Store PR quote data          | `REVO_PR_QUOTES_API`                 |
| Tickets Images API   | Store ticket image data      | `REVO_TICKETS_IMAGES_API`            |
| PO Generate API      | Generate PO documents        | `REVO_PO_GENERATE_API`               |
| PR Generate API      | Generate PR documents        | `REVO_PR_GENERATE_API`               |
| Cost Estimation API  | Generate cost estimation     | `REVO_COST_ESTIMATTION_GENERATE_API` |
| Invoice Generate API | Generate invoice documents   | `REVO_INVOICE_GENERATE_API`          |
| Banner Images API    | Store banner image data      | `REVO_BANNER_IMAGES_API`             |
| Blogs Images API     | Store blog PDF data          | `REVO_BLOGS_IMAGES_API`              |

### 10.2 Google Cloud Services

1. **Google Cloud Storage (GCS)**

   - File storage
   - Multiple buckets for different document types
   - Public and signed URL generation

2. **Google Cloud Run**

   - Serverless container hosting
   - Auto-scaling
   - Pay-per-use model

3. **Google Container Registry (GCR)**
   - Docker image storage
   - Image versioning

### 10.3 Authentication

- **Service Account**: Used for GCS operations
- **Bearer Token**: Required for document generation endpoints (passed in Authorization header)
- **API Keys**: Configured via environment variables

---

## 11. File Upload Flow

### 11.1 Standard File Upload Flow

```
1. Client sends POST request with multipart/form-data
   ↓
2. Multer middleware processes files
   - Validates file size (max 150MB)
   - Saves to /uploads directory
   - Generates unique filename
   ↓
3. Controller receives request
   - Extracts file metadata
   - Validates request parameters
   ↓
4. Service processes files
   - Reads file from disk
   - Determines content type
   ↓
5. Cloud Storage upload
   - Creates/uses GCS bucket
   - Uploads file with metadata
   - Generates public URL
   ↓
6. Response sent to client
   - Success status
   - File URL
   - Metadata
```

### 11.2 Product Image Upload Flow

```
1. Client sends POST /product/images/:productid
   ↓
2. Multer processes image file(s)
   ↓
3. Image Resize Service
   - Reads image buffer
   - Creates three size variants (Large, Medium, Small)
   - Converts to JPEG
   ↓
4. Upload each variant to GCS
   - Path: {productid}/{size}/{filename}
   ↓
5. Group URLs by size
   ↓
6. Return grouped URLs to client
```

### 11.3 Document Generation Flow

```
1. Client sends POST /generate-document/:templatetype
   ↓
2. Multer processes uploaded files (if any)
   ↓
3. File Upload Service
   - Selects appropriate template
   - Determines target bucket
   ↓
4. Document Generation
   - Loads DOCX template
   - Merges data with template
   - Generates DOCX file
   ↓
5. PDF Conversion
   - Uses LibreOffice (soffice)
   - Converts DOCX to PDF
   ↓
6. GCS Upload
   - Uploads PDF to bucket
   - Returns public URL
   ↓
7. External API Call (if required)
   - Updates document URL in main system
   ↓
8. Response to client
```

---

## 12. Document Generation Flow

### 12.1 Template-Based Document Generation

**Supported Templates:**

1. **Purchase Order (PO)**: `po/Revo-PO new 1.docx`
2. **Purchase Request (PR)**: `pr/Revo-PR.docx`
3. **Cost Estimation**: `costestimation/costestimation.docx`
4. **Product Invoice**: `invoice/revoinvoiceproduct.docx`
5. **Product Invoice (In-store)**: `invoice/revoinvoiceproductinstore.docx`
6. **Service Invoice**: `invoice/revoinvoiceservice.docx`

### 12.2 Template Variables

Templates use Docxtemplater syntax:

- `{variable}`: Simple variable replacement
- `{#items}...{/items}`: Loop blocks
- `{?condition}...{/condition}`: Conditional blocks

### 12.3 Data Processing

**Cost Estimation Special Handling:**

- `productdata` and `servicedata` are JSON strings that get parsed
- `estimationdate` is automatically set to current date

**Invoice Special Handling:**

- Only `id` and `invoiceurl` are sent to generate API

### 12.4 PDF Conversion Process

1. **DOCX Generation**: Created in `/uploads` directory
2. **LibreOffice Command**:
   ```bash
   soffice --headless --convert-to pdf "input.docx" --outdir "output"
   ```
3. **PDF Storage**: PDF saved alongside DOCX
4. **Cleanup**: Files remain in `/uploads` (consider cleanup strategy)

---

## 13. Troubleshooting & Common Issues

### 13.1 Common Errors

#### Error: "Bucket not found"

**Cause**: Bucket doesn't exist in GCS  
**Solution**:

- Check bucket name in environment variables
- Verify service account has bucket access
- Create bucket manually if needed

#### Error: "File upload failed"

**Cause**: Multiple possible issues  
**Solutions**:

- Check file size (max 150MB)
- Verify GCS permissions
- Check disk space in `/uploads`
- Verify network connectivity

#### Error: "LibreOffice conversion failed"

**Cause**: LibreOffice not installed or command failed  
**Solutions**:

- Verify LibreOffice is installed in Docker container
- Check file permissions
- Verify DOCX file is valid
- Check Docker logs

#### Error: "Template not found"

**Cause**: Template file missing  
**Solution**: Verify template exists in correct directory

#### Error: "Authorization failed"

**Cause**: Missing or invalid Bearer token  
**Solution**: Include valid `Authorization` header in request

### 13.2 Debugging Tips

1. **Check Logs**

   ```bash
   # Cloud Run logs
   gcloud logging read "resource.type=cloud_run_revision" --limit 50
   ```

2. **Local Testing**

   - Use `npm run dev` for development
   - Check console output
   - Verify environment variables

3. **File Upload Issues**

   - Check `/uploads` directory permissions
   - Verify disk space
   - Check file size limits

4. **GCS Issues**
   - Verify service account credentials
   - Check IAM permissions
   - Verify bucket exists

### 13.3 Performance Optimization

1. **File Size Limits**: Currently 150MB - adjust if needed
2. **Concurrent Uploads**: Multiple files processed in parallel
3. **Image Resizing**: Can be CPU intensive for large images
4. **PDF Conversion**: Single-threaded, consider queue for high volume

---

## 14. Best Practices

### 14.1 Code Practices

1. **Error Handling**

   - Always use try-catch blocks
   - Return meaningful error messages
   - Log errors for debugging

2. **Type Safety**

   - Use TypeScript interfaces
   - Validate input data
   - Type function parameters and returns

3. **Code Organization**

   - Keep controllers thin
   - Business logic in services
   - Reusable utilities in utils

4. **Environment Variables**
   - Never commit `.env` file
   - Use descriptive variable names
   - Document required variables

### 14.2 Security Practices

1. **Authentication**

   - Require Bearer tokens for sensitive endpoints
   - Validate organization names
   - Sanitize file names

2. **File Validation**

   - Validate file types
   - Check file sizes
   - Scan for malicious content (consider adding)

3. **GCS Security**

   - Use service accounts with minimal permissions
   - Enable bucket versioning for critical files
   - Use signed URLs for private files

4. **Input Validation**
   - Validate all user inputs
   - Sanitize organization names
   - Check file extensions

### 14.3 Deployment Practices

1. **Environment Separation**

   - Use different buckets for each environment
   - Separate service accounts
   - Environment-specific configurations

2. **Version Control**

   - Tag releases
   - Document changes
   - Use semantic versioning

3. **Monitoring**

   - Set up Cloud Run monitoring
   - Track error rates
   - Monitor file upload success rates

4. **Backup Strategy**
   - Enable GCS versioning
   - Regular backups of templates
   - Document recovery procedures

---

## 15. Security Considerations

### 15.1 Authentication & Authorization

- **Service Account**: Used for GCS operations (read-only or specific bucket access)
- **Bearer Tokens**: Required for document generation endpoints
- **Organization Validation**: Validate organization names to prevent bucket name manipulation

### 15.2 File Security

- **File Type Validation**: Currently limited - consider adding MIME type validation
- **File Size Limits**: 150MB max to prevent DoS attacks
- **Filename Sanitization**: Timestamps prevent filename conflicts and injection

### 15.3 Network Security

- **HTTPS**: Cloud Run provides HTTPS by default
- **CORS**: Configured to allow cross-origin requests (review for production)
- **Rate Limiting**: Not implemented - consider adding for production

### 15.4 Data Privacy

- **Temporary Files**: Files in `/uploads` should be cleaned up periodically
- **Signed URLs**: Use for sensitive documents instead of public URLs
- **Access Control**: Implement organization-level access control

---

## 16. Future Enhancements

### 16.1 Recommended Improvements

1. **File Cleanup**

   - Implement scheduled cleanup of `/uploads` directory
   - Remove files older than X days

2. **Rate Limiting**

   - Implement rate limiting per IP/organization
   - Prevent abuse

3. **File Validation**

   - Add MIME type validation
   - Virus scanning integration
   - File content validation

4. **Monitoring & Logging**

   - Structured logging
   - Error tracking (e.g., Sentry)
   - Performance metrics

5. **Caching**

   - Cache frequently accessed files
   - CDN integration for static assets

6. **Queue System**

   - Implement queue for document generation
   - Handle high-volume requests

7. **Testing**
   - Unit tests for services
   - Integration tests for APIs
   - E2E tests for critical flows

---

## 17. Contact & Support

### 17.1 Key Contacts

- **Project Repository**: [Repository URL]
- **Documentation**: This KT document
- **Issue Tracking**: [Issue Tracker URL]

### 17.2 Getting Help

1. **Check Logs**: Review Cloud Run logs first
2. **Review Documentation**: Check this KT document
3. **Check Environment**: Verify environment variables
4. **Contact Team**: Reach out to development team

---

## 18. Appendix

### 18.1 Useful Commands

```bash
# Local development
npm run dev

# Build
npm run build

# Docker build
docker build -t revo-fileupload-sit .

# Test GCS connection
gcloud storage ls

# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=revo-fileupload-sit" --limit 50

# Deploy to SIT
npm run fileupload-all
```

### 18.2 File Naming Conventions

- **Uploaded Files**: `{timestamp}-{originalname}`
- **Generated Documents**: `{ponumber|prnumber|invoicenumber|ticketnumber}.pdf`
- **Product Images**: `{productid}/{size}/{large|medium|small}_{filename}`

### 18.3 GCS Bucket Structure

```
revo-product-images/
  └── {productid}/
      ├── large/
      ├── medium/
      └── small/

revo-po/
  └── {ponumber}/
      └── REVO-PO-{number}.pdf

revo-pr/
  └── {prnumber}/
      └── REVO-PR-{number}.pdf
```

---

**Document End**

_This KT document should be updated as the project evolves. Please keep it current with any changes to architecture, APIs, or processes._
