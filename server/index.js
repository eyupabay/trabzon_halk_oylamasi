const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const dataFile = path.join(__dirname, "data.json");


// Form verilerini url kodlu göndermeyi destekle (POSTing)
app.use(express.urlencoded({extended:true}));

// Cors aktif etme
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    next();
});

app.get("/poll", async (req, res) => {
    // data : oylamadaki şıklar ve sayı bilgileri
    // toplamOy : oylamada kullanılan oy sayısı
    // secenek : olan şıklar
    // oy : o seçeneğe ait olan oy
    // yuzdelik 

    let data = JSON.parse(await fs.readFile(dataFile, "utf-8"));
    const toplamOy = Object.values(data).reduce((toplam, n) => toplam += n, 0);
    
    data = Object.entries(data).map(([secenek, oy]) => {
        return {
            secenek,
            yuzdelik : (((100 * oy ) / toplamOy) || 0).toFixed(0)
        }
    });

app.post("/poll", async (req, res) => {
    const data = JSON.parse(await fs.readFile(dataFile, "utf-8"));

    data[req.body.add]++;

    await fs.writeFile(dataFile, JSON.stringify(data));

    res.end();
});

    console.log((data));

    res.json(data);
});

app.listen(3000, () => console.log("Server çalışıyor..."));
