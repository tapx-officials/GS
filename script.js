/* =========================================================
   GULSHIP — COMPLETE APP
   LUXURY GOLDEN × PREMIUM BLACK
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzx4OxZR_OgYIIO6IAWt6Eg1Q7Qe5OxHi0H6UmAi6thSFweJ67JwvXDA-bDHGjm71es/exec";

const UPI_ID = "8384019015@fam";

const RECEIVER_NAME = "GULSHIP";

/*
   DEMO PAYMENT

   1 item  = ₹2
   2 items = ₹4
   3 items = ₹6
*/

const DEMO_PAYMENT_PER_ITEM = 2;


/*
   ACTUAL PRODUCTION PREPAYMENT

   ₹99 per item
*/

const PRODUCTION_PREPAYMENT_PER_ITEM = 99;


/* =========================================================
   PRODUCTS
========================================================= */

const PRODUCTS = [

  {
    id: "gulship-rayban",
    name: "Metal AI Rayban Glasses",
    category: "Glasses",
    price: 1099,
    image: "rayban.png",

    description:
      "Premium metal-frame smart-style glasses designed for a modern and sophisticated everyday look.",

    features: [
      "Premium metal frame",
      "Modern Rayban-inspired design",
      "Lightweight everyday construction",
      "Premium finish",
      "Comfortable fit"
    ]
  },

  {
    id: "gulship-earbuds",
    name: "Earbuds Pro 2nd Generation",
    category: "Earbuds",
    price: 499,
    image: "earbuds.png",

    description:
      "Compact wireless earbuds with a clean premium design for everyday music, calls and entertainment.",

    features: [
      "Wireless connectivity",
      "Compact charging case",
      "Premium compact design",
      "Everyday listening",
      "Comfortable fit"
    ]
  }

];


/* =========================================================
   STATE
========================================================= */

let cart = loadCart();

let orders = loadOrders();

let selectedProduct = null;

let checkoutOrder = null;

let currentScreen = "homeScreen";

let currentCategory = "All";

let priceAscending = true;


/* =========================================================
   DOM
========================================================= */

const $ = (id) =>
  document.getElementById(id);


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  setupHistory();

  renderProducts();

  renderCart();

  renderOrders();

  updateBadges();

  setupEvents();

  setTimeout(() => {

    $("appLoader")?.classList.add("hidden");

  }, 700);

  refreshOrdersFromSheet();

});


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

  document.addEventListener("click", (event) => {

    const screenButton =
      event.target.closest("[data-screen]");

    if (
      screenButton &&
      !screenButton.closest(".bottom-nav")
    ) {

      const screen =
        screenButton.dataset.screen;

      showScreen(screen);

      return;
    }


    const navButton =
      event.target.closest(".nav-item[data-screen]");

    if (navButton) {

      showScreen(
        navButton.dataset.screen
      );

      return;
    }


    const cartButton =
      event.target.closest("[data-open-cart]");

    if (cartButton) {

      showScreen("cartScreen");

      return;
    }


    const backButton =
      event.target.closest("[data-back]");

    if (backButton) {

      goBack();

      return;
    }


    const category =
      event.target.closest("[data-category]");

    if (category) {

      currentCategory =
        category.dataset.category;

      document
        .querySelectorAll(".category-chip")
        .forEach(btn => {

          btn.classList.toggle(
            "active",
            btn.dataset.category === currentCategory
          );

        });

      renderProducts();

      return;
    }


    const productCard =
      event.target.closest("[data-product-id]");

    if (
      productCard &&
      !event.target.closest(".add-product-btn")
    ) {

      openProduct(
        productCard.dataset.productId
      );

      return;
    }


    const addButton =
      event.target.closest(".add-product-btn");

    if (addButton) {

      addToCart(
        addButton.dataset.productId
      );

      return;
    }


    const quantityButton =
      event.target.closest("[data-qty-action]");

    if (quantityButton) {

      const productId =
        quantityButton.dataset.productId;

      const action =
        quantityButton.dataset.qtyAction;

      changeQuantity(
        productId,
        action
      );

      return;
    }


    const removeButton =
      event.target.closest("[data-remove-cart]");

    if (removeButton) {

      removeFromCart(
        removeButton.dataset.removeCart
      );

      return;
    }


    const detailsButton =
      event.target.closest("[data-order-id]");

    if (detailsButton) {

      openOrderDetails(
        detailsButton.dataset.orderId
      );

      return;
    }


    const detailAdd =
      event.target.closest("[data-detail-add]");

    if (detailAdd) {

      const productId =
        detailAdd.dataset.detailAdd;

      addProductFromDetails(productId);

      return;
    }


    const detailMinus =
      event.target.closest("[data-detail-minus]");

    if (detailMinus) {

      updateDetailQuantity(-1);

      return;
    }


    const detailPlus =
      event.target.closest("[data-detail-plus]");

    if (detailPlus) {

      updateDetailQuantity(1);

      return;
    }

  });


  /* SEARCH */

  $("searchButton")?.addEventListener(
    "click",
    () => {

      showScreen("searchScreen");

      setTimeout(() => {

        $("searchInput")?.focus();

      }, 150);

    }
  );


  $("searchInput")?.addEventListener(
    "input",
    renderSearchResults
  );


  $("clearSearch")?.addEventListener(
    "click",
    () => {

      $("searchInput").value = "";

      renderSearchResults();

      $("searchInput").focus();

    }
  );


  $("sortPriceButton")?.addEventListener(
    "click",
    () => {

      priceAscending =
        !priceAscending;

      renderSearchResults();

      $("sortPriceButton").classList.toggle(
        "active",
        !priceAscending
      );

    }
  );


  $("shopNowButton")?.addEventListener(
    "click",
    () => {

      document
        .querySelector(".products-section")
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }
  );


  /* CHECKOUT */

  $("checkoutForm")?.addEventListener(
    "submit",
    handleCheckout
  );


  /* ANDROID BACK */

  window.addEventListener(
    "popstate",
    handlePopState
  );

}


/* =========================================================
   HISTORY
========================================================= */

function setupHistory() {

  history.replaceState(
    {
      gulship: true,
      screen: "homeScreen",
      base: true
    },
    "",
    location.href
  );

  history.pushState(
    {
      gulship: true,
      screen: "homeScreen",
      guard: true
    },
    "",
    location.href
  );

}


function showScreen(
  screenId,
  options = {}
) {

  if (!document.getElementById(screenId)) {
    return;
  }


  currentScreen = screenId;


  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.classList.toggle(
        "active",
        screen.id === screenId
      );

    });


  updateNavigation(screenId);


  const bottomNav =
    $("bottomNav");

  if (bottomNav) {

    const hideNav =
      screenId === "productDetailsScreen" ||
      screenId === "checkoutScreen" ||
      screenId === "paymentScreen" ||
      screenId === "orderDetailsScreen" ||
      screenId === "searchScreen";

    bottomNav.classList.toggle(
      "hidden",
      hideNav
    );

  }


  window.scrollTo({
    top: 0,
    behavior: "instant"
  });


  if (
    options.push !== false
  ) {

    history.pushState(
      {
        gulship: true,
        screen: screenId
      },
      "",
      location.href
    );

  }


  if (screenId === "cartScreen") {
    renderCart();
  }

  if (screenId === "ordersScreen") {
    renderOrders();
  }

}


function updateNavigation(
  screenId
) {

  const map = {
    homeScreen: "home",
    cartScreen: "cart",
    ordersScreen: "orders"
  };

  const active =
    map[screenId] || "";

  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.nav === active
      );

    });

}


function handlePopState(event) {

  const state =
    event.state;


  if (
    state &&
    state.gulship
  ) {

    showScreen(
      state.screen || "homeScreen",
      {
        push: false
      }
    );

    return;
  }


  history.pushState(
    {
      gulship: true,
      screen: currentScreen,
      guard: true
    },
    "",
    location.href
  );

  showScreen(
    currentScreen,
    {
      push: false
    }
  );

}


function goBack() {

  if (currentScreen === "homeScreen") {

    return;
  }

  history.back();

}


/* =========================================================
   PRODUCT RENDER
========================================================= */

function renderProducts() {

  const container =
    $("productsGrid");

  if (!container) {
    return;
  }


  let products =
    PRODUCTS.filter(product => {

      if (currentCategory === "All") {
        return true;
      }

      return product.category === currentCategory;

    });


  container.innerHTML =
    products
      .map(productCardHTML)
      .join("");

}


function productCardHTML(product) {

  return `
    <article
      class="product-card"
      data-product-id="${product.id}"
    >

      <div class="product-image">

        <img
          src="${product.image}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
        >

      </div>

      <div class="product-info">

        <div class="product-name">
          ${escapeHTML(product.name)}
        </div>

        <div class="product-price">
          ₹${formatNumber(product.price)}
        </div>

        <div class="product-category">
          ${escapeHTML(product.category)}
        </div>

      </div>

      <button
        class="add-product-btn"
        data-product-id="${product.id}"
        aria-label="Add to cart"
      >
        <i class="fa-solid fa-plus"></i>
      </button>

    </article>
  `;

}


/* =========================================================
   SEARCH
========================================================= */

function renderSearchResults() {

  const container =
    $("searchResults");

  if (!container) {
    return;
  }


  const input =
    $("searchInput")?.value
      .trim()
      .toLowerCase() || "";


  let results =
    PRODUCTS.filter(product => {

      const matchesText =
        !input ||
        product.name
          .toLowerCase()
          .includes(input) ||
        product.category
          .toLowerCase()
          .includes(input);

      const matchesCategory =
        currentCategory === "All" ||
        product.category === currentCategory;

      return matchesText &&
        matchesCategory;

    });


  results.sort(
    (a, b) =>
      priceAscending
        ? a.price - b.price
        : b.price - a.price
  );


  if (!results.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          <i class="fa-solid fa-magnifying-glass"></i>
        </div>

        <h3>No Products Found</h3>

        <p>
          Try another product name or category.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    results
      .map(productCardHTML)
      .join("");

}


/* =========================================================
   PRODUCT DETAILS
========================================================= */

function openProduct(productId) {

  const product =
    getProduct(productId);

  if (!product) {
    return;
  }


  selectedProduct = product;

  const quantity =
    getCartQuantity(productId) || 1;


  $("productDetailsContent").innerHTML = `

    <div class="product-detail-image">

      <img
        src="${product.image}"
        alt="${escapeHTML(product.name)}"
      >

    </div>

    <div class="detail-category">
      ${escapeHTML(product.category)}
    </div>

    <h1 class="detail-title">
      ${escapeHTML(product.name)}
    </h1>

    <div class="detail-price">
      ₹${formatNumber(product.price)}
    </div>

    <p class="detail-description">
      ${escapeHTML(product.description)}
    </p>

    <h2 class="features-title">
      Features
    </h2>

    <div class="features-list">

      ${product.features.map(feature => `
        <div class="feature-item">
          <i class="fa-solid fa-check"></i>
          <span>${escapeHTML(feature)}</span>
        </div>
      `).join("")}

    </div>

    <div class="detail-buy-box">

      <div class="detail-quantity-row">

        <span>Quantity</span>

        <div class="quantity-control">

          <button data-detail-minus>
            <i class="fa-solid fa-minus"></i>
          </button>

          <span id="detailQuantity">
            ${quantity}
          </span>

          <button data-detail-plus>
            <i class="fa-solid fa-plus"></i>
          </button>

        </div>

      </div>

      <button
        class="gold-btn full-btn"
        data-detail-add="${product.id}"
      >
        Add to Cart
        <i class="fa-solid fa-bag-shopping"></i>
      </button>

      <div class="prepayment-card">

        <strong>
          ₹99 Pre-Payment
        </strong>

        <p>
          A ₹99 production pre-payment is applicable
          per item. For this demo, the actual UPI payment
          amount is ₹2 per item.
        </p>

      </div>

    </div>
  `;


  showScreen(
    "productDetailsScreen"
  );

}


function updateDetailQuantity(
  change
) {

  if (!selectedProduct) {
    return;
  }


  let quantity =
    getCartQuantity(
      selectedProduct.id
    ) || 1;


  quantity += change;


  if (quantity < 1) {
    quantity = 1;
  }


  if (quantity > 99) {
    quantity = 99;
  }


  const quantityElement =
    $("detailQuantity");

  if (quantityElement) {
    quantityElement.textContent =
      quantity;
  }

}


function addProductFromDetails(
  productId
) {

  const product =
    getProduct(productId);

  if (!product) {
    return;
  }


  let quantity =
    Number(
      $("detailQuantity")?.textContent || 1
    );


  const existing =
    cart.find(
      item => item.id === productId
    );


  if (existing) {

    existing.qty += quantity;

  } else {

    cart.push({
      id: productId,
      qty: quantity
    });

  }


  saveCart();

  updateBadges();

  showToast(
    "Added to cart"
  );

}


/* =========================================================
   CART
========================================================= */

function addToCart(productId) {

  const existing =
    cart.find(
      item => item.id === productId
    );


  if (existing) {

    existing.qty++;

  } else {

    cart.push({
      id: productId,
      qty: 1
    });

  }


  saveCart();

  updateBadges();

  renderCart();

  showToast(
    "Added to cart"
  );

}


function changeQuantity(
  productId,
  action
) {

  const item =
    cart.find(
      item => item.id === productId
    );

  if (!item) {
    return;
  }


  if (action === "plus") {

    item.qty++;

  } else if (action === "minus") {

    item.qty--;

  }


  if (item.qty <= 0) {

    cart =
      cart.filter(
        item => item.id !== productId
      );

  }


  saveCart();

  updateBadges();

  renderCart();

}


function removeFromCart(
  productId
) {

  cart =
    cart.filter(
      item => item.id !== productId
    );

  saveCart();

  updateBadges();

  renderCart();

  showToast(
    "Removed from cart"
  );

}


function renderCart() {

  const container =
    $("cartContent");

  if (!container) {
    return;
  }


  if (!cart.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          <i class="fa-solid fa-bag-shopping"></i>
        </div>

        <h3>Your Cart is Empty</h3>

        <p>
          Add something premium to your collection.
        </p>

        <button
          class="gold-btn"
          data-screen="homeScreen"
        >
          Start Shopping
        </button>

      </div>
    `;

    return;
  }


  let subtotal = 0;

  let totalQuantity = 0;


  const itemsHTML =
    cart.map(item => {

      const product =
        getProduct(item.id);

      if (!product) {
        return "";
      }


      subtotal +=
        product.price * item.qty;

      totalQuantity +=
        item.qty;


      return `

        <div class="cart-item">

          <div class="cart-item-image">

            <img
              src="${product.image}"
              alt="${escapeHTML(product.name)}"
            >

          </div>

          <div class="cart-item-main">

            <div class="cart-item-name">
              ${escapeHTML(product.name)}
            </div>

            <div class="cart-item-price">
              ₹${formatNumber(product.price)}
            </div>

            <div class="cart-controls">

              <div class="quantity-control">

                <button
                  data-qty-action="minus"
                  data-product-id="${product.id}"
                >
                  <i class="fa-solid fa-minus"></i>
                </button>

                <span>
                  ${item.qty}
                </span>

                <button
                  data-qty-action="plus"
                  data-product-id="${product.id}"
                >
                  <i class="fa-solid fa-plus"></i>
                </button>

              </div>

              <button
                class="remove-btn"
                data-remove-cart="${product.id}"
              >
                Remove
              </button>

            </div>

          </div>

        </div>

      `;

    }).join("");


  const deliveryFee =
    totalQuantity * 2;

  const demoPrepaid =
    totalQuantity * DEMO_PAYMENT_PER_ITEM;

  const total =
    subtotal + deliveryFee;


  container.innerHTML = `

    <div class="cart-list">
      ${itemsHTML}
    </div>

    <div class="cart-summary">

      <div class="summary-row">
        <span>Products</span>
        <strong>
          ₹${formatNumber(subtotal)}
        </strong>
      </div>

      <div class="summary-row">
        <span>Delivery</span>
        <strong>
          ₹${formatNumber(deliveryFee)}
        </strong>
      </div>

      <div class="summary-row total">
        <span>Total</span>
        <strong>
          ₹${formatNumber(total)}
        </strong>
      </div>

      <div class="prepayment-note">

        <strong>
          Pre-payment
        </strong>

        <br>

        Production pre-payment:
        ₹${PRODUCTION_PREPAYMENT_PER_ITEM}
        × ${totalQuantity}
        =
        ₹${formatNumber(
          PRODUCTION_PREPAYMENT_PER_ITEM *
          totalQuantity
        )}

        <br><br>

        Demo UPI amount:
        ₹${DEMO_PAYMENT_PER_ITEM}
        × ${totalQuantity}
        =
        ₹${formatNumber(demoPrepaid)}

      </div>

      <button
        class="gold-btn full-btn"
        id="proceedCheckoutButton"
      >
        Proceed to Checkout
        <i class="fa-solid fa-arrow-right"></i>
      </button>

    </div>

  `;


  $("proceedCheckoutButton")
    ?.addEventListener(
      "click",
      openCheckout
    );

}


/* =========================================================
   CHECKOUT
========================================================= */

function openCheckout() {

  if (!cart.length) {

    showToast(
      "Your cart is empty"
    );

    return;
  }


  const orderId =
    generateOrderId();


  checkoutOrder = {
    orderId
  };


  $("checkoutOrderId").textContent =
    orderId;


  renderCheckoutSummary();


  showScreen(
    "checkoutScreen"
  );

}


function renderCheckoutSummary() {

  if (!checkoutOrder) {
    return;
  }


  let subtotal = 0;

  let quantity = 0;


  cart.forEach(item => {

    const product =
      getProduct(item.id);

    if (!product) {
      return;
    }


    subtotal +=
      product.price * item.qty;

    quantity +=
      item.qty;

  });


  const delivery =
    quantity * 2;

  const total =
    subtotal + delivery;


  const demoPayment =
    quantity * DEMO_PAYMENT_PER_ITEM;


  const summary =
    $("checkoutSummary");


  if (!summary) {
    return;
  }


  summary.innerHTML = `

    <div class="checkout-summary">

      <div class="summary-row">
        <span>Items</span>
        <strong>${quantity}</strong>
      </div>

      <div class="summary-row">
        <span>Products</span>
        <strong>
          ₹${formatNumber(subtotal)}
        </strong>
      </div>

      <div class="summary-row">
        <span>Delivery</span>
        <strong>
          ₹${formatNumber(delivery)}
        </strong>
      </div>

      <div class="summary-row total">
        <span>Order Total</span>
        <strong>
          ₹${formatNumber(total)}
        </strong>
      </div>

      <div class="prepayment-note">

        Payment screen:
        <strong>₹99 Pre-Payment</strong>

        <br>

        Demo UPI payment:
        ₹${formatNumber(demoPayment)}

      </div>

    </div>

  `;

}


/* =========================================================
   HANDLE CHECKOUT
========================================================= */

function handleCheckout(event) {

  event.preventDefault();


  if (!cart.length) {

    showToast(
      "Your cart is empty"
    );

    return;
  }


  const name =
    $("customerName").value.trim();

  const phone =
    $("customerPhone").value.trim();

  const address =
    $("customerAddress").value.trim();

  const city =
    $("customerCity").value.trim();

  const pincode =
    $("customerPincode").value.trim();


  if (!/^\d{10}$/.test(phone)) {

    showToast(
      "Enter a valid 10 digit phone number"
    );

    return;
  }


  if (!/^\d{6}$/.test(pincode)) {

    showToast(
      "Enter a valid 6 digit pincode"
    );

    return;
  }


  if (!checkoutOrder) {

    checkoutOrder = {
      orderId: generateOrderId()
    };

  }


  let quantity = 0;

  let subtotal = 0;


  const items =
    cart.map(item => {

      const product =
        getProduct(item.id);

      if (!product) {
        return null;
      }


      quantity +=
        item.qty;

      subtotal +=
        product.price * item.qty;


      return {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        qty: item.qty
      };

    }).filter(Boolean);


  const delivery =
    quantity * 2;

  const total =
    subtotal + delivery;


  const demoPrepaid =
    quantity * DEMO_PAYMENT_PER_ITEM;


  checkoutOrder = {

    ...checkoutOrder,

    date: new Date().toISOString(),

    customerName: name,
    phone,
    address,
    city,
    pincode,

    items,

    subtotal,
    delivery,
    amount: total,

    prepaid: demoPrepaid,

    paymentStatus:
      "Verification Pending",

    orderStatus:
      "Order Placed",

    lastUpdated:
      new Date().toISOString()

  };


  renderPayment();


  showScreen(
    "paymentScreen"
  );

}


/* =========================================================
   PAYMENT
========================================================= */

function renderPayment() {

  const container =
    $("paymentContent");

  if (!container || !checkoutOrder) {
    return;
  }


  const quantity =
    checkoutOrder.items.reduce(
      (sum, item) =>
        sum + Number(item.qty),
      0
    );


  const demoAmount =
    quantity * DEMO_PAYMENT_PER_ITEM;


  const productionAmount =
    quantity *
    PRODUCTION_PREPAYMENT_PER_ITEM;


  container.innerHTML = `

    <div class="payment-card">

      <div class="payment-icon">

        <i class="fa-solid fa-shield-halved"></i>

      </div>

      <h2>
        ₹99 Pre-Payment
      </h2>

      <div class="payment-amount">
        ₹${formatNumber(demoAmount)}
      </div>

      <div class="payment-demo">

        Demo payment:
        ₹${DEMO_PAYMENT_PER_ITEM}
        × ${quantity} item(s)

        <br><br>

        Production pre-payment:
        ₹${PRODUCTION_PREPAYMENT_PER_ITEM}
        × ${quantity}
        =
        ₹${formatNumber(productionAmount)}

      </div>

      <button
        id="payWithUpi"
        class="upi-btn"
      >
        <i class="fa-solid fa-indian-rupee-sign"></i>
        Pay With UPI
      </button>

      <div class="verification-card">

        <strong>
          Payment Verification Under Process
        </strong>

        <br>

        Returning from your UPI app does not itself
        confirm successful payment. Your order will
        remain under verification until payment is verified.

      </div>

    </div>

  `;


  $("payWithUpi")
    ?.addEventListener(
      "click",
      handlePayment
    );

}


/* =========================================================
   PAYMENT HANDLER
========================================================= */

async function handlePayment() {

  if (!checkoutOrder) {
    return;
  }


  const button =
    $("payWithUpi");


  if (button) {

    button.disabled = true;

    button.innerHTML =
      `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Creating Order...
      `;

  }


  /*
     IMPORTANT:
     Save order to Google Sheets BEFORE
     opening UPI.
  */

  try {

    await sendOrderToGoogleSheets(
      checkoutOrder
    );


    saveOrderLocally(
      checkoutOrder
    );


    /*
       Only clear cart after
       Google Sheets accepted order.
    */

    cart = [];

    saveCart();

    updateBadges();


    if (button) {

      button.disabled = false;

      button.innerHTML =
        `
          <i class="fa-solid fa-indian-rupee-sign"></i>
          Pay With UPI
        `;

    }


    showScreen(
  "ordersScreen"
);

setTimeout(() => {
  
  openUPI(
    checkoutOrder
  );
  
}, 150);

showToast(
  "Order created. Complete payment in UPI."
);

  } catch (error) {

    console.error(error);


    if (button) {

      button.disabled = false;

      button.innerHTML =
        `
          <i class="fa-solid fa-indian-rupee-sign"></i>
          Pay With UPI
        `;

    }


    showToast(
      "Order could not be saved. Please try again."
    );

  }

}


/* =========================================================
   UPI
========================================================= */

function openUPI(order) {
  
  const quantity =
    order.items.reduce(
      (sum, item) =>
      sum + Number(item.qty),
      0
    );
  
  const amount =
    quantity * DEMO_PAYMENT_PER_ITEM;
  
  const upiURL =
    "upi://pay" +
    "?pa=" + encodeURIComponent("8384019015@fam") +
    "&pn=" + encodeURIComponent("GULSHIP") +
    "&am=" + encodeURIComponent(amount.toFixed(2)) +
    "&cu=INR" +
    "&tn=" + encodeURIComponent(
      "GULSHIP Order " + order.orderId
    );
  
  window.location.href = upiURL;
}


/* =========================================================
   ORDERS
========================================================= */

function saveOrderLocally(order) {

  const existingIndex =
    orders.findIndex(
      item =>
        item.orderId === order.orderId
    );


  if (existingIndex >= 0) {

    orders[existingIndex] =
      order;

  } else {

    orders.unshift(order);

  }


  localStorage.setItem(
    "gulship_orders",
    JSON.stringify(orders)
  );


  renderOrders();

}


function renderOrders() {

  const container =
    $("ordersContent");

  if (!container) {
    return;
  }


  if (!orders.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          <i class="fa-solid fa-box-open"></i>
        </div>

        <h3>No Orders Yet</h3>

        <p>
          Your orders will appear here after checkout.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML = `

    <div class="orders-list">

      ${orders.map(order => {

        const statusClass =
          getStatusClass(
            order.orderStatus
          );


        return `

          <article class="order-card">

            <div class="order-card-top">

              <div>

                <div class="order-id">
                  ${escapeHTML(order.orderId)}
                </div>

                <div class="order-date">
                  ${formatDate(order.date)}
                </div>

              </div>

              <span
                class="status-pill ${statusClass}"
              >
                ${escapeHTML(
                  order.orderStatus ||
                  "Order Placed"
                )}
              </span>

            </div>


            <div class="payment-pending">

              <i class="fa-solid fa-clock"></i>

              ${escapeHTML(
                order.paymentStatus ||
                "Verification Pending"
              )}

            </div>


            <div class="order-card-bottom">

              <strong>
                ₹${formatNumber(
                  order.amount || 0
                )}
              </strong>

              <button
                class="view-order-btn"
                data-order-id="${escapeHTML(
                  order.orderId
                )}"
              >
                View Details
                <i class="fa-solid fa-arrow-right"></i>
              </button>

            </div>

          </article>

        `;

      }).join("")}

    </div>

  `;

}


/* =========================================================
   ORDER DETAILS
========================================================= */

function openOrderDetails(
  orderId
) {

  const order =
    orders.find(
      item =>
        item.orderId === orderId
    );


  if (!order) {
    return;
  }


  const container =
    $("orderDetailsContent");


  const statusClass =
    getStatusClass(
      order.orderStatus
    );


  container.innerHTML = `

    <div class="order-detail-card">

      <div class="detail-status-card">

        <div class="status-title">
          ORDER STATUS
        </div>

        <div class="status-main">
          ${escapeHTML(
            order.orderStatus ||
            "Order Placed"
          )}
        </div>

        <div class="status-pill ${statusClass}">
          ${escapeHTML(
            order.paymentStatus ||
            "Verification Pending"
          )}
        </div>

      </div>


      <div class="order-id-card">

        <div>
          <span>ORDER ID</span>

          <strong>
            ${escapeHTML(order.orderId)}
          </strong>
        </div>

        <i class="fa-solid fa-box"></i>

      </div>


      <div class="order-product-list">

        ${order.items.map(item => `

          <div class="order-product-row">

            <img
              src="${item.image}"
              alt="${escapeHTML(item.name)}"
            >

            <div>

              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <span>
                Qty: ${item.qty}
              </span>

            </div>

            <b>
              ₹${formatNumber(
                item.price * item.qty
              )}
            </b>

          </div>

        `).join("")}

      </div>


      <div class="cart-summary">

        <div class="summary-row">
          <span>Products</span>
          <strong>
            ₹${formatNumber(
              order.subtotal || 0
            )}
          </strong>
        </div>

        <div class="summary-row">
          <span>Delivery</span>
          <strong>
            ₹${formatNumber(
              order.delivery || 0
            )}
          </strong>
        </div>

        <div class="summary-row">
          <span>Prepaid</span>
          <strong>
            ₹${formatNumber(
              order.prepaid || 0
            )}
          </strong>
        </div>

        <div class="summary-row total">
          <span>Total</span>
          <strong>
            ₹${formatNumber(
              order.amount || 0
            )}
          </strong>
        </div>

      </div>


      <div class="prepayment-card">

        <strong>
          Delivery Details
        </strong>

        <p>
          ${escapeHTML(order.customerName)}
          <br>
          ${escapeHTML(order.phone)}
          <br><br>
          ${escapeHTML(order.address)}
          <br>
          ${escapeHTML(order.city)}
          -
          ${escapeHTML(order.pincode)}
        </p>

      </div>

    </div>

  `;


  showScreen(
    "orderDetailsScreen"
  );

}


/* =========================================================
   GOOGLE SHEETS — JSONP CREATE
========================================================= */

function sendOrderToGoogleSheets(
  order
) {

  return new Promise(
    (resolve, reject) => {

      const callbackName =
        "gulshipOrder_" +
        Date.now() +
        "_" +
        Math.floor(
          Math.random() * 100000
        );


      const payload = {

        orderId:
          order.orderId,

        date:
          order.date,

        customerName:
          order.customerName,

        phone:
          order.phone,

        address:
          order.address,

        city:
          order.city,

        pincode:
          order.pincode,

        items:
          order.items,

        amount:
          order.amount,

        prepaid:
          order.prepaid,

        paymentStatus:
          order.paymentStatus,

        orderStatus:
          order.orderStatus,

        lastUpdated:
          order.lastUpdated

      };


      const script =
        document.createElement(
          "script"
        );


      let finished = false;


      const cleanup = () => {

        if (script.parentNode) {

          script.parentNode.removeChild(
            script
          );

        }


        try {

          delete window[
            callbackName
          ];

        } catch (error) {

          window[
            callbackName
          ] = undefined;

        }

      };


      const finishSuccess =
        response => {

          if (finished) {
            return;
          }

          finished = true;

          cleanup();

          if (
            response &&
            response.ok
          ) {

            resolve(response);

          } else {

            reject(
              new Error(
                response?.error ||
                "Google Sheets rejected order"
              )
            );

          }

        };


      const timeout =
        setTimeout(
          () => {

            if (finished) {
              return;
            }

            finished = true;

            cleanup();

            reject(
              new Error(
                "Google Sheets request timed out"
              )
            );

          },
          12000
        );


      window[
        callbackName
      ] = response => {

        clearTimeout(timeout);

        finishSuccess(response);

      };


      const url =
        APPS_SCRIPT_URL +
        "?action=createOrder" +
        "&data=" +
        encodeURIComponent(
          JSON.stringify(payload)
        ) +
        "&callback=" +
        encodeURIComponent(
          callbackName
        ) +
        "&t=" +
        Date.now();


      script.src = url;

      script.async = true;


      script.onerror = () => {

        clearTimeout(timeout);

        if (finished) {
          return;
        }

        finished = true;

        cleanup();

        reject(
          new Error(
            "Could not connect to Google Sheets"
          )
        );

      };


      document.body.appendChild(
        script
      );

    }
  );

}


/* =========================================================
   GOOGLE SHEETS — JSONP READ
========================================================= */

function fetchOrderFromSheet(
  orderId
) {

  return new Promise(
    resolve => {

      const callbackName =
        "gulshipRead_" +
        Date.now() +
        "_" +
        Math.floor(
          Math.random() * 100000
        );


      const script =
        document.createElement(
          "script"
        );


      let finished = false;


      const cleanup = () => {

        if (script.parentNode) {

          script.parentNode.removeChild(
            script
          );

        }


        try {

          delete window[
            callbackName
          ];

        } catch (error) {

          window[
            callbackName
          ] = undefined;

        }

      };


      const finish = data => {

        if (finished) {
          return;
        }

        finished = true;

        cleanup();

        resolve(data);

      };


      const timeout =
        setTimeout(
          () => finish(null),
          10000
        );


      window[
        callbackName
      ] = response => {

        clearTimeout(timeout);

        finish(response);

      };


      const url =
        APPS_SCRIPT_URL +
        "?action=getOrder" +
        "&orderId=" +
        encodeURIComponent(orderId) +
        "&callback=" +
        encodeURIComponent(callbackName) +
        "&t=" +
        Date.now();


      script.src = url;

      script.async = true;


      script.onerror = () => {

        clearTimeout(timeout);

        finish(null);

      };


      document.body.appendChild(
        script
      );

    }
  );

}


/* =========================================================
   REFRESH ORDERS
========================================================= */

async function refreshOrdersFromSheet() {

  if (!orders.length) {
    return;
  }


  for (
    const localOrder of orders
  ) {

    try {

      const sheetOrder =
        await fetchOrderFromSheet(
          localOrder.orderId
        );


      if (
        !sheetOrder ||
        !sheetOrder.ok ||
        !sheetOrder.order
      ) {

        continue;

      }


      localOrder.paymentStatus =
        sheetOrder.order.paymentStatus ||
        localOrder.paymentStatus;


      localOrder.orderStatus =
        sheetOrder.order.orderStatus ||
        localOrder.orderStatus;


      localOrder.lastUpdated =
        sheetOrder.order.lastUpdated ||
        localOrder.lastUpdated;

    } catch (error) {

      console.log(
        "Order refresh failed:",
        error
      );

    }

  }


  localStorage.setItem(
    "gulship_orders",
    JSON.stringify(orders)
  );


  renderOrders();

}


/* =========================================================
   STORAGE
========================================================= */

function loadCart() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "gulship_cart"
      )
    ) || [];

  } catch (error) {

    return [];

  }

}


function saveCart() {

  localStorage.setItem(
    "gulship_cart",
    JSON.stringify(cart)
  );

}


function loadOrders() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "gulship_orders"
      )
    ) || [];

  } catch (error) {

    return [];

  }

}


/* =========================================================
   BADGES
========================================================= */

function updateBadges() {

  const count =
    cart.reduce(
      (sum, item) =>
        sum + Number(item.qty || 0),
      0
    );


  [
    "headerCartBadge",
    "cartBadge",
    "detailsCartBadge"
  ].forEach(id => {

    const element =
      $(id);

    if (element) {

      element.textContent =
        count;

    }

  });

}


/* =========================================================
   HELPERS
========================================================= */

function getProduct(
  productId
) {

  return PRODUCTS.find(
    product =>
      product.id === productId
  );

}


function getCartQuantity(
  productId
) {

  const item =
    cart.find(
      item =>
        item.id === productId
    );

  return item
    ? Number(item.qty)
    : 0;

}


function generateOrderId() {

  const now =
    new Date();


  const date =
    now
      .toISOString()
      .replace(/\D/g, "")
      .slice(0, 14);


  const random =
    Math.floor(
      1000 +
      Math.random() * 9000
    );


  return `GUL-${date}-${random}`;

}


function formatNumber(
  number
) {

  return Number(
    number || 0
  ).toLocaleString(
    "en-IN"
  );

}


function formatDate(
  date
) {

  if (!date) {
    return "";
  }


  const parsed =
    new Date(date);


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {

    return String(date);

  }


  return parsed.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


function getStatusClass(
  status
) {

  const value =
    String(
      status || ""
    ).toLowerCase();


  if (
    value.includes("deliver")
  ) {
    return "status-delivered";
  }


  if (
    value.includes("cancel")
  ) {
    return "status-cancel";
  }


  if (
    value.includes("ship")
  ) {
    return "status-shipped";
  }


  if (
    value.includes("pack")
  ) {
    return "status-packed";
  }


  if (
    value.includes("process")
  ) {
    return "status-processing";
  }


  return "status-confirmed";

}


function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(
  message
) {

  const toast =
    $("toast");

  if (!toast) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}