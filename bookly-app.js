let currentQuery = "";
let startIndex = 0;
const maxResults = 10;

const resultsDiv = document.getElementById("results");
const favoritesDiv = document.getElementById("favorites");

document.getElementById("getBooks").addEventListener("click", () => {
  const searchTerm = document.getElementById("searchTerm").value.trim();
  favoritesDiv.innerHTML = ""; // Clear favorites 
  resultsDiv.innerHTML = "";

  if (!searchTerm) {
    alert("Please enter a search term.");
    return;
  }

  currentQuery = searchTerm;
  startIndex = 0;
  fetchBooks(currentQuery, startIndex);
});

document.getElementById("viewFavorites").addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  favoritesDiv.innerHTML = "";
  showFavorites();
});

function fetchBooks(query, start) {
  // Remove Load More 
  removeLoadMoreButton();

  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}&startIndex=${start}&maxResults=${maxResults}`;

  return fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (!data.items || data.items.length === 0) {
        if (start === 0) {
          resultsDiv.innerHTML =
            "<p>No results found. Try a different search.</p>";
        }
        // No results
        return;
      }

      data.items.forEach((item) => {
        const book = item.volumeInfo;
        const thumbnail = book.imageLinks
          ? book.imageLinks.thumbnail
          : "https://via.placeholder.com/100x150?text=No+Cover";
        const title = book.title || "No title";
        const authors = book.authors ? book.authors.join(", ") : "Unknown author";
        const description = book.description
          ? book.description.substring(0, 150) + "..."
          : "No description available";

        const bookJsonSafe = JSON.stringify(book).replace(/'/g, "&apos;");

        const bookHTML = `
          <div class="book">
            <img src="${thumbnail}" alt="Book cover" />
            <div class="book-info">
              <h3>${title}</h3>
              <p><em>${authors}</em></p>
              <p>${description}</p>
              <button class="fav-btn" data-book='${bookJsonSafe}'>❤️ Save</button>
            </div>
          </div>
        `;
        resultsDiv.insertAdjacentHTML("beforeend", bookHTML);
      });

      // Add Load More
      if (start + maxResults < (data.totalItems || 0)) {
        addLoadMoreButton();
      } else {
        removeLoadMoreButton();
      }

      attachFavoriteListeners();
    })
    .catch((error) => {
      resultsDiv.innerHTML = `<p style="color:red;">Error fetching books: ${error.message}</p>`;
      removeLoadMoreButton();
    });
}


function addLoadMoreButton() {
  if (!document.getElementById("loadMoreBtn")) {
    const btn = document.createElement("button");
    btn.id = "loadMoreBtn";
    btn.textContent = "Load More";
    btn.style.marginTop = "20px";
    btn.style.display = "block";
    btn.style.marginLeft = "auto";
    btn.style.marginRight = "auto";
    resultsDiv.appendChild(btn);

    btn.addEventListener("click", () => {
      btn.disabled = true;
      btn.textContent = "Loading...";

      startIndex += maxResults;
      fetchBooks(currentQuery, startIndex)
        .then(() => {
          btn.disabled = false;
          btn.textContent = "Load More";
        })
        .catch(() => {
          btn.disabled = false;
          btn.textContent = "Load More";
        });
    });
  }
}


function removeLoadMoreButton() {
  const btn = document.getElementById("loadMoreBtn");
  if (btn) btn.remove();
}

function attachFavoriteListeners() {
  document.querySelectorAll(".fav-btn").forEach((btn) => {
    if (!btn.dataset.listenerAdded) {
      btn.addEventListener("click", () => {
        const bookData = JSON.parse(btn.getAttribute("data-book"));
        saveFavorite(bookData);
        btn.textContent = "✅ Saved";
        btn.disabled = true;
      });
      btn.dataset.listenerAdded = "true";
    }
  });
}

function saveFavorite(book) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.some((fav) => fav.title === book.title)) {
    alert("This book is already in your favorites!");
    return;
  }

  favorites.push(book);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert(`Saved "${book.title}" to favorites!`);
}

function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    favoritesDiv.innerHTML = "<p>You have no favorite books saved yet.</p>";
    return;
  }

  favoritesDiv.innerHTML = "<h2>Your Favorites</h2>";

  favorites.forEach((book) => {
    const thumbnail = book.imageLinks
      ? book.imageLinks.thumbnail
      : "https://via.placeholder.com/100x150?text=No+Cover";
    const title = book.title || "No title";
    const authors = book.authors ? book.authors.join(", ") : "Unknown author";
    const description = book.description
      ? book.description.substring(0, 150) + "..."
      : "No description available";

    const bookHTML = `
      <div class="book">
        <img src="${thumbnail}" alt="Book cover" />
        <div class="book-info">
          <h3>${title}</h3>
          <p><em>${authors}</em></p>
          <p>${description}</p>
        </div>
      </div>
    `;
    favoritesDiv.insertAdjacentHTML("beforeend", bookHTML);
  });
}
