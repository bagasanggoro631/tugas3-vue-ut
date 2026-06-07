// Menginisialisasi komponen secara asinkron dengan memanggil template HTML eksternal
async function initStockTableComponent() {
    const templateHTML = await ApiService.fetchTemplate('./templates/stock-table.html');

    Vue.component('ba-stock-table', {
        template: templateHTML,
        props: {
            initialStok: { type: Array, required: true },
            upbjjList: { type: Array, required: true },
            kategoriList: { type: Array, required: true }
        },
        data() {
            return {
                stokList: [...this.initialStok],
                filterUPBJJ: '',
                filterKategori: '',
                filterAlertStock: false,
                sortBy: 'judul',
                isEditMode: false,
                form: { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: '' },
                tooltip: { visible: false, top: 0, left: 0, content: '' }
            };
        },
        watch: {
            filterUPBJJ(newVal) {
                if (!newVal) this.filterKategori = '';
            }
        },
        computed: {
            processedStok() {
                let result = [...this.stokList];
                if (this.filterUPBJJ) result = result.filter(item => item.upbjj === this.filterUPBJJ);
                if (this.filterKategori) result = result.filter(item => item.kategori === this.filterKategori);
                if (this.filterAlertStock) result = result.filter(item => item.qty < item.safety || item.qty === 0);
                
                result.sort((a, b) => {
                    if (this.sortBy === 'judul') return a.judul.localeCompare(b.judul);
                    return a[this.sortBy] - b[this.sortBy];
                });
                return result;
            }
        },
        filters: {
            formatRupiah(val) { return !val ? 'Rp 0' : 'Rp ' + val.toLocaleString('id-ID'); },
            formatSatuanBuah(val) { return (val || 0) + ' buah'; }
        },
        methods: {
            getStatusText(item) {
                if (item.qty === 0) return 'Kosong';
                return item.qty < item.safety ? 'Menipis' : 'Aman';
            },
            getStatusClass(item) {
                if (item.qty === 0) return 'badge-danger';
                return item.qty < item.safety ? 'badge-warning' : 'badge-success';
            },
            showTooltip(item, event) {
                this.tooltip.content = item.catatanHTML || '<em>No Context Meta</em>';
                this.tooltip.top = event.pageY + 15;
                this.tooltip.left = event.pageX + 15;
                this.tooltip.visible = true;
            },
            hideTooltip() { this.tooltip.visible = false; },
            resetFilters() {
                this.filterUPBJJ = ''; this.filterKategori = ''; this.filterAlertStock = false; this.sortBy = 'judul';
            },
            clearForm() {
                this.isEditMode = false;
                this.form = { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: '' };
            },
            saveForm() {
                if (!this.form.kode || !this.form.judul || !this.form.kategori || !this.form.upbjj) {
                    alert('Validation Failure: Missing essential object keys.');
                    return;
                }
                if (this.isEditMode) {
                    const idx = this.stokList.findIndex(x => x.kode === this.form.kode);
                    if (idx !== -1) Vue.set(this.stokList, idx, { ...this.form });
                } else {
                    if (this.stokList.some(x => x.kode === this.form.kode)) {
                        alert('Duplicate ID key exception.');
                        return;
                    }
                    this.stokList.push({ ...this.form });
                }
                this.clearForm();
            },
            selectEdit(item) { this.isEditMode = true; this.form = { ...item }; },
            deleteItem(item) {
                if (confirm(`Wipe asset data structural instance: ${item.judul}?`)) {
                    this.stokList = this.stokList.filter(x => x.kode !== item.kode);
                }
            }
        }
    });
}