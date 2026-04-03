/* =============================================
   PHONG THUY SHOP - HỆ THỐNG CHỨC NĂNG v2.0
   Bao gồm TẤT CẢ tính năng
   ============================================= */

// =============================================
// 1. GIỎ HÀNG
// =============================================
const Cart = {
  getAll() { return JSON.parse(localStorage.getItem('pt_cart') || '[]'); },
  save(items) { localStorage.setItem('pt_cart', jsON.stringify(items)); Cart.updateBadge(); },
  add(product) {
    const items = Cart.getAll();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) items[idx].qty += product.qty;
    else items.push(product);
    Cart.save(items);
    Cart.showToast(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
  },
  remove(id) { Cart.save(Cart.getAll().filter(i => i.id !== id)); },
  updateQty(id, qty) {
    const items = Cart.getAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx > -1) { if (qty <= 0) items.splice(idx, 1); else items[idx].qty = qty; }
    Cart.save(items);
  },
  clear() { localStorage.removeItem('pt_cart'); Cart.updateBadge(); },
  total() { return Cart.getAll().reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return Cart.getAll().reduce((s, i) => s + i.qty, 0); },
  updateBadge() {
    const c = Cart.count();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = c; el.style.display = c > 0 ? '' : 'none';
    });
  },
  showToast(msg, type = 'success') {
    let toast = document.getElementById('pt-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pt-toast';
      toast.style.cssText = `position:fixed;bottom:90px;right:24px;z-index:99999;
        padding:14px 22px;border-radius:10px;font-size:15px;
        box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:all 0.4s;max-width:320px;opacity:0;transform:translateY(10px);`;
      document.body.appendChild(toast);
    }
    const colors = { success: '#2d6a4f', error: '#8b0000', info: '#1a4a7a', warning: '#7d5a00' };
    toast.style.background = colors[type] || colors.success;
    toast.style.color = '#fff';
    toast.textContent = msg;
    toast.style.opacity = '1'; toast.style.transform = 'translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; }, 3200);
  }
};

// =============================================
// 2. TÀI KHOẢN
// =============================================
const Auth = {
  getUsers() { return JSON.parse(localStorage.getItem('pt_users') || '[]'); },
  getCurrentUser() { return JSON.parse(localStorage.getItem('pt_current_user') || 'null'); },
  register(name, email, password) {
    const users = Auth.getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email này đã được đăng ký!' };
    users.push({ name, email, password, createdAt: Date.now() });
    localStorage.setItem('pt_users', jsON.stringify(users));
    return { ok: true };
  },
  login(email, password) {
    const user = Auth.getUsers().find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, msg: 'Email hoặc mật khẩu không đúng!' };
    localStorage.setItem('pt_current_user', jsON.stringify(user));
    Auth.updateNavUI(); return { ok: true, user };
  },
  logout() { localStorage.removeItem('pt_current_user'); Auth.updateNavUI(); window.location.href = 'index.html'; },
  updateNavUI() {
    const user = Auth.getCurrentUser();
    document.querySelectorAll('.auth-login-link').forEach(el => el.style.display = user ? 'none' : '');
    document.querySelectorAll('.auth-register-link').forEach(el => el.style.display = user ? 'none' : '');
    document.querySelectorAll('.auth-user-menu').forEach(el => el.style.display = user ? '' : 'none');
    document.querySelectorAll('.auth-user-name').forEach(el => el.textContent = user ? user.name : '');
  }
};

// =============================================
// 3. ĐƠN HÀNG
// =============================================
const Orders = {
  getAll() { return JSON.parse(localStorage.getItem('pt_orders') || '[]'); },
  place(orderData) {
    const orders = Orders.getAll();
    const order = { id: 'DH' + Date.now(), orderData, status: 'pending', statusText: 'Chờ xác nhận', createdAt: Date.now(), items: Cart.getAll(), total: Cart.total() };
    // Apply coupon discount
    if (orderData.couponDiscount) order.total = Math.max(0, order.total - orderData.couponDiscount);
    orders.unshift(order);
    localStorage.setItem('pt_orders', jsON.stringify(orders));
    Cart.clear(); return order;
  },
  updateStatus(id, status) {
    const orders = Orders.getAll();
    const statusTextMap = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao', done: 'Hoàn thành', cancelled: 'Đã h���y' };
    const idx = orders.findIndex(o => o.id === id);
    if (idx > -1) { orders[idx].status = status; orders[idx].statusText = statusTextMap[status] || status; }
    localStorage.setItem('pt_orders', jsON.stringify(orders));
  }
};

// =============================================
// 4. TÌM KIẾM
// =============================================
const Search = {
  products: [
    { name: 'Vòng Tay Mắt Hổ', url: 'CTSP-vongtay.html', price: 850000, category: 'vong-tay' },
    { name: 'Tượng Tỳ Hưu Đá Xanh', url: 'CTSP-tuongtyhuu.html', price: 2500000, category: 'tuong' },
    { name: 'Quả Cầu Thạch Anh Hồng', url: 'CTSP-quacauthachanh.html', price: 1200000, category: 'do-trung-bay' },
    { name: 'Thác Nước Phong Thủy', url: 'CTSP-thacnuoc.html', price: 3100000, category: 'do-trung-bay' },
    { name: 'Cây Tài Lộc Thạch Anh', url: 'CTSP-caytailoc.html', price: 1500000, category: 'do-trung-bay' },
    { name: 'Thiềm Thừ Cóc Ngậm Tiền', url: 'CTSP-thiemthu.html', price: 1800000, category: 'tuong' },
    { name: 'Vòng Tay Trầm Hương', url: 'CTSP-vongtram.html', price: 2200000, category: 'vong-tay' },
    { name: 'Mặt Hồ Ly Đá Tự Nhiên', url: 'CTSP-matholy.html', price: 950000, category: 'trang-suc' },
    { name: 'Tượng Phật Di Lặc Bằng Gỗ', url: 'CTSP-tuongphat.html', price: 3500000, category: 'tuong' },
    { name: 'Tháp Văn Xương Bằng Đồng', url: 'CTSP-thapvanxuong.html', price: 1100000, category: 'do-trung-bay' },
    { name: 'Bát Tụ Bảo Chiêu Tài', url: 'CTSP-battubao.html', price: 2800000, category: 'do-trung-bay' },
    { name: 'Ngọc Bội Phỉ Thúy', url: 'CTSP-phithuy.html', price: 4500000, category: 'trang-suc' },
    { name: 'Tượng Mã Đáo Thành Công', url: 'CTSP-tuongngua.html', price: 2600000, category: 'tuong' },
    { name: 'Đồng Tiền Hoa Mai 5 Cánh', url: 'CTSP-tienhoamai.html', price: 250000, category: 'vat-pham' },
    { name: 'Gậy Như Ý Ngọc Onyx', url: 'CTSP-gaynhuy.html', price: 1900000, category: 'do-trung-bay' },
    { name: 'Hồ Lô Đồng Cầu Bình An', url: 'CTSP-holo.html', price: 800000, category: 'do-trung-bay' },
  ],
  query(q) {
    q = q.toLowerCase().trim(); if (!q) return [];
    return Search.products.filter(p => p.name.toLowerCase().includes(q));
  },
  showDropdown(inputEl, results) {
    let dd = document.getElementById('pt-search-dropdown');
    if (!dd) {
      dd = document.createElement('div'); dd.id = 'pt-search-dropdown';
      dd.style.cssText = `position:absolute;top:100%;left:0;right:0;z-index:9999;background:#fff;
        border:1px solid #ddd;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,0.12);
        max-height:320px;overflow-y:auto;`;
      inputEl.parentElement.style.position = 'relative'; inputEl.parentElement.appendChild(dd);
    }
    const fmt = n => n.toLocaleString('vi-VN') + ' đ';
    dd.innerHTML = results.length === 0
      ? '<div style="padding:12px 16px;color:#888;font-size:14px;">Không tìm thấy sản phẩm</div>'
      : results.map(r => `<a href="${r.url}" style="display:flex;justify-content:space-between;align-items:center;
          padding:10px 16px;text-decoration:none;color:#333;border-bottom:1px solid #f5f5f5;font-size:14px;"
          onmouseover="this.style.background='#fdf5f5'" onmouseout="this.style.background=''">
          <span><i class="fas fa-gem me-2" style="color:#8b0000;font-size:11px;"></i>${r.name}</span>
          <span style="color:#8b0000;font-weight:bold;white-space:nowrap;margin-left:12px;">${fmt(r.price)}</span>
        </a>`).join('');
    dd.style.display = 'block';
  },
  hideDropdown() { const d = document.getElementById('pt-search-dropdown'); if (d) d.style.display = 'none'; }
};

// =============================================
// 5. WISHLIST (YÊU THÍCH)
// =============================================
const Wishlist = {
  getAll() { return JSON.parse(localStorage.getItem('pt_wishlist') || '[]'); },
  save(items) { localStorage.setItem('pt_wishlist', jsON.stringify(items)); Wishlist.updateBadge(); },
  toggle(product) {
    const items = Wishlist.getAll();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) {
      items.splice(idx, 1);
      Cart.showToast(`💔 Đã xóa khỏi danh sách yêu thích`, 'info');
    } else {
      items.push(product);
      Cart.showToast(`❤️ Đã thêm vào danh sách yêu thích!`, 'success');
    }
    Wishlist.save(items);
    Wishlist.updateHeartButtons();
  },
  has(id) { return Wishlist.getAll().some(i => i.id === id); },
  remove(id) { Wishlist.save(Wishlist.getAll().filter(i => i.id !== id)); },
  count() { return Wishlist.getAll().length; },
  updateBadge() {
    const c = Wishlist.count();
    document.querySelectorAll('.wishlist-badge').forEach(el => { el.textContent = c; el.style.display = c > 0 ? '' : 'none'; });
  },
  updateHeartButtons() {
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
      const id = btn.dataset.id;
      const icon = btn.querySelector('i');
      if (Wishlist.has(id)) { btn.classList.add('active'); if (icon) { icon.className = 'fas fa-heart'; } }
      else { btn.classList.remove('active'); if (icon) { icon.className = 'far fa-heart'; } }
    });
  }
};

// =============================================
// 6. ĐÁNH GIÁ SẢN PHẨM
// =============================================
const Reviews = {
  getAll() { return JSON.parse(localStorage.getItem('pt_reviews') || '{}'); },
  getByProduct(productId) { return (Reviews.getAll()[productId] || []); },
  add(productId, review) {
    const all = Reviews.getAll();
    if (!all[productId]) all[productId] = [];
    all[productId].unshift({ review, id: Date.now(), createdAt: Date.now() });
    localStorage.setItem('pt_reviews', jsON.stringify(all));
  },
  avgRating(productId) {
    const rv = Reviews.getByProduct(productId);
    if (!rv.length) return 0;
    return (rv.reduce((s, r) => s + r.rating, 0) / rv.length).toFixed(1);
  },
  renderStars(rating, interactive = false, name = '') {
    return [1,2,3,4,5].map(i => {
      if (interactive) return `<i class="${i <= rating ? 'fas' : 'far'} fa-star" 
        style="color:#d4af37;cursor:pointer;font-size:1.4rem;" 
        onmouseover="highlightStars(${i})" onmouseout="resetStars()" onclick="selectStar(${i})" data-star="${i}"></i>`;
      return `<i class="${i <= Math.round(rating) ? 'fas' : 'far'} fa-star" style="color:#d4af37;"></i>`;
    }).join('');
  }
};

// =============================================
// 7. MÃ GIẢM GIÁ / COUPON
// =============================================
const Coupon = {
  codes: {
    'PHONGTHUY10': { discount: 10, type: 'percent', desc: 'Giảm 10%' },
    'PHONGTHUY20': { discount: 20, type: 'percent', desc: 'Giảm 20%' },
    'TAILOC50K':   { discount: 50000, type: 'fixed', desc: 'Giảm 50.000đ' },
    'BINHÁN100K':  { discount: 100000, type: 'fixed', desc: 'Giảm 100.000đ' },
    'MOIKHACH':    { discount: 15, type: 'percent', desc: 'Giảm 15% khách mới' },
    'VIPKHACH':    { discount: 200000, type: 'fixed', desc: 'Giảm 200.000đ VIP' },
  },
  validate(code) {
    const c = Coupon.codes[code.toUpperCase().trim()];
    if (!c) return { ok: false, msg: 'Mã giảm giá không hợp lệ' };
    return { ok: true, c };
  },
  calcDiscount(code, total) {
    const c = Coupon.codes[code.toUpperCase().trim()];
    if (!c) return 0;
    if (c.type === 'percent') return Math.round(total * c.discount / 100);
    return Math.min(c.discount, total);
  }
};

// =============================================
// 8. POPUP KHUYẾN MÃI
// =============================================
const PromoPopup = {
  promos: [
    { id: 'promo1', title: '🎁 KHUYẾN MÃI ĐẶC BIỆT!', desc: 'Giảm 10% cho đơn hàng đầu tiên', code: 'PHONGTHUY10', color: '#8b0000' },
    { id: 'promo2', title: '🌟 ƯU ĐÃI HÔM NAY!', desc: 'Freeship toàn quốc - Không giới hạn đơn hàng', code: null, color: '#2d6a4f' },
    { id: 'promo3', title: '💎 QUÀ TẶNG PHONG THỦY', desc: 'Mua 2 tặng 1 Đồng Tiền Hoa Mai', code: null, color: '#7d5a00' },
  ],
  show() {
    const shown = sessionStorage.getItem('pt_popup_shown');
    if (shown) return;
    const promo = PromoPopup.promos[Math.floor(Math.random() * PromoPopup.promos.length)];
    sessionStorage.setItem('pt_popup_shown', '1');

    const overlay = document.createElement('div');
    overlay.id = 'pt-promo-overlay';
    overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99998;
      display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;`;

    overlay.innerHTML = `
      <div style="background:white;border-radius:16px;max-width:420px;width:90%;overflow:hidden;
        box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:slideUp 0.4s ease;position:relative;">
        <div style="background:${promo.color};color:white;padding:24px;text-align:center;">
          <button onclick="PromoPopup.close()" style="position:absolute;top:12px;right:16px;
            background:none;border:none;color:white;font-size:1.4rem;cursor:pointer;opacity:0.8;">✕</button>
          <div style="font-size:2.5rem;margin-bottom:8px;">🏮</div>
          <h4 style="font-weight:bold;margin:0;">${promo.title}</h4>
        </div>
        <div style="padding:24px;text-align:center;">
          <p style="font-size:1.1rem;color:#333;margin-bottom:16px;">${promo.desc}</p>
          ${promo.code ? `
            <div style="background:#fdf5f5;border:2px dashed #8b0000;border-radius:10px;padding:12px;margin-bottom:16px;">
              <div style="color:#888;font-size:0.85rem;">Mã giảm giá của bạn:</div>
              <div style="font-size:1.6rem;font-weight:bold;color:#8b0000;letter-spacing:4px;">${promo.code}</div>
            </div>
            <button onclick="PromoPopup.copyCode('${promo.code}')" style="background:#8b0000;color:white;border:none;
              border-radius:8px;padding:10px 24px;font-weight:bold;cursor:pointer;margin-bottom:10px;width:100%;">
              📋 Sao chép mã
            </button>` : ''}
          <button onclick="PromoPopup.close()" style="background:none;border:2px solid #ddd;border-radius:8px;
            padding:8px 24px;cursor:pointer;color:#666;width:100%;">Đóng lại</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) PromoPopup.close(); });
  },
  close() { const el = document.getElementById('pt-promo-overlay'); if (el) el.remove(); },
  copyCode(code) {
    navigator.clipboard.writeText(code).then(() => { Cart.showToast(`✅ Đã sao chép mã: ${code}`, 'success'); });
    PromoPopup.close();
  }
};

// =============================================
// 9. NÚT ZALO / MESSENGER NỔI + CHAT
// =============================================
const FloatingButtons = {
  init() {
    const wrapper = document.createElement('div');
    wrapper.id = 'pt-floating';
    wrapper.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9990;display:flex;flex-direction:column;align-items:flex-end;gap:10px;`;

    wrapper.innerHTML = `
      <!-- Chat nội bộ -->
      <div id="pt-chat-box" style="display:none;width:320px;background:white;border-radius:16px;
        box-shadow:0 8px 32px rgba(0,0,0,0.18);overflow:hidden;margin-bottom:4px;">
        <div style="background:#8b0000;color:white;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:bold;">💬 Hỗ Trợ Khách Hàng</div>
            <div style="font-size:0.75rem;opacity:0.85;">🟢 Đang trực tuyến</div>
          </div>
          <button onclick="FloatingButtons.toggleChat()" style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;">✕</button>
        </div>
        <div id="pt-chat-messages" style="height:240px;overflow-y:auto;padding:12px;background:#f9f9f9;display:flex;flex-direction:column;gap:8px;">
          <div style="background:#8b0000;color:white;padding:10px 14px;border-radius:12px 12px 12px 2px;max-width:85%;font-size:0.9rem;">
            Chào bạn! 🙏 Tôi có thể giúp gì cho bạn về vật phẩm phong thủy?
          </div>
          <div style="background:#8b0000;color:white;padding:10px 14px;border-radius:12px 12px 12px 2px;max-width:85%;font-size:0.9rem;">
            Bạn cần tư vấn về sản phẩm nào? 😊
          </div>
        </div>
        <div style="padding:10px;border-top:1px solid #eee;display:flex;gap:8px;">
          <input id="pt-chat-input" type="text" placeholder="Nhập tin nhắn." 
            style="flex:1;border:1px solid #ddd;border-radius:20px;padding:8px 14px;font-size:0.9rem;outline:none;"
            onkeydown="if(event.key==='Enter') FloatingButtons.sendMsg()">
          <button onclick="FloatingButtons.sendMsg()" style="background:#8b0000;color:white;border:none;
            border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:1rem;">➤</button>
        </div>
        <!-- Quick replies -->
        <div style="padding:8px 10px;border-top:1px solid #f0f0f0;display:flex;flex-wrap:wrap;gap:6px;">
          <button onclick="FloatingButtons.quickReply('Tôi muốn tư vấn sản phẩm')" style="background:#fdf5f5;border:1px solid #e0b0b0;border-radius:12px;padding:4px 10px;font-size:0.78rem;cursor:pointer;color:#8b0000;">Tư vấn SP</button>
          <button onclick="FloatingButtons.quickReply('Đơn hàng của tôi đâu?')" style="background:#fdf5f5;border:1px solid #e0b0b0;border-radius:12px;padding:4px 10px;font-size:0.78rem;cursor:pointer;color:#8b0000;">Tra cứu đơn</button>
          <button onclick="FloatingButtons.quickReply('Chính sách đổi trả?')" style="background:#fdf5f5;border:1px solid #e0b0b0;border-radius:12px;padding:4px 10px;font-size:0.78rem;cursor:pointer;color:#8b0000;">Đổi trả</button>
        </div>
      </div>

      <!-- Nút Zalo -->
      <a href="https://zalo.me/0123456789" target="_blank" title="Chat Zalo"
        style="width:50px;height:50px;border-radius:50%;background:#0068ff;color:white;display:flex;align-items:center;
        justify-content:center;font-weight:bold;font-size:1rem;text-decoration:none;box-shadow:0 4px 14px rgba(0,104,255,0.4);
        transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" width="28" onerror="this.outerHTML='ZL'">
      </a>

      <!-- Nút Chat -->
      <button onclick="FloatingButtons.toggleChat()" id="pt-chat-btn" title="Chat hỗ trợ"
        style="width:54px;height:54px;border-radius:50%;background:#8b0000;color:white;border:none;
        font-size:1.4rem;cursor:pointer;box-shadow:0 4px 16px rgba(139,0,0,0.4);position:relative;
        transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        💬
        <span id="pt-chat-notif" style="position:absolute;top:-4px;right:-4px;background:#d4af37;
          color:#222;border-radius:50%;width:18px;height:18px;font-size:0.65rem;font-weight:bold;
          display:flex;align-items:center;justify-content:center;">1</span>
      </button>
    `;

    document.body.appendChild(wrapper);
  },

  toggleChat() {
    const box = document.getElementById('pt-chat-box');
    const notif = document.getElementById('pt-chat-notif');
    if (box.style.display === 'none') {
      box.style.display = 'block';
      if (notif) notif.style.display = 'none';
    } else {
      box.style.display = 'none';
    }
  },

  autoReplies: {
    'tư vấn': ['Dạ bạn quan tâm đến sản phẩm nào ạ? Chúng tôi có vòng tay, tượng, vật phẩm chiêu tài. 🙏', 'Bạn có thể cho biết mệnh của mình để tư vấn vật phẩm phù hợp không ạ?'],
    'đơn hàng': ['Bạn có thể vào mục "Đơn hàng của tôi" để tra cứu trạng thái nhé ạ 📦', 'Hoặc cung cấp mã đơn hàng để chúng tôi hỗ trợ nhanh hơn!'],
    'đổi trả': ['Chính sách đổi trả trong vòng 7 ngày kể từ ngày nhận hàng ạ 🔄', 'Sản phẩm đổi trả cần còn nguyên vẹn và đầy đủ phụ kiện. Hotline: 0123 456 789'],
    'giá': ['Giá sản phẩm từ 250.000đ đến 4.500.000đ. Bạn muốn xem sản phẩm trong khoảng giá nào? 💰', 'Chúng tôi có nhiều ưu đãi hấp dẫn, đặc biệt freeship toàn quốc! 🚚'],
    'ship': ['Freeship toàn quốc cho tất cả đơn hàng! 🚚✨', 'Thời gian giao hàng 2-5 ngày tùy khu vực ạ.'],
    default: ['Cảm ơn bạn đã liên hệ! Nhân viên sẽ phản hồi sớm nhất có thể 🙏', 'Hoặc gọi ngay Hotline: **0123 456 789** để được hỗ trợ trực tiếp ạ!']
  },

  sendMsg() {
    const input = document.getElementById('pt-chat-input');
    const msg = input.value.trim(); if (!msg) return;
    const messages = document.getElementById('pt-chat-messages');

    // User message
    messages.innerHTML += `<div style="background:#e8f5e9;padding:10px 14px;border-radius:12px 12px 2px 12px;max-width:85%;align-self:flex-end;font-size:0.9rem;color:#333;">${msg}</div>`;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Auto reply
    setTimeout(() => {
      const lc = msg.toLowerCase();
      let replies = FloatingButtons.autoReplies.default;
      for (const key of Object.keys(FloatingButtons.autoReplies)) {
        if (key !== 'default' && lc.includes(key)) { replies = FloatingButtons.autoReplies[key]; break; }
      }
      const reply = replies[Math.floor(Math.random() * replies.length)];
      messages.innerHTML += `<div style="background:#8b0000;color:white;padding:10px 14px;border-radius:12px 12px 12px 2px;max-width:85%;font-size:0.9rem;">${reply}</div>`;
      messages.scrollTop = messages.scrollHeight;
    }, 800);
  },

  quickReply(text) {
    document.getElementById('pt-chat-input').value = text;
    FloatingButtons.sendMsg();
  }
};

// =============================================
// 10. LỌC SẢN PHẨM (dùng cho trang danh sách)
// =============================================
const ProductFilter = {
  init() {
    const filterBar = document.getElementById('pt-filter-bar');
    if (!filterBar) return;

    filterBar.innerHTML = `
      <div class="row g-2 align-items-center mb-4">
        <div class="col-auto">
          <select id="pt-filter-category" class="form-select form-select-sm" onchange="ProductFilter.apply()" style="border-color:#8b0000;">
            <option value="">📦 Tất cả danh mục</option>
            <option value="vong-tay">💎 Vòng Tay</option>
            <option value="tuong">🗿 Tượng Phong Thủy</option>
            <option value="trang-suc">✨ Trang Sức</option>
            <option value="do-trung-bay">🏮 Đồ Trưng Bày</option>
            <option value="vat-pham">🪙 Vật Phẩm Khác</option>
          </select>
        </div>
        <div class="col-auto">
          <select id="pt-filter-price" class="form-select form-select-sm" onchange="ProductFilter.apply()" style="border-color:#8b0000;">
            <option value="">💰 Tất cả mức giá</option>
            <option value="0-500000">Dưới 500.000đ</option>
            <option value="500000-1000000">500K - 1 triệu</option>
            <option value="1000000-2000000">1 - 2 triệu</option>
            <option value="2000000-5000000">Trên 2 triệu</option>
          </select>
        </div>
        <div class="col-auto">
          <select id="pt-filter-sort" class="form-select form-select-sm" onchange="ProductFilter.apply()" style="border-color:#8b0000;">
            <option value="">🔀 Sắp xếp</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="name-asc">Tên A-Z</option>
          </select>
        </div>
        <div class="col-auto ms-auto">
          <button onclick="ProductFilter.reset()" class="btn btn-sm btn-outline-secondary">🔄 Đặt lại</button>
        </div>
        <div class="col-12">
          <small id="pt-filter-result" class="text-muted"></small>
        </div>
      </div>`;
  },
  apply() {
    const category = document.getElementById('pt-filter-category')?.value || '';
    const priceRange = document.getElementById('pt-filter-price')?.value || '';
    const sort = document.getElementById('pt-filter-sort')?.value || '';
    const cards = document.querySelectorAll('.product-card-wrapper');
    let visible = 0;

    cards.forEach(card => {
      const cardCat = card.dataset.category || '';
      const cardPrice = parseInt(card.dataset.price || '0');
      let show = true;

      if (category && cardCat !== category) show = false;
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (cardPrice < min || cardPrice > max) show = false;
      }
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    const resultEl = document.getElementById('pt-filter-result');
    if (resultEl) resultEl.textContent = `Hiển thị ${visible} sản phẩm`;

    // Sort
    if (sort) {
      const container = document.querySelector('.product-grid');
      if (container) {
        const items = [container.querySelectorAll('.product-card-wrapper')].filter(c => c.style.display !== 'none');
        items.sort((a, b) => {
          if (sort === 'price-asc') return parseInt(a.dataset.price) - parseInt(b.dataset.price);
          if (sort === 'price-desc') return parseInt(b.dataset.price) - parseInt(a.dataset.price);
          if (sort === 'name-asc') return (a.dataset.name || '').localeCompare(b.dataset.name || '', 'vi');
          return 0;
        });
        items.forEach(el => container.appendChild(el));
      }
    }
  },
  reset() {
    ['pt-filter-category','pt-filter-price','pt-filter-sort'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    document.querySelectorAll('.product-card-wrapper').forEach(c => c.style.display = '');
    const resultEl = document.getElementById('pt-filter-result');
    if (resultEl) resultEl.textContent = '';
  }
};

// =============================================
// KHỞI TẠO CHUNG
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
  Auth.updateNavUI();
  Wishlist.updateBadge();
  ProductFilter.init();
  FloatingButtons.init();

  // css animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .btn-wishlist { background: none; border: 2px solid #8b0000; border-radius: 50%; width: 40px; height: 40px;
      display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:0.3s;color:#8b0000; }
    .btn-wishlist:hover, .btn-wishlist.active { background: #8b0000; color: white; }
    .btn-wishlist.active i { color: white !important; }
  `;
  document.head.appendChild(style);

  // Popup khuyến mãi (delay 2.5s)
  setTimeout(() => PromoPopup.show(), 2500);

  // Search input
  const si = document.getElementById('pt-search-input');
  if (si) {
    si.addEventListener('input', function() {
      const results = Search.query(this.value);
      if (this.value.trim()) Search.showDropdown(this, results); else Search.hideDropdown();
    });
    si.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { const r = Search.query(this.value); if (r.length === 1) window.location.href = r[0].url; }
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('#pt-search-input') && !e.target.closest('#pt-search-dropdown')) Search.hideDropdown();
    });
  }

  // Nút thêm giỏ & mua ngay (trang chi tiết)
  const titleEl = document.querySelector('.product-title');
  const priceEl = document.querySelector('.product-price-detail');
  if (titleEl && priceEl) {
    const name = titleEl.textContent.trim();
    const price = parseInt(priceEl.textContent.replace(/[^\d]/g, '')) || 0;
    const codeEl = document.querySelector('.text-muted');
    const idMatch = codeEl ? codeEl.textContent.match(/:\s*(\S+)/) : null;
    const id = idMatch ? idMatch[1] : name.slice(0,12).replace(/\s/g,'');

    // Nút thêm giỏ
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const qty = parseInt(document.getElementById('quantity')?.value || 1);
        Cart.add({ id, name, price, qty, url: window.location.href });
      });
    });

    // Nút mua ngay - FIX: Không chuyển hướng tự động
    document.querySelectorAll('.btn-buy-now').forEach(btn => {
      btn.addEventListener('click', () => {
        const qty = parseInt(document.getElementById('quantity')?.value || 1);
        Cart.add({ id, name, price, qty, url: window.location.href });
        // ✅ MỞ MODAL THAY VÌ CHUYỂN TRANG
        openCheckout();
      });
    });

    // Wishlist button (nếu có)
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
      btn.dataset.id = id;
      btn.addEventListener('click', () => Wishlist.toggle({ id, name, price, url: window.location.href }));
    });
    Wishlist.updateHeartButtons();

    // Reviews section (nếu có)
    const reviewForm = document.getElementById('pt-review-form');
    if (reviewForm) {
      window._selectedStar = 0;
      window.highlightStars = (n) => { document.querySelectorAll('[data-star]').forEach(s => { s.className = (parseInt(s.dataset.star) <= n ? 'fas' : 'far') + ' fa-star'; s.style.color='#d4af37'; }); };
      window.resetStars = () => highlightStars(window._selectedStar);
      window.selectStar = (n) => { window._selectedStar = n; highlightStars(n); };
      document.getElementById('pt-submit-review')?.addEventListener('click', () => {
        const user = Auth.getCurrentUser();
        const reviewer = document.getElementById('pt-reviewer-name')?.value || (user ? user.name : 'Khách');
        const content = document.getElementById('pt-review-content')?.value?.trim();
        if (!window._selectedStar) { Cart.showToast('⚠️ Vui lòng chọn số sao đánh giá', 'warning'); return; }
        if (!content) { Cart.showToast('⚠️ Vui lòng nhập nhận xét', 'warning'); return; }
        Reviews.add(id, { rating: window._selectedStar, reviewer, content });
        renderReviews(id);
        document.getElementById('pt-review-content').value = '';
        window._selectedStar = 0; highlightStars(0);
        Cart.showToast('✅ Cảm ơn bạn đã đánh giá sản phẩm!', 'success');
      });
      renderReviews(id);
    }
  }
});

function renderReviews(productId) {
  const container = document.getElementById('pt-reviews-list');
  const avgEl = document.getElementById('pt-avg-rating');
  const countEl = document.getElementById('pt-review-count');
  if (!container) return;

  const reviews = Reviews.getByProduct(productId);
  const avg = Reviews.avgRating(productId);
  if (avgEl) avgEl.innerHTML = Reviews.renderStars(avg) + ` <span style="font-size:1.1rem;font-weight:bold;color:#d4af37;">${avg > 0 ? avg : '—'}</span>`;
  if (countEl) countEl.textContent = `(${reviews.length} đánh giá)`;

  if (reviews.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-3">Chưa có đánh giá nào. Hãy là người đầu tiên! ⭐</p>';
    return;
  }
  container.innerHTML = reviews.map(r => `
    <div style="border-bottom:1px solid #f0f0f0;padding:12px 0;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div>
          <strong style="color:#333;">${r.reviewer}</strong>
          <span style="margin-left:8px;">${Reviews.renderStars(r.rating)}</span>
        </div>
        <small style="color:#aaa;">${new Date(r.createdAt).toLocaleDateString('vi-VN')}</small>
      </div>
      <p style="color:#555;margin:0;font-size:0.9rem;">${r.content}</p>
    </div>`).join('');
}