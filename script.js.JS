const products = [
  { id: 1, name: "خلاط حوض مطبخ ستانلس", category: "faucets", price: 850, img: "خلاط.png", badge: "خصم 10%" },
  { id: 2, name: "محبس دفن 3/4 بوصة", category: "faucets", price: 210, img: "دفن.png" },
  { id: 3, name: "حوض حمام فوق الرخامة", category: "sinks", price: 1450, img: "حوض.png", badge: "الأكثر مبيعاً" },
  { id: 4, name: "قاعدة حمام معلقة بالخزان", category: "sinks", price: 3200, img: "قاعده.png" },
  { id: 5, name: "عامود شاور هاند دوش", category: "showers", price: 1100, img: "دوش.png", badge: "جديد" },
  { id: 6, name: "صفاية أرضية ستانلس ستيل", category: "showers", price: 180, img: "بيبا.png" }
];

// استرجاع السلة من LocalStorage إن وجدت
let cart = JSON.parse(localStorage.getItem('cart_items')) || [];
let currentProducts = [...products];

// 1. عرض المنتجات
function renderProducts(items) {
  const grid = document.getElementById("productsGrid");
  
  if (items.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #777;">لا توجد منتجات مطابقة.</p>`;
    return;
  }

  grid.innerHTML = items.map(product => `
    <div class="card">
      ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
      <img src="${product.img}" alt="${product.name}">
      <h4>${product.name}</h4>
      <div class="price">${product.price} ج.م</div>
      <button class="add-btn" onclick="addToCart(${product.id})">إضافة للسلة 🛒</button>
    </div>
  `).join('');
}

// 2. التصفية
function filterCategory(cat, element) {
  document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
  element.classList.add('active');

  if (cat === 'all') {
    currentProducts = [...products];
  } else {
    currentProducts = products.filter(p => p.category === cat);
  }
  
  // إعادة تطبيق الترتيب المختار
  const sortValue = document.getElementById("sortSelect").value;
  sortProducts(sortValue, false);
}

// 3. ترتيب المنتجات حسب السعر
function sortProducts(sortType, shouldRender = true) {
  if (sortType === 'low-to-high') {
    currentProducts.sort((a, b) => a.price - b.price);
  } else if (sortType === 'high-to-low') {
    currentProducts.sort((a, b) => b.price - a.price);
  } else {
    // الترتيب الافتراضي حسب ID
    currentProducts.sort((a, b) => a.id - b.id);
  }
  
  if (shouldRender) renderProducts(currentProducts);
}

// 4. إضافة منتج للسلة
function addToCart(id) {
  const existingItem = cart.find(item => item.id === id);
  const product = products.find(p => p.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  updateCart();
  showToast(`تمت إضافة "${product.name}" إلى السلة 🛒`);
}

// 5. تعديل الكمية
function changeQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  updateCart();
}

// 6. حذف عنصر
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
}

// 7. تحديث السلة، LocalStorage والواجهة
function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const totalPrice = document.getElementById("totalPrice");
  const cartCount = document.getElementById("cartCount");
  
  // حفظ التعديلات في LocalStorage
  localStorage.setItem('cart_items', JSON.stringify(cart));

  const totalCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  cartCount.innerText = totalCount;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; color: #777;">السلة فارغة حالياً</p>';
    totalPrice.innerText = 0;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 6px;">
      <div>
        <div style="font-weight: bold; font-size: 0.95rem;">${item.name}</div>
        <div style="font-size: 0.85rem; color: #666;">${item.price} × ${item.quantity} = ${item.price * item.quantity} ج.م</div>
      </div>
      <div style="display: flex; gap: 6px; align-items: center;">
        <button onclick="changeQuantity(${item.id}, -1)" style="padding: 2px 8px; cursor: pointer;">-</button>
        <span>${item.quantity}</span>
        <button onclick="changeQuantity(${item.id}, 1)" style="padding: 2px 8px; cursor: pointer;">+</button>
        <button onclick="removeFromCart(${item.id})" style="background: #dc3545; color: white; border: none; padding: 2px 6px; border-radius: 4px; cursor: pointer; margin-right: 4px;">✕</button>
      </div>
    </div>
  `).join('');

  const sum = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  totalPrice.innerText = sum;
}

// 8. عرض الإشعار المنبثق (Toast)
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = "toast show";
  setTimeout(() => { 
    toast.className = toast.className.replace("show", ""); 
  }, 3000);
}

// 9. البحث المباشر
document.getElementById("searchInput").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase().trim();
  const filtered = currentProducts.filter(p => p.name.toLowerCase().includes(term));
  renderProducts(filtered);
});

// 10. التحكم بفتح وإغلاق السلة
const cartModal = document.getElementById("cartModal");
document.getElementById("cartBtn").onclick = () => cartModal.style.display = "flex";
document.getElementById("closeCart").onclick = () => cartModal.style.display = "none";

window.onclick = (e) => {
  if (e.target === cartModal) cartModal.style.display = "none";
};

// 11. إتمام الطلب عبر الواتساب
function checkout() {
  if (cart.length === 0) {
    alert("السلة فارغة!");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();

  if (!name || !phone || !address) {
    alert("يرجى إدخال جميع البيانات (الاسم، الهاتف، العنوان) لاستكمال الطلب.");
    return;
  }

  // ⚠️ ضع رقم الواتساب الخاص بك هنا
  const storePhone = "+201102511772";

  let message = "📦 *طلب جديد من المتجر الإلكتروني*\n\n";
  message += "👤 *بيانات العميل:*\n";
  message += `• *الاسم:* ${name}\n`;
  message += `• *الهاتف:* ${phone}\n`;
  message += `• *العنوان:* ${address}\n\n`;

  message += "🛒 *تفاصيل المنتجات:*\n";
  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n   الكمية: ${item.quantity} | السعر: ${item.price * item.quantity} ج.م\n`;
  });

  const grandTotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  message += `\n-------------------------\n`;
  message += `💰 *الإجمالي الكلي:* ${grandTotal} ج.م\n`;
  message += `-------------------------`;

  const whatsappUrl = `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');

  // تنظيف السلة و LocalStorage
  cart = [];
  updateCart();
  document.getElementById("customerName").value = '';
  document.getElementById("customerPhone").value = '';
  document.getElementById("customerAddress").value = '';
  cartModal.style.display = "none";
}

// التشغيل الأولي واسترجاع البيانات
renderProducts(currentProducts);
updateCart();
