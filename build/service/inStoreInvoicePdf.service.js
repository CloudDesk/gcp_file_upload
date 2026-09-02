import fs from "fs";
import path from "path";
const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
const parseJsonObject = (value) => {
    if (!value)
        return {};
    if (typeof value === "object" && !Array.isArray(value))
        return value;
    try {
        const parsed = JSON.parse(String(value));
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? parsed
            : {};
    }
    catch {
        return {};
    }
};
const firstText = (...values) => {
    for (const value of values) {
        const text = String(value ?? "").trim();
        if (text)
            return text;
    }
    return "";
};
const numericValue = (value) => {
    const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
};
// Formats any raw amount (number, "₹1234", "1,234.5", etc.) into the
// Indian-locale grouped format with a fixed 2-decimal-place amount,
// e.g. 102750 -> "1,02,750.00", 9247.5 -> "9,247.50".
const formatAmount = (value) => numericValue(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const percentageValue = (value) => {
    const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
};
const formatRate = (value) => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
const formatAddress = (address) => address
    ? [
        address.doornumber,
        address.address,
        address.landmark,
        address.city,
        address.state,
        address.pincode,
    ]
        .map((part) => String(part ?? "").trim())
        .filter(Boolean)
        .join(", ")
    : "";
const formatInvoiceDate = (value) => {
    if (!value)
        return "";
    const textValue = String(value).trim();
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(textValue)) {
        return textValue.replace(/\//g, "-");
    }
    const numeric = Number(textValue);
    const date = Number.isFinite(numeric)
        ? new Date(numeric > 10000000000 ? numeric : numeric * 1000)
        : new Date(textValue);
    if (Number.isNaN(date.getTime()))
        return textValue;
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    })
        .format(date)
        .replace(/\//g, "-");
};
const assetDataUri = (filename, mimeType) => {
    const assetPath = path.resolve(process.cwd(), "asset", filename);
    const bytes = fs.readFileSync(assetPath);
    return `data:${mimeType};base64,${bytes.toString("base64")}`;
};
const companyPanFromGstin = (gstin) => /^[0-9A-Z]{15}$/i.test(gstin) ? gstin.slice(2, 12).toUpperCase() : "";
// Normalizes state strings for comparison ("Tamil Nadu" === "tamil  nadu").
const normalizeForCompare = (value) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
export const buildInStoreInvoiceHtml = (invoice, options = {}) => {
    const invoiceData = parseJsonObject(invoice?.invoicedata ?? invoice?.quotationdata);
    const billingAddress = parseJsonObject(invoice?.billingaddresssnapshot);
    const items = Array.isArray(invoiceData?.items)
        ? invoiceData.items
        : Array.isArray(invoice?.itemdata)
            ? invoice.itemdata
            : [];
    const logo = assetDataUri("Teqit_New.png", "image/png");
    const signature = assetDataUri("bilal_esign.png", "image/jpeg");
    const isQuotation = options.documentType === "quotation" ||
        Boolean(invoice?.quotationnumber) ||
        String(invoice?.quotationtype ?? "").trim().length > 0;
    const docTitle = options.title || (isQuotation ? "QUOTATION" : "TAX INVOICE");
    const docNumberLabel = options.numberLabel || (isQuotation ? "QUOTATION NO" : "INVOICE NO");
    const docDateLabel = options.dateLabel || (isQuotation ? "QUOTATION DATE" : "DATE");
    const docNumber = firstText(invoice?.quotationnumber, invoice?.invoicenumber, invoice?.id ? `#${invoice.id}` : "");
    const docDate = formatInvoiceDate(invoice?.quotationdate ?? invoice?.invoicedate ?? invoice?.createddate);
    const companyName = firstText(invoice?.companyname, "Rev0365 Global Private Limited (TEQIT)");
    const companyAddress = firstText(invoice?.companyaddress, "Chennai");
    const companyGstin = firstText(invoice?.gstnumber, "23ASDFM0125PAZ1");
    const companyPan = firstText(invoice?.companypan, companyPanFromGstin(companyGstin), "ASDFM0125P");
    const odAccountNumber = firstText(invoice?.odaccountnumber, "00000044015545872");
    const ifscCode = firstText(invoice?.ifsc, "SBIN0013241");
    const branch = firstText(invoice?.branch, "SBI Egmore");
    const customerName = firstText(billingAddress?.name, invoice?.customername);
    const customerAddress = firstText(formatAddress(billingAddress), invoice?.customeraddress);
    const customerPhone = firstText(billingAddress?.mobilenumber, invoice?.customerphonenumber, invoice?.customermobilenumber);
    const customerGstin = firstText(invoice?.customergstnumber);
    // Place of supply: if the supply state matches the billing address state,
    // show "Same as billing" (matches the master reference) instead of
    // repeating the state name.
    const suppliedPlaceState = firstText(invoiceData?.placeofsupply, invoice?.customertaxstate);
    const billingState = firstText(billingAddress?.state);
    const placeOfSupply = suppliedPlaceState && billingState &&
        normalizeForCompare(suppliedPlaceState) === normalizeForCompare(billingState)
        ? "Same as billing"
        : firstText(suppliedPlaceState, billingState, "Same as billing");
    const totalTaxRate = percentageValue(items[0]?.taxpercent ?? invoiceData?.tax);
    const taxMode = firstText(invoiceData?.taxmode).toLowerCase();
    const isIgst = taxMode === "igst" || numericValue(invoiceData?.igst) > 0;
    const firstTaxLabel = isIgst
        ? `ADD IGST ${formatRate(totalTaxRate)}%`
        : `ADD CGST ${formatRate(totalTaxRate / 2)}%`;
    const secondTaxLabel = `ADD SGST ${formatRate(totalTaxRate / 2)}%`;
    const firstTaxAmount = isIgst ? invoiceData?.igst : invoiceData?.cgst;
    const secondTaxAmount = invoiceData?.sgst;
    const roundOffAmount = numericValue(invoiceData?.roundoffamount);
    const itemRows = items.length
        ? items
            .map((item) => `
            <tr class="item-row">
              <td>
                <strong>${escapeHtml(firstText(item?.name, item?.description, "Product"))}</strong>
                <div class="item-detail">Qty: ${escapeHtml(item?.quantity ?? 1)} &times; ₹${escapeHtml(formatAmount(item?.unitPrice ?? item?.mrp ?? 0))}</div>
              </td>
              <td class="center">${escapeHtml(firstText(item?.hsncode, "-"))}</td>
              <td class="money-cell"><div class="money"><span>₹</span><span>${escapeHtml(formatAmount(item?.totalamount))}</span></div></td>
            </tr>`)
            .join("")
        : `<tr class="item-row"><td>No invoice items</td><td class="center">-</td><td class="money-cell"><div class="money"><span>₹</span><span>0.00</span></div></td></tr>`;
    const taxRows = `
    <div class="summary-row">
      <span>${escapeHtml(firstTaxLabel)}</span>
      <span></span>
      <span class="money"><span>₹</span><strong>${escapeHtml(formatAmount(firstTaxAmount))}</strong></span>
    </div>
    ${isIgst
        ? ""
        : `<div class="summary-row"><span>${escapeHtml(secondTaxLabel)}</span><span></span><span class="money"><span>₹</span><strong>${escapeHtml(formatAmount(secondTaxAmount))}</strong></span></div>`}
    ${roundOffAmount === 0
        ? ""
        : `<div class="summary-row"><span>ROUND OFF</span><span></span><span class="money"><span>₹</span><strong>${escapeHtml(formatAmount(invoiceData?.roundoffamount))}</strong></span></div>`}`;
    return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <style>
        /* A5 to match the actual page.pdf() render size below. NOTE: when
           preferCSSPageSize is true, Puppeteer uses THIS size, not the
           format option passed to page.pdf() — the two must match or the
           PDF renders at the wrong (much larger) physical size. */
        @page { size: A5; margin: 8mm 7mm 8mm; }
        * { box-sizing: border-box; }
        html, body { min-height: 194mm; margin: 0; padding: 0; color: #111; font-family: "Times New Roman", "Noto Serif", serif; font-size: 12.5px; }
        .invoice { width: 100%; min-height: 194mm; border: 1.5px solid #111; display: flex; flex-direction: column; }
        .title { border-bottom: 1.5px solid #111; text-align: center; font-weight: 700; font-size: 16px; line-height: 21px; }
        .company { position: relative; min-height: 30mm; border-bottom: 1.4px solid #111; padding: 3mm 4mm 3mm 36mm; display: flex; align-items: center; justify-content: center; text-align: center; }
        .logo { position: absolute; left: 8mm; top: 5mm; width: 25mm; height: 19mm; object-fit: contain; }
        .company-name { font-size: 16px; font-weight: 700; line-height: 1.2; }
        .company-address { font-size: 13px; margin-top: 0.7mm; white-space: pre-line; }
        .company-gstin { font-size: 15px; font-weight: 700; margin-top: 0.7mm; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border-right: 1.3px solid #111; border-bottom: 1.3px solid #111; padding: 1.3mm 1mm; vertical-align: top; overflow-wrap: anywhere; }
        th:last-child, td:last-child { border-right: 0; }
        .meta th { height: 10mm; font-size: 14px; line-height: 1.05; text-align: left; vertical-align: middle; }
        .meta th:not(:first-child) { text-align: center; }
        .meta td { min-height: 37mm; height: 37mm; }
        .customer-cell { padding: 0; }
        .customer-layout { min-height: 37mm; height: 100%; display: flex; flex-direction: column; }
        .customer-name { flex: 0 0 auto; border-bottom: 1.3px solid #111; font-weight: 700; padding: 1.3mm 1mm; }
        .customer-details { flex: 1 1 auto; padding: 1.3mm 1mm; }
        .customer-address { white-space: pre-line; line-height: 1.35; }
        .customer-gstin { flex: 0 0 auto; border-top: 1.3px solid #111; padding: 1.3mm 1mm; text-decoration: underline; }
        .center { text-align: center; vertical-align: middle !important; }
        .invoice-value { text-align: center; vertical-align: middle !important; font-weight: 700; font-size: 13px; }
        .items thead { display: table-header-group; }
        .items th { height: 9mm; font-size: 14px; text-align: left; vertical-align: middle; }
        .items th:nth-child(2), .items th:nth-child(3) { text-align: right; }
        .item-row { break-inside: avoid; page-break-inside: avoid; }
        .item-row td { padding-top: 2mm; padding-bottom: 2mm; }
        .item-detail { margin-top: 0.8mm; color: #333; font-size: 10.5px; }
        .money-cell { vertical-align: middle; }
        .money { display: flex; justify-content: space-between; gap: 3mm; text-align: right; white-space: nowrap; }
        .closing-section { flex: 1 0 auto; min-height: 0; display: flex; flex-direction: column; break-inside: avoid; page-break-inside: avoid; }
        .summary-space, .summary { background-image: linear-gradient(to right, transparent calc(44% - .65px), #111 calc(44% - .65px), #111 calc(44% + .65px), transparent calc(44% + .65px)), linear-gradient(to right, transparent calc(65% - .65px), #111 calc(65% - .65px), #111 calc(65% + .65px), transparent calc(65% + .65px)); }
        .summary-space { flex: 1 1 0; min-height: 0; }
        .summary { min-height: 20mm; border-bottom: 1.3px solid #111; padding: 1.2mm 1mm; display: flex; flex-direction: column; break-inside: avoid; page-break-inside: avoid; }
        .tax-rows { margin-top: auto; }
        .summary-row { min-height: 6mm; display: grid; grid-template-columns: 44% 21% 35%; align-items: center; }
        .summary-row > span:first-child { padding-right: 1mm; }
        .summary-row .money { padding: 0 1mm; }
        .total { display: grid; grid-template-columns: 65% 35%; border-bottom: 1.5px solid #111; font-size: 14px; font-weight: 700; min-height: 7mm; align-items: center; }
        .total-label { text-align: center; }
        .total .money { border-left: 1.3px solid #111; height: 100%; align-items: center; padding: 0 1mm; }
        .footer { display: grid; grid-template-columns: 44% 56%; min-height: 25mm; }
        .bank { border-right: 1.3px solid #111; padding: 1mm; line-height: 1.4; }
        .authorization { padding: 1.2mm; text-align: center; }
        .signature { display: block; width: 43mm; height: 13mm; object-fit: contain; margin: 1.5mm auto 0; }
      </style>
    </head>
    <body>
      <main class="invoice">
        <div class="title">${escapeHtml(docTitle)}</div>
        <section class="company">
          <img class="logo" src="${logo}" alt="TEQIT logo" />
          <div>
            <div class="company-name">${escapeHtml(companyName)}</div>
            <div class="company-address">${escapeHtml(companyAddress)}</div>
            <div class="company-gstin">GSTIN No: ${escapeHtml(companyGstin)}</div>
          </div>
        </section>
        <table class="meta">
          <colgroup><col style="width:44%"><col style="width:21%"><col style="width:17%"><col style="width:18%"></colgroup>
          <thead><tr><th>CUSTOMER NAME</th><th>PLACE OF SUPPLY</th><th>${escapeHtml(docNumberLabel)}</th><th>${escapeHtml(docDateLabel)}</th></tr></thead>
          <tbody><tr>
            <td class="customer-cell">
              <div class="customer-layout">
                <div class="customer-name">${escapeHtml(customerName)}</div>
                <div class="customer-details">
                  <div class="customer-address">${escapeHtml(customerAddress)}</div>
                  ${customerPhone ? `<div>Phone: ${escapeHtml(customerPhone)}</div>` : ""}
                </div>
                ${customerGstin ? `<div class="customer-gstin">GSTIN NO: ${escapeHtml(customerGstin)}</div>` : ""}
              </div>
            </td>
            <td class="center">${escapeHtml(placeOfSupply)}</td>
            <td class="invoice-value">${escapeHtml(docNumber)}</td>
            <td class="invoice-value">${escapeHtml(docDate)}</td>
          </tr></tbody>
        </table>
        <table class="items">
          <colgroup><col style="width:44%"><col style="width:21%"><col style="width:35%"></colgroup>
          <thead><tr><th>DESCRIPTION</th><th>HSN CODE</th><th>AMOUNT</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <section class="closing-section">
          <div class="summary-space"></div>
          <section class="summary">
            <div class="summary-row"><span>Taxable Value</span><span></span><span class="money"><span>₹</span><strong>${escapeHtml(formatAmount(invoiceData?.taxablevalue ?? invoiceData?.subtotal))}</strong></span></div>
            <div class="tax-rows">${taxRows}</div>
          </section>
          <div class="total"><span class="total-label">Total</span><span class="money"><span>₹</span><span>${escapeHtml(formatAmount(invoiceData?.total))}</span></span></div>
          <footer class="footer">
            <div class="bank">
              ${companyPan ? `Company's PAN: ${escapeHtml(companyPan)}<br />` : ""}
              ${escapeHtml(companyName)}<br />
              ${odAccountNumber ? `OD Acc: ${escapeHtml(odAccountNumber)}<br />` : ""}
              ${ifscCode ? `IFSC Code: ${escapeHtml(ifscCode)}<br />` : ""}
              ${branch ? `Branch: ${escapeHtml(branch)}` : ""}
            </div>
            <div class="authorization">
              For ${escapeHtml(companyName)}
              <img class="signature" src="${signature}" alt="Authorised signature" />
            </div>
          </footer>
        </section>
      </main>
    </body>
  </html>`;
};
const findLocalChromePath = () => {
    const candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
    ];
    return candidates.find((candidate) => fs.existsSync(candidate)) || "";
};
export const renderInStoreInvoicePdf = async (invoice, options = {}) => {
    // @ts-ignore
    const puppeteer = await import("puppeteer-core");
    let browser;
    try {
        try {
            // @ts-ignore
            const chromium = await import("@sparticuz/chromium");
            browser = await puppeteer.default.launch({
                args: chromium.default.args,
                defaultViewport: { width: 1280, height: 900 },
                executablePath: await chromium.default.executablePath(),
                headless: true,
            });
        }
        catch {
            const executablePath = findLocalChromePath();
            if (!executablePath) {
                throw new Error("No Chrome/Chromium executable is available for in-store invoice PDF generation.");
            }
            browser = await puppeteer.default.launch({
                executablePath,
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
        }
        const page = await browser.newPage();
        await page.setContent(buildInStoreInvoiceHtml(invoice, options), { waitUntil: "networkidle0" });
        await page.evaluate(async () => {
            await Promise.all(Array.from(document.images).map((image) => image.complete
                ? Promise.resolve()
                : new Promise((resolve) => {
                    image.addEventListener("load", () => resolve(), { once: true });
                    image.addEventListener("error", () => resolve(), { once: true });
                })));
        });
        const pdf = await page.pdf({
            format: "A5",
            printBackground: true,
            preferCSSPageSize: true,
        });
        return Buffer.from(pdf);
    }
    finally {
        if (browser)
            await browser.close();
    }
};
//# sourceMappingURL=inStoreInvoicePdf.service.js.map