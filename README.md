# QuickNotes System Design

QuickNotes is a note-taking application project that demonstrates how a browser-based client communicates with a REST API and how a production note-taking service can be designed to support one million registered users.

The API client uses JSONPlaceholder as a practice API to demonstrate loading, creating, and deleting notes. The accompanying design documents describe the real backend, database, and architecture required for a production service.

## Features

- **Load notes:** Retrieve up to 10 notes using an HTTP GET request.
- **Create notes:** Submit a new note using POST with JSON data.
- **Delete notes:** Delete a note using an HTTP DELETE request.
- **Input validation:** Require a title with a maximum length of 100 characters.
- **Request handling:** Display loading, success, error, and empty states.
- **Safe rendering:** Insert note text using `textContent`.
- **System design:** Document the production API, relational data model, scalability estimates, and distributed architecture.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API and asynchronous JavaScript
- JSONPlaceholder practice API
- PostgreSQL for the proposed production database
- Git and GitHub

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── style.css
├── api.js
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## How to Run the API Client

### Prerequisites

- A modern web browser
- Python 3 or the VS Code Live Server extension
- An internet connection to reach JSONPlaceholder

### 1. Clone the repository

Replace `YOUR-USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR-USERNAME/quicknotes-system-design.git
cd quicknotes-system-design
```

### 2. Start a local server

Using Python:

```bash
python3 -m http.server 8000
```

### 3. Open the application

Visit:

http://localhost:8000

### 4. Test the features

1. Click **Load notes** to retrieve 10 notes.
2. Enter a title and an optional body, then click **Create note**.
3. Click a note's **Delete** button to remove it from the displayed list.
4. Try submitting an empty title to see validation.
5. Disconnect your internet connection temporarily to observe error handling.

### Important API Limitation

JSONPlaceholder is a practice API and does not permanently persist changes made through POST and DELETE requests. Created notes are added to the local page state after a successful response, while deleted notes are removed from that state. Reloading notes from the server may therefore discard these local changes.

The production API described in the documentation would use a persistent database.

## System Design Documentation

- [API Design](docs/api-design.md) — REST endpoints, request and response examples, error handling, authentication, and validation.
- [Data Model](docs/data-model.md) — Database entities, relationships, SQL table definitions, example queries, and indexes.
- [Architecture](docs/architecture.md) — Functional and non-functional requirements, workload estimates, architecture diagram, request flows, trade-offs, and availability.

## What I Learned

- **Working with APIs:** How to use `fetch()`, HTTP methods, JSON request bodies, response status codes, and `async/await` to communicate with a server.
- **Error handling and validation:** How to use `try/catch/finally`, validate user input, disable buttons during requests, and provide clear feedback.
- **REST API design:** How to define resource-oriented endpoints, use appropriate HTTP status codes, and structure consistent JSON responses.
- **Database design:** How primary keys, foreign keys, joins, indexes, and relational constraints maintain data integrity.
- **System scalability:** How load balancers, caching, read replicas, queues, and background workers help a service handle increasing traffic.
- **Git and GitHub:** How to organize project files and use meaningful commits to track development progress.

## Future Improvements

- Replace JSONPlaceholder with a real backend API.
- Implement secure user registration and authentication.
- Store notes permanently in PostgreSQL.
- Add search, editing, and tag management.
- Introduce automated tests and CI/CD.
- Deploy the application and production API to reliable hosting.

## Project Status

The browser client demonstrates API operations against a practice service. The API, database, and architecture documents describe the proposed production system; they do not indicate that the production backend has already been implemented.