document.addEventListener('DOMContentLoaded', function () {
    var headerCarousel = new bootstrap.Carousel(document.querySelector('#headerCarousel'), {
        interval: 3000, // Ganti slide setiap 3 detik
        ride: 'carousel'
    });

    // Redirect to login page if not logged in and trying to access a restricted page
    const restrictedPages = ['transaksi.html', 'daftarTransaksi.html', 'profil.html'];
    const currentPage = window.location.pathname.split('/').pop();
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn && restrictedPages.includes(currentPage)) {
        localStorage.setItem('redirectUrl', currentPage);
        window.location.href = 'login.html';
    }

    // Hide navbar on login page
    if (currentPage === 'login.html') {
        document.querySelector('nav').style.display = 'none';
    }

    // Tambahkan logika untuk halaman transaksi
    const urlParams = new URLSearchParams(window.location.search);
    const product = urlParams.get('product');
    const price = parseFloat(urlParams.get('price'));

    if (product && price) {
        document.getElementById('produk').value = product;
        document.getElementById('harga').value = formatRupiah(price);
    }

    document.getElementById('jumlah').addEventListener('input', function () {
        const jumlah = this.value;
        if (jumlah > 99) {
            alert('Jumlah yang anda masukan diatas 100 terlalu banyak');
            this.value = 99;
            return;
        }
        const totalHarga = jumlah * price;
        document.getElementById('totalHarga').value = formatRupiah(totalHarga);
        const nama = document.getElementById('nama').value;
        document.getElementById('namaTransaksi').value = `${nama} membeli ${product} total Rp ${formatRupiah(totalHarga)}`;
        generateKodeTransaksi(nama, product);
    });

    document.getElementById('nama').addEventListener('input', function () {
        const nama = this.value;
        const jumlah = document.getElementById('jumlah').value;
        const totalHarga = jumlah * price;
        document.getElementById('namaTransaksi').value = `${nama} membeli ${product} total Rp ${formatRupiah(totalHarga)}`;
        generateKodeTransaksi(nama, product);
    });

    document.getElementById('transaksiForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const inputs = document.querySelectorAll('#transaksiForm input, #transaksiForm textarea');
        for (let input of inputs) {
            if (!input.value) {
                alert('Semua field harus diisi!');
                return;
            }
        }
        const transaksi = {
            kodeTransaksi: document.getElementById('kodeTransaksi').value,
            nama: document.getElementById('nama').value,
            produk: document.getElementById('produk').value,
            harga: document.getElementById('harga').value,
            jumlah: document.getElementById('jumlah').value,
            alamat: document.getElementById('alamat').value,
            namaTransaksi: document.getElementById('namaTransaksi').value,
            totalHarga: document.getElementById('totalHarga').value
        };
        saveTransaksi(transaksi);
        window.location.href = 'daftarTransaksi.html';
    });

    function generateKodeTransaksi(nama, produk) {
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const kodeTransaksi = `${nama.charAt(0)}${produk.charAt(produk.length - 1)}${randomNum}`;
        document.getElementById('kodeTransaksi').value = kodeTransaksi;
    }

    function formatRupiah(angka) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    }

    function saveTransaksi(transaksi) {
        let transaksiList = JSON.parse(localStorage.getItem('transaksiList')) || [];
        transaksiList.push(transaksi);
        localStorage.setItem('transaksiList', JSON.stringify(transaksiList));
    }

    function loadTransaksi() {
        let transaksiList = JSON.parse(localStorage.getItem('transaksiList')) || [];
        const transaksiTableBody = document.getElementById('transaksiTableBody');
        transaksiTableBody.innerHTML = ''; // Hapus data sebelumnya
        let totalKeseluruhan = 0;

        transaksiList.forEach((transaksi, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${transaksi.kodeTransaksi}</td>
                <td>${transaksi.nama}</td>
                <td>${transaksi.produk}</td>
                <td>${transaksi.harga}</td>
                <td>${transaksi.jumlah}</td>
                <td>${transaksi.alamat}</td>
                <td>${transaksi.namaTransaksi}</td>
                <td>${transaksi.totalHarga}</td>
                <td><button class="btn btn-danger btn-sm" onclick="hapusTransaksi(${index})"><i class="fas fa-trash-alt"></i></button></td>
            `;
            transaksiTableBody.appendChild(row);

            // Tambahkan totalHarga ke totalKeseluruhan
            const totalHargaNumeric = parseFloat(transaksi.totalHarga.replace(/[^0-9.-]+/g, ""));
            totalKeseluruhan += isNaN(totalHargaNumeric) ? 0 : totalHargaNumeric;
        });

        // Tampilkan total keseluruhan dengan format Rupiah
        document.getElementById('totalKeseluruhan').innerText = formatRupiah(totalKeseluruhan);
    }

    if (document.getElementById('transaksiTableBody')) {
        loadTransaksi();
    }

    // Tampilkan tombol logout jika sudah login
    if (isLoggedIn === 'true') {
        const navbarRight = document.querySelector('.navbar-right');
        navbarRight.innerHTML = '<button class="btn btn-outline-light" type="button" onclick="logout()">Logout</button>';
    }
});

function addToCart(product, price) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        localStorage.setItem('produk', product);
        localStorage.setItem('harga', price);
        window.location.href = 'transaksi.html';
    } else {
        localStorage.setItem('redirectUrl', 'transaksi.html');
        alert('Anda harus login terlebih dahulu.');
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('transaksiList'); // Reset transaction data
    clearTransactionTable(); // Clear transaction table
    window.location.href = 'index.html';
}

function clearTransactionTable() {
    if (document.getElementById('transaksiTableBody')) {
        document.getElementById('transaksiTableBody').innerHTML = '';
        document.getElementById('totalKeseluruhan').innerText = '';
    }
}

// Clear transaction table on the transaction list page
if (document.getElementById('transaksiTableBody')) {
    clearTransactionTable();
}
