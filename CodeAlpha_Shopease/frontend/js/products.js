// ============================================================
//  products.js  –  Product listing page logic (index.html)
// ============================================================

let allProducts = [];
let activeCategory = "";
let searchQuery = "";

// ── Boot ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  renderNavbar();
  await Promise.all([loadCategories(), loadProducts()]);
});

// ── Load all products from API ────────────────────────────
async function loadProducts() {
  try {
    const { products } = await api.get("/products");
    allProducts = products;
    renderGrid();
  } catch (err) {
    document.getElementById("product-grid").innerHTML =
      `<p class="error-text">Failed to load products. Is the server running?</p>`;
  }
}

// ── Load categories and build filter chips ────────────────
async function loadCategories() {
  try {
    const { categories } = await api.get("/products/categories");
    const bar = document.getElementById("filter-bar");

    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "filter-chip";
      btn.textContent = cat;
      btn.dataset.cat = cat;
      btn.onclick = () => setCategory(cat);
      bar.appendChild(btn);
    });
  } catch (_) {}
}

// ── Set active category filter ────────────────────────────
function setCategory(cat) {
  activeCategory = activeCategory === cat ? "" : cat; // toggle off if same
  document.querySelectorAll(".filter-chip").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.cat === activeCategory);
  });
  document
    .querySelector('[data-cat="all"]')
    .classList.toggle("active", activeCategory === "");
  renderGrid();
}

// ── Search input handler ──────────────────────────────────
function handleSearch() {
  searchQuery = document
    .getElementById("search-input")
    .value.trim()
    .toLowerCase();
  renderGrid();
}

// ── Render filtered product cards ─────────────────────────
function renderGrid() {
  let items = allProducts;

  if (activeCategory) {
    items = items.filter((p) => p.category === activeCategory);
  }
  if (searchQuery) {
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.description?.toLowerCase().includes(searchQuery),
    );
  }

  const grid = document.getElementById("product-grid");
  document.getElementById("result-count").textContent =
    `${items.length} product${items.length !== 1 ? "s" : ""}`;

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <span class="empty-icon">🔍</span>
        <h3>No products found</h3>
        <p>Try a different search or category.</p>
      </div>`;
    return;
  }

  grid.innerHTML = items.map((p) => productCard(p)).join("");
}

// ── Build one product card HTML ───────────────────────────
function productCard(p) {
  const outOfStock = p.stock === 0;
  const lowStock = !outOfStock && p.stock < 5;

  const stockLabel = outOfStock
    ? "Out of stock"
    : lowStock
      ? `Only ${p.stock} left`
      : "In stock";
  const stockClass = outOfStock
    ? "badge-out"
    : lowStock
      ? "badge-low"
      : "badge-in";

  return `
    <div class="product-card" onclick="window.location='/product.html?id=${p.id}'">
      <div class="card-img">
        <img src="${p.image_url || "https://via.placeholder.com/400x300?text=No+Image"}"
             alt="${p.name}" loading="lazy" />
        <span class="badge-cat">${p.category}</span>
      </div>
      <div class="card-body">
        <h3 class="card-name">${p.name}</h3>
        <p class="card-desc">${p.description || ""}</p>
        <div class="card-footer">
          <div>
            <span class="price">₹${p.price.toFixed(2)}</span>
            <span class="stock-badge ${stockClass}">${stockLabel}</span>
          </div>
          <button
            class="btn-add"
            ${outOfStock ? "disabled" : ""}
            onclick="event.stopPropagation(); quickAdd(${p.id})">
            + Cart
          </button>
        </div>
      </div>
    </div>`;
}

// ── Quick-add to cart from listing page ───────────────────
async function quickAdd(productId) {
  if (!auth.isLoggedIn()) {
    showToast("Please log in to add items to cart.", "error");
    setTimeout(
      () => (window.location.href = "/login.html?redirect=index.html"),
      1200,
    );
    return;
  }
  try {
    const { items } = await api.post("/cart", { productId, quantity: 1 });
    updateCartBadge(items.reduce((s, i) => s + i.quantity, 0));
    showToast("Added to cart! 🛒", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}
