# QuickNotes Database Design

## 1. Overview

QuickNotes uses a relational database to store user accounts, notes, tags, and the relationships between notes and tags.

The database is designed to maintain data integrity, support efficient queries, and ensure that users can access only their own notes.

**Database:** PostgreSQL

## 2. Entities and Columns

### 2.1 Users

Stores account information for each QuickNotes user.

| Column        | Type         | Key / Constraint               | Description              |
| ------------- | ------------ | ------------------------------ | ------------------------ |
| id            | BIGINT       | Primary key, generated         | Unique user identifier   |
| name          | VARCHAR(100) | NOT NULL                       | User's display name      |
| email         | VARCHAR(255) | UNIQUE, NOT NULL               | Login email              |
| password_hash | VARCHAR(255) | NOT NULL                       | Securely hashed password |
| created_at    | TIMESTAMPTZ  | NOT NULL, default current time | Account creation time    |

### 2.2 Notes

Stores notes created by users.

| Column     | Type         | Key / Constraint               | Description            |
| ---------- | ------------ | ------------------------------ | ---------------------- |
| id         | BIGINT       | Primary key, generated         | Unique note identifier |
| user_id    | BIGINT       | Foreign key, NOT NULL          | Owner of the note      |
| title      | VARCHAR(100) | NOT NULL                       | Note title             |
| body       | TEXT         | Nullable                       | Note content           |
| created_at | TIMESTAMPTZ  | NOT NULL, default current time | Creation time          |
| updated_at | TIMESTAMPTZ  | NOT NULL, default current time | Last update time       |

### 2.3 Tags

Stores labels users can apply to notes.

| Column     | Type        | Key / Constraint               | Description           |
| ---------- | ----------- | ------------------------------ | --------------------- |
| id         | BIGINT      | Primary key, generated         | Unique tag identifier |
| user_id    | BIGINT      | Foreign key, NOT NULL          | Owner of the tag      |
| name       | VARCHAR(50) | NOT NULL                       | Tag name              |
| created_at | TIMESTAMPTZ | NOT NULL, default current time | Creation time         |

A tag name must be unique for each user, but different users may have tags with the same name.

### 2.4 Note_Tags

A junction table connecting notes and tags.

| Column  | Type   | Key / Constraint                   | Description     |
| ------- | ------ | ---------------------------------- | --------------- |
| note_id | BIGINT | Composite primary key, foreign key | Associated note |
| tag_id  | BIGINT | Composite primary key, foreign key | Associated tag  |

The composite primary key prevents the same tag from being assigned to the same note more than once.

## 3. Relationships

### One-to-many

**Users to Notes:** One user can create many notes, but each note belongs to exactly one user. The `notes.user_id` foreign key references `users.id`.

**Users to Tags:** One user can create many tags, but each tag belongs to exactly one user. The `tags.user_id` foreign key references `users.id`.

### Many-to-many

**Notes to Tags:** A note can have multiple tags, and each tag can be applied to multiple notes. The `note_tags` junction table implements this relationship using two foreign keys.

The database uses foreign-key constraints to prevent orphaned notes and tag associations.

## 4. SQL Table Definitions

The following PostgreSQL statements create the four tables and their constraints.

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL
        CHECK (char_length(btrim(title)) BETWEEN 1 AND 100),
    body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL
        CHECK (char_length(btrim(name)) BETWEEN 1 AND 50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name),
    UNIQUE (id, user_id)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id)
        ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id)
        ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

### Enforcing ownership of tag associations

A foreign key on `note_tags` alone does not ensure that a note and tag belong to the same user. The application must verify ownership when attaching tags.

For stronger database-level enforcement, add a composite foreign key:

```sql
ALTER TABLE notes
ADD CONSTRAINT notes_id_user_unique
UNIQUE (id, user_id);

ALTER TABLE note_tags
ADD COLUMN user_id BIGINT NOT NULL;

ALTER TABLE note_tags
ADD CONSTRAINT note_tags_note_owner_fk
FOREIGN KEY (note_id, user_id)
REFERENCES notes(id, user_id)
ON DELETE CASCADE;

ALTER TABLE note_tags
ADD CONSTRAINT note_tags_tag_owner_fk
FOREIGN KEY (tag_id, user_id)
REFERENCES tags(id, user_id)
ON DELETE CASCADE;
```

With these additional constraints, each note-tag association must use the same owner for both resources. The application should still perform authorization checks.

## 5. Example SQL Queries

### Query 1: Get all notes belonging to a user

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC
LIMIT 20;
```

This retrieves the most recently updated notes for user 1.

### Query 2: Get a note and its tags (JOIN)

```sql
SELECT
    n.id AS note_id,
    n.title,
    t.id AS tag_id,
    t.name AS
```
