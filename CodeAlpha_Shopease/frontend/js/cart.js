// ============================================================
//  cart.js  –  Shopping cart page logic (cart.html)
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  auth.require(true); // redirect to login if not authenticated
  renderNavbar();
  loadCart();
});

// ── Load cart from API ────────────────────────────────────
async function loadCart() {
  const container = document.getElementById("cart-items");
  try {
    const { items, total } = await api.get("/cart");
    renderCart(items, total);
  } catch (err) {
    container.innerHTML = `<p class="error-text">${err.message}</p>`;
  }
}

// ── Render the full cart UI ───────────────────────────────
function renderCart(items, total) {
  const container = document.getElementById("cart-items");
  const heading = document.getElementById("cart-heading");
  const sumCount = document.getElementById("sum-count");
  const sumTotal = document.getElementById("sum-total");
  const checkBtn = document.getElementById("checkout-btn");

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  heading.textContent = `Your Cart (${totalQty} item${totalQty !== 1 ? "s" : ""})`;
  sumCount.textContent = `${totalQty} item${totalQty !== 1 ? "s" : ""}`;
  sumTotal.textContent = `₹${total.toFixed(2)}`;
  updateCartBadge(totalQty);

  if (!items.length) {
    checkBtn.disabled = true;
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🛒</span>
        <h3>Your cart is empty</h3>
        <p>Browse our store and add some items.</p>
        <a href="/index.html" class="btn btn-primary" style="margin-top:1rem">Shop Now</a>
      </div>`;
    return;
  }

  checkBtn.disabled = false;
  container.innerHTML = items
    .map(
      (item) => `
    <div class="cart-row" id="row-${item.cart_item_id}">
      <div class="cart-img">
        <img src="${item.image_url || ""}" alt="${item.name}" />
      </div>
      <div class="cart-info">
        <a href="/product.html?id=${item.product_id}" class="cart-name">${item.name}</a>
        <span class="cart-cat">${item.category}</span>
        <span class="cart-unit">₹${item.price.toFixed(2)} each</span>
      </div>
      <div class="cart-controls">
        <span class="row-total">₹${(item.price * item.quantity).toFixed(2)}</span>
        <div class="qty-wrap">
          <button class="qty-btn" onclick="changeQty(${item.cart_item_id}, ${item.quantity - 1})">−</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${item.cart_item_id}, ${item.quantity + 1})">+</button>
        </div>
        <button class="remove-btn" onclick="removeItem(${item.cart_item_id})">✕ Remove</button>
      </div>
    </div>`,
    )
    .join("");
}

// ── Change quantity of a cart item ────────────────────────
async function changeQty(cartItemId, newQty) {
  if (newQty < 1) {
    removeItem(cartItemId);
    return;
  }
  try {
    const { items, total } = await api.put(`/cart/${cartItemId}`, {
      quantity: newQty,
    });
    renderCart(items, total);
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── Remove one item from cart ─────────────────────────────
async function removeItem(cartItemId) {
  try {
    const { items, total } = await api.delete(`/cart/${cartItemId}`);
    renderCart(items, total);
    showToast("Item removed.");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── Clear entire cart ─────────────────────────────────────
async function clearCart() {
  if (!confirm("Remove all items from your cart?")) return;
  try {
    const { items, total } = await api.delete("/cart");
    renderCart(items, total);
    showToast("Cart cleared.");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── Go to checkout ────────────────────────────────────────
function goCheckout() {
  window.location.href = "/checkout.html";
}
