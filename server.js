// server.js - المحرك الخلفي للنظام وقاعدة البيانات
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات السحابية (رابط افتراضي للمحلي وسيتغير عند الرفع لـ Render)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/al_furqan_db";
mongoose.connect(MONGO_URI)
    .then(() => console.log("تم الاتصال بنجاح بقاعدة البيانات"))
    .catch(err => console.error("خطأ في الاتصال بقاعدة البيانات:", err));

// تعريف الهيكل البرمجي لتخزين بيانات المركز الكلية
const DataSchema = new mongoose.Schema({
    key: { type: String, default: 'al_furqan_ultimate_db' },
    data: { type: Object, required: true }
}, { timestamps: true });

const CenterData = mongoose.model('CenterData', DataSchema);

// 1. دالة جلب البيانات الكلية للنظام (لكل الهواتف)
app.get('/api/get-data', async (req, res) => {
    try {
        let record = await CenterData.findOne({ key: 'al_furqan_ultimate_db' });
        if (!record) {
            // إذا كانت قاعدة البيانات فارغة تماماً عند أول تشغيل
            return res.json(null);
        }
        res.json(record.data);
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
    }
});

// 2. دالة حفظ وتحديث البيانات الكلية لحظياً من الهواتف
app.post('/api/save-data', async (req, res) => {
    try {
        const updatedData = req.body;
        await CenterData.findOneAndUpdate(
            { key: 'al_furqan_ultimate_db' },
            { data: updatedData },
            { upsert: true, new: true }
        );
        res.json({ success: true, message: "تم الحفظ والربط بنجاح" });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء حفظ البيانات" });
    }
});

// تشغيل ملف الـ index.html مباشرة عند فتح رابط السيرفر
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// تحديد المنفذ الذكي للسيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`السيرفر يعمل الآن بنجاح على المنفذ ${PORT}`));