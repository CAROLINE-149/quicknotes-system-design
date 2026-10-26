
// QuickNotes API Client
// Practice API: JSONPlaceholder

const API_URL = "https://jsonplaceholder.typicode.com/posts";

// Get the HTML elements
const loadButton = document.querySelector("#load-btn");
const statusElement = document.querySelector("#status");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");
const notesList = document.querySelector("#notes-list");

// Store notes currently displayed on the page
let notes = [];

// Track whether a request is running
let isLoadingNotes = false;
let isCreatingNote = false;
const deletingNoteIds = new Set();

/**
 * Display a message to the user.
 * The class controls whether the message is normal, loading,
 * successful, or an error.
 */
function showStatus(message, type = "") {
    statusElement.textContent = message;
    statusElement.className = type;
}

/**
 * Reusable function for making API requests.
 * It checks response.ok and throws an error for failed responses.
 */
async function request(url, options = {}) {
    const response = await fetch(url, options);

    // fetch does not automatically throw for HTTP errors like 404.
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    // DELETE may return an empty response, so do not parse its body here.
    if (response.status === 204) {
        return { data: null, status: response.status };
    }

    const data = await response.json();

    return {
        data,
        status: response.status
    };
}

/**
 * Enable or disable controls while requests are running.
 */
function updateButtons() {
    loadButton.disabled = isLoadingNotes;
    submitButton.disabled = isCreatingNote;
}

/**
 * Display the current notes.
 * All user-controlled text is inserted with textContent,
 * not innerHTML, to avoid interpreting text as HTML.
 */
function renderNotes() {
    // Clear the previous list
    notesList.replaceChildren();

    // Display an empty state when there are no notes
    if (notes.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty-state";
        emptyItem.textContent =
            "No notes to display. Load notes or create your first note.";

        notesList.appendChild(emptyItem);
        return;
    }

    notes.forEach((note) => {
        const listItem = document.createElement("li");
        listItem.className = "note-item";

        const title = document.createElement("h3");
        title.textContent = note.title || "Untitled note";

        const body = document.createElement("p");
        body.textContent = note.body || "No body provided.";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        // Remember the note ID so the correct note can be deleted
        deleteButton.dataset.noteId = String(note.id);
        deleteButton.disabled = deletingNoteIds.has(note.id);

        deleteButton.addEventListener("click", () => {
            deleteNote(note.id);
        });

        listItem.append(title, body, deleteButton);
        notesList.appendChild(listItem);
    });
}

/**
 * GET: Load 10 notes from JSONPlaceholder.
 */
async function loadNotes() {
    if (isLoadingNotes) return;

    isLoadingNotes = true;
    updateButtons();
    showStatus("Loading notes...", "loading");

    try {
        const result = await request(`${API_URL}?_limit=10`);

        notes = result.data;
        renderNotes();

        if (notes.length === 0) {
            showStatus("No notes were found on the server.", "");
        } else {
            showStatus(
                `Loaded ${notes.length} notes from the server.`,
                "success"
            );
        }
    } catch (error) {
        console.error("Error loading notes:", error);

        showStatus(
            "Sorry, we couldn't load your notes. Please check your connection and try again.",
            "error"
        );
    } finally {
        isLoadingNotes = false;
        updateButtons();
    }
}

/**
 * POST: Create a new note.
 */
async function createNote(event) {
    event.preventDefault();

    if (isCreatingNote) return;

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validate the title before making the request
    if (!title) {
        showStatus("Please enter a title for your note.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showStatus(
            "The title must not exceed 100 characters.",
            "error"
        );
        titleInput.focus();
        return;
    }

    isCreatingNote = true;
    updateButtons();
    showStatus("Creating your note...", "loading");

    try {
        const result = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })
        });

        // JSONPlaceholder simulates creation; it does not persist
        // new posts on its server. Keep the returned note in local
        // page state so it remains visible until the list is reloaded.
        notes.unshift(result.data);
        renderNotes();

        showStatus(
            `Note created (status ${result.status}, id ${result.data.id}).`,
            "success"
        );

        // Clear the form only after successful creation
        noteForm.reset();
    } catch (error) {
        console.error("Error creating note:", error);

        showStatus(
            "Sorry, we couldn't create your note. Please try again.",
            "error"
        );
    } finally {
        isCreatingNote = false;
        updateButtons();
    }
}

/**
 * DELETE: Remove a note from the displayed list.
 */
async function deleteNote(noteId) {
    if (deletingNoteIds.has(noteId)) return;

    deletingNoteIds.add(noteId);
    renderNotes();

    showStatus("Deleting note...", "loading");

    try {
        await request(`${API_URL}/${encodeURIComponent(noteId)}`, {
            method: "DELETE"
        });

        // JSONPlaceholder simulates deletion and does not permanently
        // store changes. Remove the note from our local list after
        // the successful response.
        notes = notes.filter((note) => note.id !== noteId);
        renderNotes();

        showStatus("Note deleted successfully.", "success");
    } catch (error) {
        console.error("Error deleting note:", error);

        showStatus(
            "Sorry, we couldn't delete that note. Please try again.",
            "error"
        );
    } finally {
        deletingNoteIds.delete(noteId);
        renderNotes();
    }
}

// Connect the buttons and form to their functions
loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

// Show the initial empty state
renderNotes();

