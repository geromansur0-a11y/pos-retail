/**
 * APP.JS - Logika Utama Aplikasi POS Retail
 */

// 1. DATA MASTER & STATE
const products = [
    { id: 1, barcode: '123', name: 'Aqua 600ml', price: 3500, category: 'Minuman', discount: 0 },
    { id: 2, barcode: '456', name: 'Chitato Sapi', price: 11500, category: 'Snack', discount: 10 },
    { id: 3, barcode: '789', name: 'Beras 1kg', price: 15000, category: 'Sembako', discount: 0 },
    { id: 4, barcode: '001', name: 'Teh Pucuk', price: 4000, category: 'Minuman', discount: 5 }
];

let cart = [];
let scannerActive = false;
let html5QrCode;
let totalBelanjaGlobal = 0;

// Ambil data laporan dari localStorage
let laporanHarian = JSON.parse(localStorage.getItem('laporan_pos')) || {
    totalOmzet: 0,
    jumlahTransaksi: 0,
    riwayat: []
};

// 2. FUNGSI RENDER (TAMPILAN)
function renderCart() {
    const list = document.getElementById('cartList');
    if (!list) return;

    list.innerHTML = '';
    let total = 0, items = 0;

    cart.forEach((item, index) => {
        const subtotal = item.finalPrice * item.qty;
        total += subtotal;
        items += item.qty;

        list.innerHTML += `
            <div class="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border-l-4 border-blue-500 animate-slide-up">
                <div>
                    <span class="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">${item.category}</span>
                    <h3 class="font-bold text-gray-800">${item.name}</h3>
                    <div class="flex items-center gap-2">
                        <p class="text-sm font-bold text-blue-600">Rp ${item.finalPrice.toLocaleString('id-ID')}</p>
                        ${item.isDiscounted ? `<p class="text-[10px] text-red-500 line-through">Rp ${item.price.toLocaleString('id-ID')}</p>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="updateQty(${index}, -1)" class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold active:scale-90">-</button>
                    <span class="text-lg font-semibold">${item.qty}</span>
                    <button onclick="updateQty(${index}, 1)" class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold active:scale-90">+</button>
                </div>
            </div>`;
    });

    document.getElementById('totalItems').innerText = `Total Item (${items})`;
    document.getElementById('totalPrice').innerText = `Rp ${total.toLocaleString('id-ID')}`;
    totalBelanjaGlobal = total;
}

// 3. LOGIKA KERANJANG & TRANSAKSI
window.addToCart = function(product) {
    const discountAmount = (product.price * product.discount) / 100;
    const finalPrice = product.price - discountAmount;

    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1, finalPrice: finalPrice, isDiscounted: product.discount > 0 });
    }
    renderCart();
};

window.updateQty = function(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    renderCart();
};

window.prosesTransaksi = function() {
    const bayar = parseFloat(document.getElementById('inputBayar').value) || 0;
    if (bayar < totalBelanjaGlobal) return alert("Uang tidak cukup!");

    // Simpan ke laporan
    const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    laporanHarian.totalOmzet += totalBelanjaGlobal;
    laporanHarian.jumlahTransaksi += 1;
    laporanHarian.riwayat.unshift({ jam: waktu, total: totalBelanjaGlobal });
    localStorage.setItem('laporan_pos', JSON.stringify(laporanHarian));

    // Reset
    alert("Transaksi Berhasil!");
    cart = [];
    renderCart();
    closeModal();
};

// 4. FUNGSI MODAL & LAPORAN
window.openModal = function() {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    document.getElementById('modalBayar').classList.remove('hidden');
    document.getElementById('modalTotal').innerText = `Rp ${totalBelanjaGlobal.toLocaleString('id-ID')}`;
    document.getElementById('inputBayar').focus();
};

window.closeModal = function() {
    document.getElementById('modalBayar').classList.add('hidden');
};

window.bukaLaporan = function() {
    document.getElementById('modalLaporan').classList.remove('hidden');
    document.getElementById('repOmzet').innerText = `Rp ${laporanHarian.totalOmzet.toLocaleString('id-ID')}`;
    document.getElementById('repTransaksi').innerText = laporanHarian.jumlahTransaksi;
    
    const listRiwayat = document.getElementById('listRiwayat');
    listRiwayat.innerHTML = laporanHarian.riwayat.map(item => `
        <div class="flex justify-between p-2 bg-gray-50 rounded-lg">
            <span class="text-gray-500">${item.jam}</span>
            <span class="font-bold text-gray-700">Rp ${item.total.toLocaleString('id-ID')}</span>
        </div>
    `).join('');
};

window.tutupLaporan = function() {
    document.getElementById('modalLaporan').classList.add('hidden');
};

// 5. SCANNER
window.toggleScanner = function() {
    const container = document.getElementById('scannerContainer');
    if (!scannerActive) {
        container.classList.remove('hidden');
        html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, 
            (decodedText) => {
                const product = products.find(p => p.barcode === decodedText);
                if (product) {
                    addToCart(product);
                    if (navigator.vibrate) navigator.vibrate(100);
                }
            }
        ).catch(err => alert("Gagal akses kamera: " + err));
        scannerActive = true;
    } else {
        html5QrCode.stop().then(() => {
            container.classList.add('hidden');
            scannerActive = false;
        });
    }
};

// Inisialisasi awal
document.addEventListener('DOMContentLoaded', renderCart);
