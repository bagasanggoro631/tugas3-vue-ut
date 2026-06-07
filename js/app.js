// Membungkus inisialisasi di dalam fungsi async utama
async function startApplication() {
    try {
        // 1. Daftarkan seluruh sub-komponen dengan memuat berkas HTML eksternalnya
        await initStockTableComponent();
        await initDoTrackingComponent();

        // 2. Luncurkan Root Instance Vue Utama
        new Vue({
            el: '#app',
            data() {
                return {
                    currentTab: 'stok',
                    loading: true,
                    theme: 'light',
                    sharedData: null
                };
            },
            async created() {
                try {
                    // Mengambil data dari API Service / file JSON eksternal
                    this.sharedData = await ApiService.fetchBahanAjarData();
                } catch (e) {
                    alert("Gagal memuat repositori data!");
                } finally {
                    this.loading = false;
                }
            },
            methods: {
                toggleTheme() {
                    this.theme = this.theme === 'light' ? 'dark' : 'light';
                    document.documentElement.setAttribute('data-theme', this.theme);
                    console.log(`System Theme Changed Live: [Mode: ${this.theme.toUpperCase()}]`);
                }
            }
        });
    } catch (error) {
        console.error("Critical Application Setup Failure:", error);
    }
}

// Jalankan program setelah seluruh berkas skrip siap
window.addEventListener('DOMContentLoaded', startApplication);