async function initDoTrackingComponent() {
    const templateHTML = await ApiService.fetchTemplate('./templates/do-tracking.html');

    Vue.component('ba-do-tracking', {
        template: templateHTML,
        props: {
            initialTracking: { type: Array, required: true },
            paketList: { type: Array, required: true },
            pengirimanList: { type: Array, required: true }
        },
        data() {
            return {
                // Konversi struktur objek baru agar kompatibel dengan form dan template UI
                trackingList: this.normalizeTrackingData(this.initialTracking),
                searchQuery: '',
                activeQuery: '',
                newProgressText: {},
                formDO: { noDO: '', nim: '', nama: '', ekspedisi: '', paket: '', tanggalKirim: '', total: 0 }
            };
        },
        mounted() {
            this.generateNextDONumber();
            this.setDefaultDate();
        },
        computed: {
            searchResults() {
                if (!this.activeQuery) return this.trackingList;
                const query = this.activeQuery.toLowerCase().trim();
                return this.trackingList.filter(item => 
                    item.noDO.toLowerCase().includes(query) || item.nim.toLowerCase().includes(query)
                );
            },
            selectedPaketDetail() { return this.paketList.find(p => p.kode === this.formDO.paket) || null; },
            computedHargaPaket() {
                if (this.selectedPaketDetail) {
                    this.formDO.total = this.selectedPaketDetail.harga;
                    return this.selectedPaketDetail.harga;
                }
                this.formDO.total = 0;
                return 0;
            }
        },
        filters: {
            formatRupiah(val) { return !val ? 'Rp 0' : 'Rp ' + val.toLocaleString('id-ID'); },
            formatTanggalIndo(dateStr) {
                if (!dateStr) return '-';
                const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return dateStr;
                return `${d.getDate()} ${bulanIndo[d.getMonth()]} ${d.getFullYear()}`;
            }
        },
        methods: {
            normalizeTrackingData(rawList) {
                // Mengubah format { "DO2025-0001": { nim: ... } } menjadi flattened object { noDO: "DO2025-0001", nim: ... }
                return rawList.map(obj => {
                    const noDO = Object.keys(obj)[0];
                    if (noDO && obj[noDO]) {
                        return {
                            noDO: noDO,
                            ...obj[noDO]
                        };
                    }
                    return obj;
                });
            },
            executeSearch() { this.activeQuery = this.searchQuery; },
            clearSearch() { this.searchQuery = ''; this.activeQuery = ''; },
            getEkspedisiName(kode) {
                const exp = this.pengirimanList.find(x => x.kode === kode);
                return exp ? exp.nama : kode;
            },
            getCurrentTimestamp() {
                const now = new Date();
                const pad = (num) => String(num).padStart(2, '0');
                return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
            },
            generateNextDONumber() {
                const currentYear = new Date().getFullYear();
                const prefix = `DO${currentYear}-`;
                let maxSeq = 0;
                this.trackingList.forEach(item => {
                    if (item.noDO && item.noDO.startsWith(prefix)) {
                        const seq = parseInt(item.noDO.replace(prefix, ""), 10);
                        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
                    }
                });
                this.formDO.noDO = `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
            },
            setDefaultDate() {
                const now = new Date();
                this.formDO.tanggalKirim = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            },
            addTrackingProgress(doItem) {
                const txt = this.newProgressText[doItem.noDO];
                if (!txt || !txt.trim()) { alert('Keterangan milestone logistik wajib diisi.'); return; }
                doItem.perjalanan.push({ waktu: this.getCurrentTimestamp(), keterangan: txt.trim() });
                Vue.set(this.newProgressText, doItem.noDO, '');
            },
            saveNewDO() {
                if (!this.formDO.nim || !this.formDO.nama || !this.formDO.ekspedisi || !this.formDO.paket) {
                    alert('Deployment Cancelled: Mandatory form entity elements are undefined.');
                    return;
                }
                const payload = {
                    ...this.formDO,
                    status: 'Dalam Perjalanan',
                    perjalanan: [{ waktu: this.getCurrentTimestamp(), keterangan: `Logistics Manifest Waybill Deployed Core Center.` }]
                };
                this.trackingList.push(payload);
                alert(`Deployment Node Processed Successfully: ${payload.noDO}`);
                this.formDO = { noDO: '', nim: '', nama: '', ekspedisi: '', paket: '', tanggalKirim: '', total: 0 };
                this.generateNextDONumber(); this.setDefaultDate();
            }
        }
    });
}