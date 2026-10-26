# QuickNotes REST API Design

## 1. Overview

The QuickNotes REST API allows users to create, view, update, and delete notes, as well as organize notes using tags. It uses HTTP methods to perform operations and JSON to exchange data between the client and server.

**Base URL:** `https://api.quicknotes.example.com/v1`

**Data format:** JSON (`application/json`)

**Authentication:** Authenticated endpoints require a valid bearer access token.

## 2. API Endpoints

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| POST | `/auth/register` | Register a new user account | 201 Created |
| POST | `/auth/login` | Authenticate a user | 200 OK |
| GET | `/notes` | List the authenticated user's notes | 200 OK |
| GET | `/notes/{id}` | Retrieve a specific note | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PATCH | `/notes/{id}` | Update an existing note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/tags` | List the user's tags | 200 OK |
| POST | `/notes/{id}/tags/{tagId}` | Attach a tag to a note | 200 OK |
| DELETE | `/notes/{id}/tags/{tagId}` | Remove a tag from a note | 204 No Content |

### Endpoint Details

#### 1. Register a user

`POST /auth/register`

Creates a new user account.

Success response: `201 Created`

#### 2. Log in

`POST /auth/login`

Validates credentials and returns an access token.

Success response: `200 OK`

#### 3. List notes

`GET /notes`

Returns notes belonging to the authenticated user. Supports pagination using `page` and `limit` query parameters.

Example: `GET /notes?page=1&limit=20`

Success response: `200 OK`

#### 4. Get a note

`GET /notes/{id}`

Returns a single note if it belongs to the authenticated user.

Success response: `200 OK`

#### 5. Create a note

`POST /notes`

Creates a note belonging to the authenticated user.

Success response: `201 Created`

#### 6. Update a note

`PATCH /notes/{id}`

Updates one or more fields of an existing note.

Success response: `200 OK`

#### 7. Delete a note

`DELETE /notes/{id}`

Permanently deletes a note owned by the authenticated user.

Success response: `204 No Content`

#### 8. List tags

`GET /tags`

Returns tags belonging to the authenticated user.

Success response: `200 OK`

#### 9. Attach a tag

`POST /notes/{id}/tags/{tagId}`

Associates an existing tag with a note owned by the user.

Success response: `200 OK`

#### 10. Remove a tag

`DELETE /notes/{id}/tags/{tagId}`

Removes the association between a note and a tag without deleting the tag itself.

Success response: `204 No Content`

## 3. Request and Response Examples

### Create a note

**Request**

```http
POST /v1/notes HTTP/1.1
Host: api.quicknotes.example.com
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "title": "Study JavaScript",
  "body": "Review promises and async/await."
}
```

The authenticated user's ID is obtained from the access token rather than trusting a user-supplied `userId`.

**Response — `201 Created`**

```json
{
  "id": 101,
  "user_id": 12,
  "title": "Study JavaScript",
  "body": "Review promises and async/await.",
  "created_at": "2026-10-26T10:30:00Z",
  "updated_at": "2026-10-26T10:30:00Z"
}
```

The server should also return a `Location` header identifying the new resource, such as `/v1/notes/101`.

### List notes

**Request**

```http
GET /v1/notes?page=1&limit=2 HTTP/1.1
Host: api.quicknotes.example.com
Authorization: Bearer <access_token>
```

**Response — `200 OK`**

```json
{
  "data": [
    {
      "id": 101,
      "title": "Study JavaScript",
      "body": "Review promises and async/await.",
      "created_at": "2026-10-26T10:30:00Z",
      "updated_at": "2026-10-26T10:30:00Z"
    },
    {
      "id": 102,
      "title": "Project ideas",
      "body": "Plan the next QuickNotes features.",
      "created_at": "2026-10-26T11:00:00Z",
      "updated_at": "2026-10-26T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 15,
    "total_pages": 8
  }
}
```

The `data` array contains the notes returned for the requested page. The pagination object describes the result set.

## 4. Error Handling

The API uses standard HTTP status codes to communicate failures.

| Status Code | Meaning | Example |
|---|---|---|
| 400 Bad Request | Invalid request data | Missing title or malformed JSON |
| 401 Unauthorized | Authentication is missing or invalid | Expired access token |
| 403 Forbidden | The user lacks permission | Attempt to perform an operation prohibited by policy |
| 404 Not Found | The requested resource does not exist or is not accessible to the user | Note not found |
| 409 Conflict | Request conflicts with existing data | Duplicate account email |
| 422 Unprocessable Content | Valid JSON but invalid field values | Title exceeds 100 characters |
| 429 Too Many Requests | Rate limit exceeded | Too many requests in a short period |
| 500 Internal Server Error | Unexpected server failure | Unhandled application exception |
| 503 Service Unavailable | Service temporarily unavailable | Database maintenance |

### Example error response

**Response — `400 Bad Request`**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [
      {
        "field": "title",
        "message": "Title is required."
      }
    ],
    "request_id": "req_abc123"
  }
}
```

Error responses use a consistent JSON structure. The `code` identifies the error, `message` provides a readable explanation, `details` gives field-level information when applicable, and `request_id` helps the team investigate problems.

The API must never expose passwords, access tokens, database credentials, or internal stack traces in error responses.

## 5. Validation Rules

- A note title is required and must contain between 1 and 100 characters after trimming whitespace.
- A note body is optional.
- Note IDs must be valid identifiers.
- Requests must use supported content types.
- Users may access and modify only their own notes and tags.
- Pagination parameters must be positive integers, and the page size must have a server-enforced maximum.
- All input must be validated on the server, even if the browser performs the same validation.

## 6. Authentication and Security

- Use HTTPS for all API traffic.
- Require bearer-token authentication for protected endpoints.
- Store passwords using a secure password-hashing algorithm such as Argon2id.
- Enforce resource ownership checks on every note and tag operation.
- Apply rate limiting to authentication and other sensitive endpoints.
- Use parameterized SQL queries to prevent SQL injection.
- Configure CORS to allow only approved client origins.
- Keep secrets and signing keys outside source control.

## 7. Pagination, Performance and Versioning

The API uses URL versioning through `/v1`. Pagination prevents requests from returning unnecessarily large collections.

The server should set sensible page-size limits, index frequently filtered columns, and monitor endpoint latency and database load. Caching may be used where appropriate, but user-specific notes must not be accidentally shared between users.

Breaking changes should be introduced through a planned API version rather than silently changing existing response structures.

## 8. Design Decisions

The API follows REST conventions by using nouns for resources, HTTP methods for actions, appropriate success status codes, and JSON representations. `POST` creates resources, `GET` retrieves them, `PATCH` updates selected fields, and `DELETE` removes resources.

The production QuickNotes API is distinct from the JSONPlaceholder practice API used in the browser client. JSONPlaceholder is used only to demonstrate HTTP requests; the endpoints and security rules in this document describe the real service the backend team should implement.