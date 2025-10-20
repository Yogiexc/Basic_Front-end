/* POS JavaScript for Indo Gitar */

const products = [
  { id: 1, name: "Gitar Akustik", price: 1750000 },
  { id: 2, name: "Gitar Elektrik", price: 2500000 },
  { id: 3, name: "Custom Handmade", price: 3500000 },
  { id: 4, name: "Gitar Junior (3/4)", price: 900000 },
  { id: 5, name: "Bass Elektrik", price: 4200000 }
];

const currency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

const STORAGE_KEY = 'indoGitarCart';
let cart = [];

const productsContainer = document.getElementById('pos-products');
const cartBody = document.getElementById('cart-body');
const cartTotalEl = document.getElementById('cart-total');
const clearCartBtn = document.getElementById('clear-cart');
const printReceiptBtn = document.getElementById('print-receipt');

function renderProducts(){
  productsContainer.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between bg-white rounded-lg shadow p-4';
    card.innerHTML = `
      <div>
        <h4 class="font-semibold text-[#5c3d2e]">${p.name}</h4>
        <p class="text-sm text-gray-600">${currency(p.price)}</p>
      </div>
      <button data-id="${p.id}" class="add-btn bg-[#d4a373] hover:bg-[#b8895a] text-white px-3 py-1 rounded">Tambah</button>
    `;
    productsContainer.appendChild(card);
  });

  document.querySelectorAll('.add-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = Number(e.currentTarget.dataset.id);
      addToCart(id);
    });
  });
}

function loadCart(){
  const saved = localStorage.getItem(STORAGE_KEY);
  cart = saved ? JSON.parse(saved) : [];
  renderCart();
}

function saveCart(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function findProduct(id){ return products.find(p=>p.id===id); }

function addToCart(id){
  const idx = cart.findIndex(item => item.id === id);
  if(idx > -1) cart[idx].qty++;
  else {
    const p = findProduct(id);
    if(!p) return;
    cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
  }
  saveCart();
  renderCart();
}

function removeFromCart(id){
  const idx = cart.findIndex(item=>item.id===id);
  if(idx === -1) return;
  cart[idx].qty--;
  if(cart[idx].qty <= 0) cart.splice(idx,1);
  saveCart();
  renderCart();
}

function clearCart(){
  if(!confirm('Yakin ingin mengosongkan keranjang?')) return;
  cart = [];
  saveCart();
  renderCart();
}

function cartTotal(){
  return cart.reduce((s,item)=> s + item.price * item.qty, 0);
}

function renderCart(){
  cartBody.innerHTML = '';
  if(cart.length === 0){
    cartBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-gray-500">Keranjang kosong</td></tr>`;
  } else {
    cart.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="py-2">${item.name}</td>
        <td class="py-2 text-center">${item.qty}</td>
        <td class="py-2 text-right">${currency(item.price * item.qty)}</td>
        <td class="py-2 text-right">
          <button data-id="${item.id}" class="remove-btn text-red-600 hover:underline text-sm">Hapus</button>
        </td>
      `;
      cartBody.appendChild(tr);
    });

    document.querySelectorAll('.remove-btn').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const id = Number(e.currentTarget.dataset.id);
        removeFromCart(id);
      });
    });
  }

  cartTotalEl.textContent = currency(cartTotal());
}

function printReceipt(){
  if(cart.length === 0){
    alert('Keranjang kosong. Tambahkan item terlebih dahulu.');
    return;
  }

  const tanggal = new Date().toLocaleString('id-ID');
  let lines = [];
  lines.push('--- INDO GITAR ---');
  lines.push('Struk Pembayaran');
  lines.push(`Tanggal: ${tanggal}`);
  lines.push('---------------------------');
  cart.forEach(it => {
    const name = it.name.padEnd(20, ' ');
    const qty = String(it.qty).padStart(3,' ');
    const subtotal = currency(it.price * it.qty).padStart(12,' ');
    lines.push(`${name}  x${qty}  ${subtotal}`);
  });
  lines.push('---------------------------');
  lines.push(`TOTAL: ${currency(cartTotal())}`);
  lines.push('Terima kasih telah berbelanja di Indo Gitar!');
  const receiptText = lines.join('\n');

  const w = window.open('', '_blank', 'width=600,height=700');
  if(!w){ alert('Popup diblokir. Izinkan popup untuk mencetak struk.'); return; }
  w.document.write(`
    <html>
      <head><title>Struk Indo Gitar</title>
        <style>
          body { font-family: monospace; padding: 20px; }
          pre { font-size: 14px; }
          .center { text-align:center; margin-top:8px; }
        </style>
      </head>
      <body>
        <pre>${receiptText}</pre>
        <div class="center"><button onclick="window.print();">Cetak</button></div>
      </body>
    </html>
  `);
  w.document.close();
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  loadCart();
  document.getElementById('clear-cart').addEventListener('click', clearCart);
  document.getElementById('print-receipt').addEventListener('click', printReceipt);
});
