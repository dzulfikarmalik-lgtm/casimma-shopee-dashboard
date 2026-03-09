# Shopee Performance Dashboard

Dashboard analisis performa toko Shopee — dibangun dengan React + Recharts.

## Update Data Bulanan

Edit file **`src/data.js`** — cari tahun yang sesuai dan isi angka di index yang benar:

```
Index:  0    1    2    3    4    5    6    7    8    9    10   11
Bulan: Jan  Feb  Mar  Apr  Mei  Jun  Jul  Agu  Sep  Okt  Nov  Des
```

Contoh update April 2026 (index 3):
```js
2026: {
  revenue: [40371039, 90865216, 56510917, 25000000, null, ...],
  //                                      ^^^^^^^^ isi di sini
}
```

Gunakan `null` untuk bulan yang belum ada datanya.

## Tambah Tahun Baru

Di `src/data.js`, tambahkan entry baru di `RAW_DATA` dan tambahkan tahunnya di array `YEARS`:

```js
export const YEARS = [2023, 2024, 2025, 2026, 2027]; // tambah 2027

export const RAW_DATA = {
  // ... data lama ...
  2027: {
    revenue:      [null,null,null,...], // 12 nilai
    traffic:      [null,null,null,...],
    productViews: [null,null,null,...],
    cvrToko:      [null,null,null,...],
    aov:          [null,null,null,...],
    budgetAds:    [null,null,null,...],
    crAds:        [null,null,null,...],
    roi:          [null,null,null,...],
  },
};
```

## Deploy

Project ini terhubung ke Vercel. Setiap kali push ke GitHub, dashboard otomatis update.
