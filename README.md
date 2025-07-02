# http-helper-api Node.js

Minimalis dan fleksibel: helper HTTP untuk Node.js tanpa dependency eksternal.  
Mendukung semua kebutuhan umum request — mirip `axios`, tapi jauh lebih ringan.

---

## 🚀 Fitur Utama

- ✅ Mendukung semua method: `GET`, `POST`, `PUT`, `DELETE`, dll
- ✅ Support full URL atau `{ hostname, path }`
- ✅ Auto handle `query: {}` → ?key=value
- ✅ Body support: `JSON`, `form-urlencoded`
- ✅ Otomatis parsing JSON berdasarkan Content-Type
- ✅ `onlyBody: true` → langsung dapat isi response
- ✅ `responseType: 'buffer'` untuk download file (image, PDF, ZIP, dll)
- ✅ `requestStream()` → untuk streaming besar seperti video / download
- ✅ `outputFile` → auto simpan file ke disk
- ✅ `timeout`, `rejectUnauthorized`, dan headers custom

---

## 📦 Instalasi

```bash
npm install github:awenk/http-helper-api
```
Atau
```bash
npm install git+https://github.com/awenk/http-helper-api.git
```

##📚  Penggunaan

🔹 request(url, options)<br>
Kirim request dan dapatkan { `statusCode`, `headers`, `body` }.
```js
const { request } = require('@awenk/http-helper-api');

const res = await request('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: { user: 'awenk' },
  query: { lang: 'id' }
});

console.log(res.statusCode); // 200
console.log(res.body);       // object hasil JSON
```
🔹 requestBodyOnly(url, options)<br>
Langsung dapat isi body saja dari response.
```js
const { requestBodyOnly } = require('@awenk/http-helper-api');

const data = await requestBodyOnly('https://api.example.com/info', {
  query: { year: 2025 }
});

console.log(data); // langsung object / array / string
```
🔹 requestStream(url, options)<br>
Kembalikan readable stream (untuk file besar) atau langsung simpan ke file jika outputFile diberikan.
```js
const fs = require('fs');
const { requestStream } = require('@awenk/http-helper-api');

// Pipe ke file manual
const stream = await requestStream('https://example.com/file.pdf');
stream.pipe(fs.createWriteStream('output.pdf'));

// Auto save ke disk
await requestStream('https://example.com/image.jpg', {
  outputFile: 'downloaded.jpg'
});
```
---

## 🧾 Opsi Lengkap
| Opsi                 | Tipe            | Keterangan                                       |
| -------------------- | --------------- | ------------------------------------------------ |
| `method`             | `string`        | HTTP method: `GET`, `POST`, dll *(default: GET)* |
| `headers`            | `object`        | Header custom, contoh `Content-Type`             |
| `body`               | `object/string` | Data yang dikirim (otomatis encode)              |
| `query`              | `object`        | Akan diubah ke `?a=1&b=2` otomatis               |
| `onlyBody`           | `boolean`       | Kalau `true`, langsung return `body`             |
| `responseType`       | `string`        | Bisa: `buffer`, `text`, `auto` *(default)*       |
| `rejectUnauthorized` | `boolean`       | Skip SSL check (gunakan hanya untuk testing!)    |
| `timeout`            | `number`        | Timeout dalam ms *(default: 10000)*              |
| `outputFile`         | `string`        | Path ke file (digunakan di `requestStream`)      |

📦 Contoh: Download File sebagai Buffer
```js
const fs = require('fs');
const { requestBodyOnly } = require('@awenk/http-helper-api');

const buffer = await requestBodyOnly('https://example.com/file.pdf', {
  responseType: 'buffer'
});

fs.writeFileSync('file.pdf', buffer);
```
📦 Contoh: Proxy Stream ke Response Express
```js
const express = require('express');
const { requestStream } = require('@awenk/http-helper-api');

const app = express();

app.get('/proxy-pdf', async (req, res) => {
  const stream = await requestStream('https://example.com/file.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  stream.pipe(res);
});
```
---

![Node.js CI](https://github.com/badueny/http-helper-api/actions/workflows/node-ci.yml/badge.svg)

🛠 Dibuat di 📍 Indonesia
📄 Lisensi
MIT License — bebas digunakan dan dimodifikasi.


