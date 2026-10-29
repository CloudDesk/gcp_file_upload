import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { buildInStoreInvoiceHtml } from '../build/service/inStoreInvoicePdf.service.js';

const stage = process.argv[2] || 'after';
const dir = path.resolve('.qa/quotation-borders');
fs.mkdirSync(dir, { recursive: true });
const invoice = {
  quotationnumber: 'SQ-000039', quotationdate: '2026-10-22',
  billingaddresssnapshot: { name: 'Sample Customer', address: 'AS-2, Raman Flats, Medavakkam', city: 'Chennai', state: 'Tamil Nadu', pincode: 600100 },
  invoicedata: { items: [{ name: 'Acer Laptop', quantity: 1, unitPrice: 45000, hsncode: '84713010', totalamount: 45000 }], subtotal: 45000, taxablevalue: 45000, tax: 18, taxmode: 'cgst_sgst', cgst: 4050, sgst: 4050, total: 53100 },
};
if (stage.includes('service')) {
  delete invoice.quotationnumber;
  invoice.invoicenumber = 'SERVICE-QA';
  invoice.servicedata = { items: [{ description: 'Laptop repair', quantity: 1, price: 1000, saccode: '998714', totalamount: 1000 }], total: 1180, taxamount: 180, taxcomponents: [{ label: 'CGST Amount (9%)', amount: 90 }, { label: 'SGST Amount (9%)', amount: 90 }] };
  invoice.totalorderamount = 54280;
}
if (stage.includes('multipage')) invoice.invoicedata.items = Array.from({ length: 35 }, (_, i) => ({ ...invoice.invoicedata.items[0], name: `Laptop ${i + 1}` }));
if (stage.includes('instore')) {
  delete invoice.quotationnumber;
  invoice.invoicenumber = 'TEQIT-Invoice-00379';
  invoice.customername = invoice.billingaddresssnapshot.name;
  invoice.customeraddress = 'AS-2, Raman Flats, Medavakkam, Chennai, Tamil Nadu, 600100';
  delete invoice.billingaddresssnapshot;
  invoice.invoicedata.placeofsupply = 'Tamil Nadu';
}
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const options = { documentType: stage.includes('service') ? 'service' : stage.includes('instore') ? 'invoice' : 'quotation', ...(stage.includes('instore') ? { placeOfSupplyText: 'Same as billing' } : {}) };
  const html = buildInStoreInvoiceHtml(invoice, options);
  if (stage.includes('instore') && !html.includes('<td class="center">Same as billing</td>')) throw new Error('In-store place of supply did not match');
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: path.join(dir, `${stage}.pdf`), printBackground: true, preferCSSPageSize: true });
  console.log(path.join(dir, `${stage}.pdf`));
} finally { await browser.close(); }
