
const express = require("express");

const app = express();
const PORT = 3000;

// Middleware to read JSON request bodies
app.use(express.json());

// Temporary book database
let books = [
    {
        id: 1,
        title: "Introduction to Node.js",
        author: "John Smith",
        year: 2024
    },
    {
        id: 2,
        title: "Learning Express.js",
        author: "Jane Doe",
        year: 2025
    }
];

// Authentication middleware: librarian only
function librarianOnly(req, res, next) {
    const role = req.query.role;

    if (role !== "librarian") {
        return res.status(403).json({
            message: "Forbidden: Only librarians can perform this action"
        });
    }

    next();
}

// GET: Read all books
app.get("/books", (req, res) => {
    res.status(200).json(books);
});

// GET: Read one book by ID
app.get("/books/:id", (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);
});

// POST: Create a new book
app.post("/books", librarianOnly, (req, res) => {
    const { title, author, year } = req.body;

    if (
        typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        !Number.isInteger(year)
    ) {
        return res.status(400).json({
            message: "Title, author, and a valid year are required"
        });
    }

    const newBook = {
        id: books.length
            ? Math.max(...books.map(book => book.id)) + 1
            : 1,
        title: title.trim(),
        author: author.trim(),
        year
    };

    books.push(newBook);

    res.status(201).json({
        message: "Book created successfully",
        book: newBook
    });
});

// PUT: Update a book
app.put("/books/:id", librarianOnly, (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, year } = req.body;

    if (
        typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        !Number.isInteger(year)
    ) {
        return res.status(400).json({
            message: "Title, author, and a valid year are required"
        });
    }

    book.title = title.trim();
    book.author = author.trim();
    book.year = year;

    res.status(200).json({
        message: "Book updated successfully",
        book
    });
});

// DELETE: Delete a book
app.delete("/books/:id", librarianOnly, (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const deletedBook = books.splice(index, 1)[0];

    res.status(200).json({
        message: "Book deleted successfully",
        book: deletedBook
    });
});

// Handle routes that do not exist
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        message: "Internal server error"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Library API running at http://localhost:${PORT}`);
});