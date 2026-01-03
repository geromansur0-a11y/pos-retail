// Data Produk
const products = [
    { id: 1, barcode: '123', name: 'Aqua 600ml', price: 3500, category: 'Minuman', discount: 0 },
    { id: 2, barcode: '456', name: 'Chitato Sapi', price: 11500, category: 'Snack', discount: 10 },
    { id: 3, barcode: '789', name: 'Beras 1kg', price: 15000, category: 'Sembako', discount: 0 }
];

let cart = [];
let totalBelanja = 0;
let scannerActive = false;
let html5QrCode;

// Load Laporan
let laporan = JSON.parse(localStorage.getItem('laporan_pos')) || { totalOmzet: 0, jumlahTransaksi: 0, riwayat: [] };

// FUNGSI GLOBAL
window.renderCart = function() {
    const list = document.getElementById('cartList');
    list.innerHTML = '';
    let total = 0;
    let items = 0;

    cart.forEach((item, index) => {
        const priceFinal = item.price - (item.price * item.discount / 100);
        total += priceFinal * item.qty;
        items += item.qty;
        list.innerHTML += `
            <div class="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border-l-4 border-blue-500">
                <div>
                    <h3 class="font-bold">${item.name}</h3>
                    <p class="text-blue-600 font-bold text-sm">Rp ${priceFinal.toLocaleString()}</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="window.updateQty(${index}, -1)" class="w-8 h-8 bg-gray-100 rounded-full">-</button>
                    <span>${item.qty}</span>
                    <button onclick="window.updateQty(${index}, 1)" class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full">+</button>
                </div>
            </div>`;
    });
    totalBelanja = total;
    document.getElementById('totalPrice').innerText = `Rp ${total.toLocaleString()}`;
    document.getElementById('totalItems').innerText = `Total Item (${items})`;
};

window.updateQty = function(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    window.renderCart();
};

window.openModal = function() {
    if (cart.length === 0) return alert("Keranjang kosong");
    document.getElementById('modalBayar').classList.remove('hidden');
    document.getElementById('inputBayar').focus();
};

window.closeModal = function() {
    document.getElementById('modalBayar').classList.add('hidden');
};

window.hitungKembalian = function() {
    const bayar = document.getElementById('inputBayar').value || 0;
    const kembali = bayar - totalBelanja;
    const txt = document.getElementById('textKembalian');
    txt.innerText = `Rp ${kembali.toLocaleString()}`;
    txt.style.color = kembali < 0 ? 'red' : 'green';
};

window.prosesTransaksi = function() {
    const bayar = document.getElementById('inputBayar').value || 0;
    if (bayar < totalBelanja) return alert("Uang kurang");

    // Simpan Laporan
    laporan.totalOmzet += totalBelanja;
    laporan.jumlahTransaksi += 1;
    laporan.riwayat.unshift({ jam: new Date().toLocaleTimeString(), total: totalBelanja });
    localStorage.setItem('laporan_pos', JSON.stringify(laporan));

    alert("Transaksi Berhasil!");
    cart = [];
    window.renderCart();
    window.closeModal();
};

window.bukaLaporan = function() {
    document.getElementById('modalLaporan').classList.remove('hidden');
    document.getElementById('repOmzet').innerText = `Rp ${laporan.totalOmzet.toLocaleString()}`;
    document.getElementById('repTransaksi').innerText = laporan.jumlahTransaksi;
    document.getElementById('listRiwayat').innerHTML = laporan.riwayat.map(r => `
        <div class="flex justify-between text-sm border-b pb-1">
            <span>${r.jam}</span><b>Rp ${r.total.toLocaleString()}</b>
        </div>`).join('');
};

window.tutupLaporan = function() {
    document.getElementById('modalLaporan').classList.add('hidden');
};

window.resetLaporan = function() {
    if(confirm("Hapus laporan?")) {
        laporan = { totalOmzet: 0, jumlahTransaksi: 0, riwayat: [] };
        localStorage.setItem('laporan_pos', JSON.stringify(laporan));
        window.bukaLaporan();
    }
};

window.toggleScanner = function() {
    const container = document.getElementById('scannerContainer');
    if (!scannerActive) {
        container.classList.remove('hidden');
        html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (txt) => {
            const p = products.find(i => i.barcode === txt);
            if (p) {
                const exist = cart.find(c => c.id === p.id);
                if (exist) exist.qty++; else cart.push({...p, qty: 1});
                window.renderCart();
            }
        });
        scannerActive = true;
    } else {
        html5QrCode.stop().then(() => { container.classList.add('hidden'); scannerActive = false; });
    }
};

// Start
window.renderCart();
