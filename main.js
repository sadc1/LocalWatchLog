const bookList = [];
const authorList = [];
const genres = [
    "Fiction",
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Horror",
    "History",
    "Biography",
    "Science",
    "Computers",
    "Business",
    "Psychology",
    "Philosophy",
    "Religion",
    "Art",
    "Music",
    "Travel",
    "Cooking",
    "Sports",
    "Poetry",
    "Comics"
];

const placeholderThumbnail = "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=";

function createAuthor(first, last, middle = "") {
    if (authorList.find(a => a.firstName === first && a.lastName === last && a.middleName === middle)) {
        return authorList.find(a => a.firstName === first && a.lastName === last && a.middleName === middle);
    }
    const obj = {};
    obj.firstName = first;
    obj.lastName = last;
    obj.middleName = middle;
    obj.toString = function () {
        return this.firstName + " " + this.middleName + " " + this.lastName;
    }
    return obj;
}

function createBook(title, author) {
    const obj = {};
    obj.title = title;
    obj.author = author;
    if (!authorList.includes(author)) {
        authorList.push(author);
    }
    obj.isbn = "Unassigned";
    obj.genre = "Unassigned";
    obj.watchStatus = "To Read";
    obj.rating = 0;
    obj.pageCount = 0;
    obj.thumbnail = placeholderThumbnail;
    obj.pagesRead = 0;
    obj.setValue = function (key, value) {
        this[key] = value;
    }
    return obj;
}

function buttonWindow() {
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = 1000;
    return modal;
}

function buttonWindowContent() {
    const content = document.createElement("div");
    content.style.backgroundColor = "white";
    content.style.padding = "20px";
    content.style.borderRadius = "10px";
    content.style.minWidth = "300px";
    return content;
}

function openWatchStatusModal(book, card) {
    const modal = buttonWindow();
    const content = buttonWindowContent();
    content.innerHTML = `
    <label>Update Watch Status:</label>
    <select id="watch_status_select">
      <option value="To Read">To Read</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>
    <br><br>
    <button id="watch_save_btn" class="btn btn-primary">Save</button>
    <button id="watch_cancel_btn" class="btn btn-secondary">Cancel</button>
  `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    const selectEl = content.querySelector("#watch_status_select");
    selectEl.value = book.watchStatus || "To Read";

    content.querySelector("#watch_cancel_btn").addEventListener("click", () => {
        modal.remove();
    });

    content.querySelector("#watch_save_btn").addEventListener("click", () => {
        const newStatus = selectEl.value;
        book.watchStatus = newStatus;
        updateCardTitleWithStatus(book, card);
        if (newStatus === "Completed") {
            book.pagesRead = book.pageCount || 0;
            const audio = new Audio('complete sound.mp3');
            audio.play().catch(err => console.log("Audio playback failed:", err));
        }

        card.querySelector(".pages_read").textContent = book.pagesRead;
        card.querySelector(".page_total").textContent = book.pageCount;
        modal.remove();
        alert(`Watch status updated to "${newStatus}"`);
    });
}

function openEditModal(book, card) {
    const modal = buttonWindow();
    const content = buttonWindowContent();
   
    const fieldSelect = document.createElement("select");
    ["genre", "isbn", "thumbnail", "pageCount"].forEach(f => {
        const option = document.createElement("option");
        option.value = f;
        option.textContent = f;
        fieldSelect.appendChild(option);
    });

    content.appendChild(document.createTextNode("Select field to edit: "));
    content.appendChild(fieldSelect);
    content.appendChild(document.createElement("br"));
    content.appendChild(document.createElement("br"));

    const inputContainer = document.createElement("div");
    content.appendChild(inputContainer);

    function renderInput() {
        inputContainer.innerHTML = "";
        const field = fieldSelect.value;

        if (field === "genre") {
            const select = document.createElement("select");
            genres.forEach(g => {
                const opt = document.createElement("option");
                opt.value = g;
                opt.textContent = g;
                if (g === book.genre) opt.selected = true;
                select.appendChild(opt);
            });
            inputContainer.appendChild(document.createTextNode("Select Genre: "));
            inputContainer.appendChild(select);
        } else if (field === "isbn") {
            const input = document.createElement("input");
            input.type = "text";
            input.value = book.isbn || "";
            inputContainer.appendChild(document.createTextNode("ISBN: "));
            inputContainer.appendChild(input);
        } else if (field === "thumbnail") {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            inputContainer.appendChild(document.createTextNode("Upload Cover: "));
            inputContainer.appendChild(input);
        } else if (field === "pageCount") {
            const input = document.createElement("input");
            input.type = "number";
            input.value = book.pageCount || 0;
            input.min = 0;
            inputContainer.appendChild(document.createTextNode("Page Count: "));
            inputContainer.appendChild(input);
        }
    }

    renderInput();
    fieldSelect.addEventListener("change", renderInput);

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.marginLeft = "10px";

    content.appendChild(document.createElement("br"));
    content.appendChild(document.createElement("br"));
    content.appendChild(saveBtn);
    content.appendChild(cancelBtn);

    modal.appendChild(content);
    document.body.appendChild(modal);

    saveBtn.addEventListener("click", () => {
        const field = fieldSelect.value;
        const inputEl = inputContainer.querySelector("input, select");

        if (field === "genre") {
            book.genre = inputEl.value;
            card.querySelector('[value="genre"]').textContent = "Genre(s) - " + book.genre;
        } else if (field === "isbn") {
            book.isbn = inputEl.value;
            card.querySelector('[value="isbn"]').textContent = "ISBN - " + book.isbn;
        } else if (field === "thumbnail") {
            const file = inputEl.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    book.thumbnail = e.target.result;
                    card.querySelector(".book_cover").src = book.thumbnail;
                };
                reader.readAsDataURL(file);
            }
        } else if (field === "pageCount") {
            const val = Number(inputEl.value);
            if (!isNaN(val)) {
                book.pageCount = val;
                card.querySelector(".page_total").textContent = book.pageCount;
            }
        }

        document.body.removeChild(modal);
    });

    cancelBtn.addEventListener("click", () => {
        document.body.removeChild(modal);
    });
}

function updateCardTitleWithStatus(book, card) {
    const h2 = card.querySelector("h2");
    const status = book.watchStatus || "To Read";
    h2.textContent = `${book.title} [${status}]`;
}

function addBookCard(book) {
    const template = document.getElementById("book_template");
    const bookListUI = document.getElementById("book_list");

    const clone = template.content.cloneNode(true);

    const card = clone.querySelector(".book_card");

    updateCardTitleWithStatus(book, card);

    card.querySelector("h2").textContent = book.title;

    card.querySelector('[value="author"]').textContent = "Author - " + book.author;

    card.querySelector('[value="genre"]').textContent = "Genre - " + book.genre;

    card.querySelector('[value="isbn"]').textContent = "ISBN - " + book.isbn;

    card.querySelector(".pages_read").textContent = book.pagesRead;
    card.querySelector(".page_total").textContent = book.pageCount;

    card.querySelector(".rating_input").textContent = book.rating;

    card.querySelector("#rate_button").addEventListener("click", () => {
        const newRating = prompt(`Enter rating for "${book.title}" (0-10):`);
        if (newRating !== null) {
            const ratingNum = Number(newRating);
            if (ratingNum >= 0 && ratingNum <= 10) {
                book.rating = ratingNum;
                card.querySelector(".rating_input").textContent = book.rating;
            } else {
                alert("Rating must be a number between 0 and 10.");
            }
        }
    });

    card.querySelector("#delete_button").addEventListener("click", () => {
        const confirm = window.confirm(`Are you sure you want to delete "${book.title}"?`);
        if (confirm) {
            const index = bookList.indexOf(book);
            if (index > -1) {
                bookList.splice(index, 1);
            }
            card.remove();
            updateBookList();
        }
    });

    card.querySelector(".edit_button").addEventListener("click", () => {
        openEditModal(book, card);
    });

    card.querySelector(".update_button").addEventListener("click", () => {
        openWatchStatusModal(book, card);
    });

    if (book.thumbnail) {
        card.querySelector(".book_cover").src = book.thumbnail;
    }

    bookListUI.appendChild(clone);
}

function openAddBookModal() {
    const modal = buttonWindow();
    const content = buttonWindowContent();

    content.innerHTML = `
    <label>Title: <input type="text" id="new_title"></label><br><br>
    <label>Author First: <input type="text" id="new_author_first"></label><br><br>
    <label>Author Middle: <input type="text" id="new_author_middle"></label><br><br>
    <label>Author Last: <input type="text" id="new_author_last"></label><br><br>
    <label>Genre: 
      <select id="new_genre">
        ${genres.map(g => `<option value="${g}">${g}</option>`).join('')}
      </select>
    </label><br><br>
    <label>ISBN: <input type="text" id="new_isbn"></label><br><br>
    <label>Page Count: <input type="number" id="new_pageCount" min="0"></label><br><br>
    <label>Book Cover: <input type="file" id="new_thumbnail" accept="image/*"></label><br><br>
  `;

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Book";
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.marginLeft = "10px";

    content.appendChild(addBtn);
    content.appendChild(cancelBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);

    cancelBtn.addEventListener("click", () => modal.remove());

    addBtn.addEventListener("click", () => {
        const title = document.getElementById("new_title").value.trim();
        const first = document.getElementById("new_author_first").value.trim();
        const middle = document.getElementById("new_author_middle").value.trim();
        const last = document.getElementById("new_author_last").value.trim();
        const genre = document.getElementById("new_genre").value;
        const isbn = document.getElementById("new_isbn").value.trim();
        const pageCount = Number(document.getElementById("new_pageCount").value);
        const fileInput = document.getElementById("new_thumbnail");

        if (!title || !first || !last) {
            alert("Please fill at least Title, Author First and Last.");
            return;
        }

        if (bookList.some(b => b.title.toLowerCase() === title.toLowerCase())) {
            alert("This book title already exists!");
            return;
        }

        const author = createAuthor(first, last, middle);
        const newBook = createBook(title, author);
        newBook.genre = genre;
        newBook.isbn = isbn;
        newBook.pageCount = isNaN(pageCount) ? 0 : pageCount;

        const finalizeAdd = () => {
            bookList.push(newBook);
            addBookCard(newBook);
            modal.remove();
            alert("Book added!");
        };

        if (fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = e => {
                newBook.thumbnail = e.target.result;
                finalizeAdd();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            finalizeAdd();
        }
    });
}

function sortBooks(type) {
    switch (type) {
        case "ascending_author":
            bookList.sort((a, b) => a.author.toString().localeCompare(b.author.toString()));
            break;
        case "descending_author":
            bookList.sort((a, b) => b.author.toString().localeCompare(a.author.toString()));
            break;
        case "ascending_genre":
            bookList.sort((a, b) => (a.genre || "").localeCompare(b.genre || ""));
            break;
        case "descending_genre":
            bookList.sort((a, b) => (b.genre || "").localeCompare(a.genre || ""));
            break;
        case "ascending_title":
            bookList.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "descending_title":
            bookList.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "ascending_rating":
            bookList.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            break;
        case "descending_rating":
            bookList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        default:
            console.warn("Unknown sort type:", type);
            return;
    }

    renderBookList();
}

function renderBookList() {
    const ul = document.getElementById("book_list");
    ul.innerHTML = "";
    bookList.forEach(book => addBookCard(book));
}

function filterBooks(filterType, filterValue) {
    let filtered = bookList;

    switch (filterType) {
        case "genre":
            if (filterValue) filtered = bookList.filter(b => b.genre === filterValue);
            break;
        case "watch_status":
            if (filterValue) filtered = bookList.filter(b => b.watchStatus === filterValue);
            break;
        case "rating":
            const ratingNum = Number(filterValue);
            if (!isNaN(ratingNum)) filtered = bookList.filter(b => (b.rating || 0) >= ratingNum);
            break;
    }

    renderFilteredBookList(filtered);
}

function renderFilteredBookList(filteredBooks) {
    const ul = document.getElementById("book_list");
    ul.innerHTML = "";
    filteredBooks.forEach(book => addBookCard(book));
}

function updateBookList() {
    document.getElementById("book_list").innerHTML = "";

    if (bookList.length === 0) {
        document.getElementById("book_list").innerHTML = "<p>No books added yet.</p>";
    } else {
        bookList.forEach(book => {
            addBookCard(book);
        });
    }
}

const filterTypeSelect = document.getElementById("filter_type");
const filterDiv = document.getElementById("filter_by");

let filterInput;

function createFilterInput(type) {
    if (filterInput) filterInput.remove();

    switch (type) {
        case "genre":
            filterInput = document.createElement("select");
            filterInput.id = "filter_input";
            genres.forEach(g => {
                const opt = document.createElement("option");
                opt.value = g; opt.textContent = g;
                filterInput.appendChild(opt);
            });
            break;
        case "watch_status":
            filterInput = document.createElement("select");
            filterInput.id = "filter_input";
            ["To Read", "In Progress", "Completed"].forEach(s => {
                const opt = document.createElement("option");
                opt.value = s; opt.textContent = s;
                filterInput.appendChild(opt);
            });
            break;
        case "rating":
            filterInput = document.createElement("input");
            filterInput.id = "filter_input";
            filterInput.type = "number";
            filterInput.min = 0;
            filterInput.max = 10;
            filterInput.placeholder = "Min rating";
            break;
    }

    filterDiv.appendChild(filterInput);
    filterInput.addEventListener("change", () => {
        filterBooks(filterTypeSelect.value, filterInput.value);
    });
}

function searchBooks(query, filterBy) {
    const q = query.trim().toLowerCase();
    if (!q) {
        renderFilteredBookList(bookList);
        return;
    }

    const filtered = bookList.filter(book => {
        if (filterBy === "title") {
            return book.title.toLowerCase().includes(q);
        } else if (filterBy === "author") {
            return book.author.toString().toLowerCase().includes(q);
        }
        return false;
    });

    renderFilteredBookList(filtered);
}

//function test() {
//bookList.push(createBook("A Game of Thrones", createAuthor("George", "Martin", "R. R.")));
//bookList.push(createBook("A Clash of Kings", createAuthor("George", "Martin", "R. R.")));
//console.log(authorList)
//}

function init() {
    //test();
    updateBookList();
    document.getElementById("add_button").addEventListener("click", openAddBookModal);
    document.getElementById("sort_type").addEventListener("change", (e) => {
        sortBooks(e.target.value);
    });

    document.getElementById("sort_reset").addEventListener("click", () => {
        document.getElementById("sort_type").value = "ascending_title";
        sortBooks("ascending_title");
    });

    createFilterInput(filterTypeSelect.value);

    filterTypeSelect.addEventListener("change", e => createFilterInput(e.target.value));
    document.getElementById("filter_reset").addEventListener("click", () => {
        if (filterInput) {
            if (filterInput.tagName === "SELECT") filterInput.selectedIndex = 0;
            else filterInput.value = "";
        }
        renderFilteredBookList(bookList);
    });

    const queryInput = document.getElementById("query");
    const searchFilterSelect = document.getElementById("search_filter");
    const searchResetBtn = document.getElementById("search_reset");

    queryInput.addEventListener("input", () => {
        searchBooks(queryInput.value, searchFilterSelect.value);
    });

    searchResetBtn.addEventListener("click", () => {
        queryInput.value = "";
        renderFilteredBookList(bookList); // show all
    });
}

init();