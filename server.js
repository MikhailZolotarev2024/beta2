require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const app = express();
app.use(cors());
app.use(express.json());

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const PDF_TEMPLATE_PATH = './0C0B651DCDEE.pdf';

function isValidAddress(address) {
  return typeof address === 'string' && address.length === 42 && address.startsWith('0x');
}

function charToNum(ch) {
  if (/\d/.test(ch)) return parseInt(ch, 10);
  if (/[a-f]/.test(ch)) return ch.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
  return 0;
}

function calcRiskScore(address, balanceEth) {
  if (balanceEth === 0) return 0;
  const first = charToNum(address[2]);
  const last = charToNum(address[address.length - 1]);
  const sum = first + last;
  const digit = sum % 10;
  if (digit < 5) return 5;
  return digit;
}

app.post('/check', async (req, res) => {
  try {
    const { address } = req.body;
    if (!isValidAddress(address)) {
      return res.status(400).json({ error: 'Некорректный адрес' });
    }

    // Запрос баланса
    const balanceResp = await fetch(`https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=eth`, {
      headers: { 'X-API-Key': MORALIS_API_KEY }
    });
    if (!balanceResp.ok) throw new Error('Ошибка Moralis balance');
    const balanceData = await balanceResp.json();
    const balanceEth = parseFloat((parseInt(balanceData.balance) / 1e18).toFixed(6));

    // Запрос основной инфы
    const infoResp = await fetch(`https://deep-index.moralis.io/api/v2.2/${address}?chain=eth`, {
      headers: { 'X-API-Key': MORALIS_API_KEY }
    });
    if (!infoResp.ok) throw new Error('Ошибка Moralis info');
    const infoData = await infoResp.json();
    const txCount = infoData.transaction_count || 0;
    const firstSeen = infoData.first_seen || '-';
    const lastSeen = infoData.last_seen || '-';

    // Risk score
    const riskScore = calcRiskScore(address, balanceEth);
    const riskPercent = `${riskScore * 10}%`;
    let riskLevel = '';
    let riskColor = rgb(1, 0, 0); // красный по умолчанию
    if (riskScore === 0) {
      riskLevel = '';
    } else if (riskScore < 7) {
      riskLevel = 'Medium Risk';
      riskColor = rgb(1, 0.5, 0); // оранжевый
    } else {
      riskLevel = 'High Risk';
      riskColor = rgb(1, 0, 0); // красный
    }

    // Генерация PDF
    const pdfBytes = fs.readFileSync(PDF_TEMPLATE_PATH);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.getPages()[0];

    // ETH Address
    page.drawText(address, { x: 100, y: 662, size: 12, font: helveticaFont, color: rgb(0,0,0) });
    // Баланс
    page.drawText(balanceEth.toString(), { x: 100, y: 642, size: 12, font: helveticaFont, color: rgb(0,0,0) });
    // Кол-во транзакций
    page.drawText(txCount.toString(), { x: 100, y: 520, size: 12, font: helveticaFont, color: rgb(0,0,0) });
    // Первая транзакция
    page.drawText(firstSeen, { x: 240, y: 602, size: 12, font: helveticaFont, color: rgb(0,0,0) });
    // Последняя транзакция
    page.drawText(lastSeen, { x: 240, y: 582, size: 12, font: helveticaFont, color: rgb(0,0,0) });
    // Risk Score
    page.drawText(riskPercent, { x: 180, y: 705, size: 14, font: helveticaBold, color: riskScore === 0 ? rgb(0,0,0) : riskColor });
    // Уровень риска
    if (riskScore !== 0) {
      page.drawText(riskLevel, { x: 245, y: 705, size: 14, font: helveticaBold, color: riskColor });
    }

    const pdfBuffer = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.send(Buffer.from(pdfBuffer));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}); 