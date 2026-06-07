const ApiService = {
    async fetchBahanAjarData() {
        try {
            // Mengambil database lokal dari file json
            const response = await fetch('./data/dataBahanAjar.json');
            if (!response.ok) {
                throw new Error('Network response data failure status.');
            }
            return await response.json();
        } catch (error) {
            console.error('API Engine Exception:', error);
            throw error;
        }
    },
    
    async fetchTemplate(path) {
        try {
            // Membantu memuat file template HTML eksternal secara dinamis
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Template not found: ${path}`);
            return await response.text();
        } catch (error) {
            console.error('Template Engine Exception:', error);
            throw error;
        }
    }
};