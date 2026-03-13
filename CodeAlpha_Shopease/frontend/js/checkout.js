// ============================================================
//  checkout.js  –  Checkout page logic (checkout.html)
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  auth.require(true);
  renderNavbar();
  loadOrderPreview();

  // Pre-fill user info
  const user = auth.getUser();
  if (user) {
    const [first = "", last = ""] = user.name.split(" ");
    setVal("fname", first);
    setVal("lname", last);
    setVal("email", user.email);
  }
});

// ── Load cart preview on right side ──────────────────────
async function loadOrderPreview() {
  try {
    const { items, total } = await api.get("/cart");

    if (!items.length) {
      window.location.href = "/cart.html";
      return;
    }

    document.getElementById("order-items").innerHTML = items
      .map(
        (i) => `
      <div class="preview-item">
        <div class="preview-img">
          <img src="${i.image_url || ""}" alt="${i.name}" />
        </div>
        <div class="preview-info">
          <span class="preview-name">${i.name}</span>
          <span class="preview-qty">Qty: ${i.quantity}</span>
        </div>
        <span class="preview-price">₹${(i.price * i.quantity).toFixed(2)}</span>
      </div>`,
      )
      .join("");

    document.getElementById("order-total").textContent = `₹${total.toFixed(2)}`;
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── Submit order ──────────────────────────────────────────
async function submitOrder() {
  const btn = document.getElementById("place-btn");

  // Basic shipping validation
  const address = getVal("address");
  const city = getVal("city");
  const postal = getVal("postal");

  if (!address || !city || !postal) {
    showToast("Please fill in all shipping fields.", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Placing order…";

  try {
    const { order } = await api.post("/orders", {}); // cart lives on server

    // Show success screen
    document.getElementById("checkout-form").style.display = "none";
    document.getElementById("success-box").style.display = "block";
    document.getElementById("success-order-id").textContent = `#${order.id}`;
    document.getElementById("success-total").textContent =
      `₹${order.total.toFixed(2)}`;
  } catch (err) {
    showToast(err.message, "error");
    btn.disabled = false;
    btn.textContent = "Place Order →";
  }
}

// ── Tiny helpers ──────────────────────────────────────────
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
