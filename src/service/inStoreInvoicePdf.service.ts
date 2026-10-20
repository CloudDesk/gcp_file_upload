import fs from "fs";
import path from "path";

const escapeHtml = (value: any) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const parseJsonObject = (value: any) => {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

const firstText = (...values: any[]) => {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
};

const numericValue = (value: any) => {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

// Formats any raw amount (number, "₹1234", "1,234.5", etc.) into the
// Indian-locale grouped format with a fixed 2-decimal-place amount,
// e.g. 102750 -> "1,02,750.00", 9247.5 -> "9,247.50".
const formatAmount = (value: any) =>
  numericValue(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Accepts 18, "18%" or a split label such as "CGST 9% + SGST 9%" (penalty
// invoices), summing every percentage it finds.
const percentageValue = (value: any) => {
  const text = String(value ?? "");
  const rates = text.match(/-?\d+(?:\.\d+)?(?=\s*%)/g);
  if (rates?.length) return rates.reduce((sum, rate) => sum + Number(rate), 0);
  const parsed = Number(text.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatRate = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

const formatAddress = (address: any) =>
  address
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

const formatInvoiceDate = (value: any) => {
  if (!value) return "";
  const textValue = String(value).trim();
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(textValue)) {
    return textValue.replace(/\//g, "-");
  }

  const numeric = Number(textValue);
  const date = Number.isFinite(numeric)
    ? new Date(numeric > 10_000_000_000 ? numeric : numeric * 1000)
    : new Date(textValue);
  if (Number.isNaN(date.getTime())) return textValue;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
    .format(date)
    .replace(/\//g, "-");
};

const assetDataUri = (filename: string, mimeType: string) => {
  const assetPath = path.resolve(process.cwd(), "asset", filename);
  const bytes = fs.readFileSync(assetPath);
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
};

// Single source of company details for every document (invoices,
// quotations, estimations), matching the consolidated invoice in the
// backend. Payload company fields are ignored so no flow can print a
// different name or GSTIN.
const COMPANY_DETAILS = {
  name: "Rev0365 Global Private Limited",
  address: "1/54,OMR,PERUNGUDI,\nChennai-600096",
  gstin: "33AAMCR5393J1ZV",
  pan: "AAMCR5393J",
  bankName: "Rev0365 Global Private Limited",
  odAccountNumber: "00000044015545872",
  ifsc: "SBIN0013241",
};

// Normalizes state strings for comparison ("Tamil Nadu" === "tamil  nadu").
const normalizeForCompare = (value: any) =>
  String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export interface DocumentRenderOptions {
  documentType?: "invoice" | "quotation" | "service" | "estimation";
  title?: string;
  numberLabel?: string;
  dateLabel?: string;
}

// One items table plus its summary and total. Invoices have one block;
// service invoices have a Product (HSN) block and a Service (SAC) block.
interface DocumentBlock {
  descriptionLabel: string;
  codeLabel: string;
  rowsHtml: string;
  summaryHtml: string;
  totalLabel: string;
  total: any;
}

const summaryRow = (label: string, amount: any) =>
  `<div class="summary-row"><span>${escapeHtml(label)}</span><span></span><span class="money"><span>₹</span><strong>${escapeHtml(formatAmount(amount))}</strong></span></div>`;

const moneyCell = (amount: any) =>
  `<td class="money-cell"><div class="money"><span>₹</span><span>${escapeHtml(formatAmount(amount))}</span></div></td>`;

// "CGST Amount (9%)" -> "ADD CGST 9%" to match the invoice tax rows.
const serviceTaxLabel = (label: any) => {
  const text = String(label ?? "").trim();
  const match = text.match(/^(\w+)\s+Amount\s*\(([^)]*)\)$/i);
  return match ? `ADD ${match[1].toUpperCase()} ${match[2]}` : `ADD ${text}`;
};

// Cost estimations carry flat product*/service* fields; reshape them into
// the service-invoice sections so both documents share the same blocks.
const estimationToServiceInvoice = (estimation: any) => {
  const isInterState = String(estimation?.taxtype ?? "").trim() === "inter_state";
  const section = (prefix: "product" | "service", rows: any) => {
    const taxAmount = numericValue(estimation?.[`${prefix}taxamount`]);
    const total = numericValue(estimation?.[`${prefix}total`]);
    const cgstAmount = Math.round((taxAmount / 2) * 100) / 100;
    return {
      items: (Array.isArray(rows) ? rows : []).map((row: any) => ({
        ...row,
        price: row?.unitprice,
      })),
      taxamount: taxAmount,
      taxcomponents: isInterState
        ? [{ label: `IGST Amount (${formatRate(numericValue(estimation?.[`${prefix}igst`]))}%)`, amount: taxAmount }]
        : [
          { label: `CGST Amount (${formatRate(numericValue(estimation?.[`${prefix}cgst`]))}%)`, amount: cgstAmount },
          { label: `SGST Amount (${formatRate(numericValue(estimation?.[`${prefix}sgst`]))}%)`, amount: Math.round((taxAmount - cgstAmount) * 100) / 100 },
        ],
      total,
      roundoffamount:
        estimation?.[`${prefix}roundoffamount`] ?? Math.round(total) - total,
      roundedtotal: Math.round(total),
    };
  };
  return {
    invoicedata: section("product", estimation?.productdata),
    servicedata: section("service", estimation?.servicedata),
    totalorderamount: estimation?.totalpayableamount,
  };
};

const buildServiceInvoiceBlocks = (invoice: any): DocumentBlock[] => {
  const sections = [
    {
      data: parseJsonObject(invoice?.invoicedata),
      descriptionLabel: "PRODUCTS",
      codeLabel: "HSN CODE",
      code: (item: any) => item?.hsncode,
      name: (item: any) => firstText(item?.productname, item?.name, item?.description, "Product"),
      detail: (item: any) => {
        const parts = [
          `Qty: ${escapeHtml(item?.quantity ?? 1)} &times; ₹${escapeHtml(formatAmount(item?.price))}`,
        ];
        const name = firstText(item?.productname, item?.name);
        if (firstText(item?.description) && item.description !== name) {
          parts.unshift(escapeHtml(item.description));
        }
        return parts;
      },
      totalLabel: "Product Total (A)",
    },
    {
      data: parseJsonObject(invoice?.servicedata),
      descriptionLabel: "SERVICES",
      codeLabel: "SAC CODE",
      code: (item: any) => item?.saccode,
      name: (item: any) => firstText(item?.description, item?.name, "Service"),
      detail: () => [] as string[],
      totalLabel: "Service Total (B)",
    },
  ].filter((section) => Array.isArray(section.data?.items) && section.data.items.length);

  if (!sections.length) {
    return [{
      descriptionLabel: "DESCRIPTION",
      codeLabel: "HSN / SAC",
      rowsHtml: `<tr class="item-row"><td>No invoice items</td><td class="center">-</td>${moneyCell(0)}</tr>`,
      summaryHtml: summaryRow("Taxable Value", 0),
      totalLabel: "Total",
      total: invoice?.totalorderamount ?? 0,
    }];
  }

  return sections.map((section) => {
    const { data } = section;
    const rowsHtml = data.items
      .map(
        (item: any) => `
            <tr class="item-row">
              <td>
                <strong>${escapeHtml(section.name(item))}</strong>
                ${section.detail(item).map((part) => `<div class="item-detail">${part}</div>`).join("")}
              </td>
              <td class="center">${escapeHtml(firstText(section.code(item), "-"))}</td>
              ${moneyCell(item?.totalamount)}
            </tr>`,
      )
      .join("");
    const taxRows = (Array.isArray(data.taxcomponents) ? data.taxcomponents : [])
      .map((component: any) => summaryRow(serviceTaxLabel(component?.label), component?.amount))
      .join("");
    const roundOff = numericValue(data.roundoffamount);
    const summaryHtml = `
            ${summaryRow("Taxable Value", numericValue(data.total) - numericValue(data.taxamount))}
            <div class="tax-rows">
              ${taxRows}
              ${roundOff === 0 ? "" : summaryRow("ROUND OFF", roundOff)}
            </div>`;
    return {
      descriptionLabel: section.descriptionLabel,
      codeLabel: section.codeLabel,
      rowsHtml,
      summaryHtml,
      totalLabel: sections.length > 1 ? section.totalLabel : "Total",
      total: data.roundedtotal ?? data.total,
    };
  });
};

export const buildInStoreInvoiceHtml = (invoice: any, options: DocumentRenderOptions = {}) => {
  const invoiceData = parseJsonObject(invoice?.invoicedata ?? invoice?.quotationdata);
  const billingAddress = parseJsonObject(invoice?.billingaddresssnapshot);
  const items = Array.isArray(invoiceData?.items)
    ? invoiceData.items
    : Array.isArray(invoice?.itemdata)
      ? invoice.itemdata
      : [];
  const logo = assetDataUri("Teqit_New.png", "image/png");
  const signature = assetDataUri("bilal_esign.png", "image/jpeg");

  const isQuotation =
    options.documentType === "quotation" ||
    Boolean(invoice?.quotationnumber) ||
    String(invoice?.quotationtype ?? "").trim().length > 0;

  const isEstimation = options.documentType === "estimation";
  const docTitle = options.title || (isQuotation ? "QUOTATION" : "TAX INVOICE");
  const docNumberLabel = options.numberLabel || (isQuotation ? "QUOTATION NO" : "INVOICE NO");
  const docDateLabel = options.dateLabel || (isQuotation ? "QUOTATION DATE" : "DATE");

  const docNumber = firstText(
    invoice?.quotationnumber,
    invoice?.invoicenumber,
    isEstimation ? invoice?.ticketnumber : "",
    invoice?.id ? `#${invoice.id}` : ""
  );

  // PDF metadata title shown in the viewer's header/tab; matches the
  // uploaded file name (fileupload.service.ts) instead of "about:blank".
  const pdfTitle = !docNumber
    ? docTitle
    : isQuotation
      ? `QUOTATION-${docNumber}`
      : isEstimation ? `ESTIMATION-${docNumber}` : docNumber;

  const docDate = formatInvoiceDate(
    invoice?.quotationdate ??
    invoice?.invoicedate ??
    (isEstimation ? Date.now() : invoice?.createddate)
  );

  const {
    name: companyName,
    address: companyAddress,
    gstin: companyGstin,
    pan: companyPan,
    bankName,
    odAccountNumber,
    ifsc: ifscCode,
  } = COMPANY_DETAILS;
  const customerName = firstText(billingAddress?.name, invoice?.customername);
  const customerAddress = firstText(formatAddress(billingAddress), invoice?.customeraddress);
  const customerPhone = firstText(
    billingAddress?.mobilenumber,
    invoice?.customerphonenumber,
    invoice?.customermobilenumber,
  );
  const customerGstin = firstText(invoice?.customergstnumber);

  // Ship-to is printed only when it differs from the billing customer
  // (online orders delivered elsewhere); otherwise billing covers both.
  const shippingAddress = parseJsonObject(invoice?.shippingaddresssnapshot);
  const shipName = firstText(shippingAddress?.name, invoice?.shippingcustomername);
  const shipAddress = firstText(formatAddress(shippingAddress), invoice?.shippingcustomeraddress);
  const shipPhone = firstText(shippingAddress?.mobilenumber, invoice?.shippingcustomerphonenumber);
  const showShipTo =
    Boolean(shipAddress) &&
    (normalizeForCompare(shipAddress) !== normalizeForCompare(customerAddress) ||
      (Boolean(shipName) && normalizeForCompare(shipName) !== normalizeForCompare(customerName)));
  const orderId = firstText(invoice?.orderid);

  // Place of supply: if the supply state matches the billing address state,
  // show "Same as billing" (matches the master reference) instead of
  // repeating the state name.
  // Goods shipped elsewhere: GST place of supply is the delivery state.
  const suppliedPlaceState = firstText(
    invoiceData?.placeofsupply,
    invoice?.customertaxstate,
    invoice?.customerstate,
    showShipTo ? shippingAddress?.state : "",
  );
  const billingState = firstText(billingAddress?.state);
  const placeOfSupply =
    suppliedPlaceState && billingState &&
      normalizeForCompare(suppliedPlaceState) === normalizeForCompare(billingState)
      ? "Same as billing"
      : firstText(suppliedPlaceState, billingState, "Same as billing");

  // Show the rate in the tax label only when every line shares one rate;
  // the amounts are invoice totals, so a single rate would mislabel a
  // mixed-rate invoice.
  const itemTaxRates = Array.from(
    new Set(
      items
        .map((item: any) => String(item?.taxpercent ?? "").trim())
        .filter(Boolean)
        .map(percentageValue),
    ),
  );
  const totalTaxRate = itemTaxRates.length
    ? itemTaxRates.length === 1 ? Number(itemTaxRates[0]) : null
    : percentageValue(invoiceData?.tax);
  const rateSuffix = (rate: number) =>
    totalTaxRate === null ? "" : ` ${formatRate(rate)}%`;
  const taxMode = firstText(invoiceData?.taxmode).toLowerCase();
  const isIgst = taxMode === "igst" || numericValue(invoiceData?.igst) > 0;
  const firstTaxLabel = isIgst
    ? `ADD IGST${rateSuffix(totalTaxRate ?? 0)}`
    : `ADD CGST${rateSuffix((totalTaxRate ?? 0) / 2)}`;
  const secondTaxLabel = `ADD SGST${rateSuffix((totalTaxRate ?? 0) / 2)}`;
  const firstTaxAmount = isIgst ? invoiceData?.igst : invoiceData?.cgst;
  const secondTaxAmount = invoiceData?.sgst;
  const roundOffAmount = numericValue(invoiceData?.roundoffamount);
  const discountAmount = numericValue(invoiceData?.discount);
  const isTaxInclusive =
    firstText(invoiceData?.taxcalculationmode).toLowerCase() === "inclusive";

  // The amount column carries each line's taxable value so the column adds
  // up to "Taxable Value"; quotations send no per-line taxable value and
  // fall back to the line total.
  const lineAmount = (item: any) => item?.taxablevalue ?? item?.totalamount;
  const taxableValue =
    invoiceData?.taxablevalue ??
    (items.length && items.every((item: any) => item?.taxablevalue !== undefined)
      ? items.reduce((sum: number, item: any) => sum + numericValue(item.taxablevalue), 0)
      : invoiceData?.subtotal);

  const isLineTaxInclusive = (item: any) => {
    const mode = firstText(item?.taxcalculationmode).toLowerCase();
    if (mode) return mode === "inclusive";
    if (numericValue(item?.taxamount) <= 0) return false;
    // Manual invoices send no mode; their unit price is GST-inclusive when
    // qty x rate - discount equals the tax-inclusive line total.
    const gross =
      numericValue(item?.unitPrice ?? item?.mrp) * numericValue(item?.quantity ?? 1);
    return Math.abs(gross - numericValue(item?.discount) - numericValue(item?.totalamount)) <= 1;
  };

  const itemDetail = (item: any) => {
    const parts = [
      `Qty: ${escapeHtml(item?.quantity ?? 1)} &times; ₹${escapeHtml(formatAmount(item?.unitPrice ?? item?.mrp ?? 0))}${isLineTaxInclusive(item) ? " (incl. GST)" : ""}`,
    ];
    if (numericValue(item?.discount) > 0) {
      parts.push(`Discount: ₹${escapeHtml(formatAmount(item.discount))}`);
    }
    if (item?.rentstartdate && item?.rentenddate) {
      parts.push(
        `Period: ${escapeHtml(formatInvoiceDate(item.rentstartdate))} to ${escapeHtml(formatInvoiceDate(item.rentenddate))}`,
      );
    }
    if (firstText(item?.assetnumber)) {
      parts.push(`Asset No: ${escapeHtml(item.assetnumber)}`);
    }
    return parts.map((part) => `<div class="item-detail">${part}</div>`).join("");
  };

  const itemRows = items.length
    ? items
      .map(
        (item: any) => `
            <tr class="item-row">
              <td>
                <strong>${escapeHtml(firstText(item?.name, item?.description, "Product"))}</strong>
                ${itemDetail(item)}
              </td>
              <td class="center">${escapeHtml(firstText(item?.hsncode, "-"))}</td>
              <td class="money-cell"><div class="money"><span>₹</span><span>${escapeHtml(formatAmount(lineAmount(item)))}</span></div></td>
            </tr>`,
      )
      .join("")
    : `<tr class="item-row"><td>No invoice items</td><td class="center">-</td><td class="money-cell"><div class="money"><span>₹</span><span>0.00</span></div></td></tr>`;

  const discountRows = discountAmount > 0
    ? `<div class="summary-row"><span>${isTaxInclusive ? "Gross Amount (incl. GST)" : "Gross Amount"}</span><span></span><span class="money"><span>₹</span><strong>${escapeHtml(formatAmount(invoiceData?.subtotal))}</strong></span></div>
       <div class="summary-row"><span>Less: Discount</span><span></span><span class="money"><span>- ₹</span><strong>${escapeHtml(formatAmount(discountAmount))}</strong></span></div>`
    : "";

  const taxRows = `
    <div class="summary-row">
      <span>${escapeHtml(firstTaxLabel)}</span>
      <span></span>
      <span class="money"><span>₹</span><strong>${escapeHtml(formatAmount(firstTaxAmount))}</strong></span>
    </div>
    ${isIgst
      ? ""
      : `<div class="summary-row"><span>${escapeHtml(secondTaxLabel)}</span><span></span><span class="money"><span>₹</span><strong>${escapeHtml(formatAmount(secondTaxAmount))}</strong></span></div>`
    }
    ${roundOffAmount === 0
      ? ""
      : `<div class="summary-row"><span>ROUND OFF</span><span></span><span class="money"><span>₹</span><strong>${escapeHtml(formatAmount(invoiceData?.roundoffamount))}</strong></span></div>`
    }`;

  const isServiceInvoice =
    isEstimation ||
    options.documentType === "service" ||
    String(invoice?.invoicefor ?? "").trim().toLowerCase() === "service";

  const blocks: DocumentBlock[] = isServiceInvoice
    ? buildServiceInvoiceBlocks(isEstimation ? estimationToServiceInvoice(invoice) : invoice)
    : [{
      descriptionLabel: "DESCRIPTION",
      codeLabel: "HSN CODE",
      rowsHtml: itemRows,
      summaryHtml: `
            ${discountRows}
            <div class="summary-row"><span>Taxable Value</span><span></span><span class="money"><span>₹</span><strong>${escapeHtml(formatAmount(taxableValue))}</strong></span></div>
            <div class="tax-rows">${taxRows}</div>`,
      totalLabel: "Total",
      total: invoiceData?.total,
    }];
  const isMultiBlock = blocks.length > 1;
  // Two blocks (product + service) do not fit on A5, so those invoices use
  // A4; the content height is the page height minus the 8mm top/bottom margins.
  const pageSize = isMultiBlock ? "A4" : "A5";
  const contentHeight = isMultiBlock ? "281mm" : "194mm";
  const grandTotal = isServiceInvoice
    ? (isEstimation ? invoice?.totalpayableamount : invoice?.totalorderamount) ??
      blocks.reduce((sum, block) => sum + numericValue(block.total), 0)
    : invoiceData?.total;
  // Estimations already print the ticket number as their document number.
  const ticketNumber =
    isServiceInvoice && !isEstimation ? firstText(invoice?.ticketnumber) : "";

  const renderBlockTable = (block: DocumentBlock) => `
        <table class="items">
          <colgroup><col style="width:44%"><col style="width:21%"><col style="width:35%"></colgroup>
          <thead><tr><th>${escapeHtml(block.descriptionLabel)}</th><th>${escapeHtml(block.codeLabel)}</th><th>AMOUNT</th></tr></thead>
          <tbody>${block.rowsHtml}</tbody>
        </table>`;
  const renderBlockSummary = (block: DocumentBlock) => `
          <section class="summary">${block.summaryHtml}</section>
          <div class="total"><span class="total-label">${escapeHtml(block.totalLabel)}</span><span class="money"><span>₹</span><span>${escapeHtml(formatAmount(block.total))}</span></span></div>`;
  // Every block but the last closes straight after its items; the last
  // block's summary sits in the closing section below the page filler,
  // followed by the grand total when there is more than one block.
  const lastBlock = blocks[blocks.length - 1];
  const blocksHtml = blocks
    .map((block, index) =>
      renderBlockTable(block) + (index < blocks.length - 1 ? renderBlockSummary(block) : ""))
    .join("");

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(pdfTitle)}</title>
      <style>
        /* preferCSSPageSize is true in page.pdf() below, so Puppeteer uses
           THIS size (A5, or A4 for two-block service invoices); its A5
           format option is only a fallback. min-heights must match the
           page size or the frame and footer land in the wrong place. */
        @page { size: ${pageSize}; margin: 8mm 7mm 8mm; }
        * { box-sizing: border-box; }
        html, body { min-height: ${contentHeight}; margin: 0; padding: 0; color: #111; font-family: "Times New Roman", "Noto Serif", serif; font-size: 12.5px; }
        .invoice { width: 100%; min-height: ${contentHeight}; display: flex; flex-direction: column; }
        /* Outer border as a fixed element: Chrome repeats it on every printed
           page, so invoices that run past one page stay framed. */
        .page-frame { position: fixed; top: 0; right: 0; bottom: 0; left: 0; border: 1.5px solid #111; pointer-events: none; }
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
        .customer-name { position: relative; flex: 0 0 auto; width: 100%; font-weight: 700; padding: 1.3mm 1mm; }
        .customer-name::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1.5px; background: #111; }
        .customer-details { flex: 1 1 auto; padding: 1.3mm 1mm; }
        .customer-address { white-space: pre-line; line-height: 1.35; }
        .customer-gstin { position: relative; flex: 0 0 auto; width: 100%; padding: 1.3mm 1mm; text-decoration: underline; }
        .customer-gstin::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 1.5px; background: #111; }
        .ship-to { margin-top: 1.5mm; padding-top: 1.2mm; border-top: 1px dashed #777; font-size: 11.5px; }
        .sub-value { margin-top: 1.5mm; font-size: 10.5px; font-weight: 400; }
        .center { text-align: center; vertical-align: middle !important; }
        .invoice-value { text-align: center; vertical-align: middle !important; font-weight: 700; font-size: 13px; }
        .items { border-collapse: separate; border-spacing: 0; }
        .items thead { display: table-header-group; }
        .items th { height: 9mm; font-size: 14px; text-align: left; vertical-align: middle; }
        .items th:nth-child(2), .items th:nth-child(3) { text-align: right; }
        .item-row { break-inside: avoid; page-break-inside: avoid; }
        .item-row td { padding-top: 2mm; padding-bottom: 2mm; }
        .items tbody tr:last-child td { border-bottom: 0; }
        .item-detail { margin-top: 0.8mm; color: #333; font-size: 10.5px; }
        .money-cell { vertical-align: middle; }
        .money { display: flex; justify-content: space-between; gap: 3mm; text-align: right; white-space: nowrap; }
        .closing-section { flex: 1 0 auto; min-height: 0; display: flex; flex-direction: column; break-inside: avoid; page-break-inside: avoid; }
        .summary-space, .summary { position: relative; }
        .summary-space::before, .summary::before,
        .summary-space::after, .summary::after { content: ""; position: absolute; top: 0; bottom: 0; width: 0; border-left: 1.3px solid #111; pointer-events: none; }
        .summary-space::before, .summary::before { left: 44%; }
        .summary-space::after, .summary::after { left: 65%; }
        .summary-space { flex: 1 1 0; min-height: 0; }
        .summary { min-height: 20mm; border-bottom: 1.3px solid #111; padding: 1.2mm 1mm; display: flex; flex-direction: column; break-inside: avoid; page-break-inside: avoid; }
        .tax-rows { margin-top: auto; }
        .summary-row { min-height: 6mm; display: grid; grid-template-columns: 44% 21% 35%; align-items: center; }
        .summary-row > span:first-child { padding-right: 1mm; }
        .summary-row .money { padding: 0 1mm; }
        .total { display: grid; grid-template-columns: 65% 35%; border-bottom: 1.5px solid #111; font-size: 14px; font-weight: 700; min-height: 7mm; align-items: center; }
        .total-label { text-align: center; }
        .total .money { border-left: 1.3px solid #111; height: 100%; align-items: center; padding: 0 1mm; }
        .grand-total { border-top: 1.5px solid #111; font-size: 15px; }
        .footer { display: grid; grid-template-columns: 44% 56%; min-height: 25mm; }
        .bank { border-right: 1.3px solid #111; padding: 1mm; line-height: 1.4; }
        .authorization { padding: 1.2mm; text-align: center; }
        .signature { display: block; width: 43mm; height: 13mm; object-fit: contain; margin: 1.5mm auto 0; }
      </style>
    </head>
    <body>
      <div class="page-frame"></div>
      <main class="invoice">
        <div class="title">${escapeHtml(docTitle)}</div>
        <section class="company">
          <img class="logo" src="${logo}" alt="TEQIT logo" />
          <div>
            <div class="company-name">${escapeHtml(companyName)}</div>
            <div class="company-address">${escapeHtml(companyAddress)}</div>
            <div class="company-gstin">GSTIN No :${escapeHtml(companyGstin)}</div>
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
                  ${showShipTo
                    ? `<div class="ship-to"><strong>Ship to:</strong> ${escapeHtml(shipName)}
                        <div class="customer-address">${escapeHtml(shipAddress)}</div>
                        ${shipPhone ? `<div>Phone: ${escapeHtml(shipPhone)}</div>` : ""}
                      </div>`
                    : ""}
                </div>
                ${customerGstin ? `<div class="customer-gstin">GSTIN NO: ${escapeHtml(customerGstin)}</div>` : ""}
              </div>
            </td>
            <td class="center">${escapeHtml(placeOfSupply)}</td>
            <td class="invoice-value">${escapeHtml(docNumber)}${orderId ? `<div class="sub-value">Order ID: ${escapeHtml(orderId)}</div>` : ""}${ticketNumber ? `<div class="sub-value">Ticket No: ${escapeHtml(ticketNumber)}</div>` : ""}</td>
            <td class="invoice-value">${escapeHtml(docDate)}</td>
          </tr></tbody>
        </table>
        ${blocksHtml}
        <section class="closing-section">
          <div class="summary-space"></div>
          ${renderBlockSummary(lastBlock)}
          ${isMultiBlock
            ? `<div class="total grand-total"><span class="total-label">Total (A + B)</span><span class="money"><span>₹</span><span>${escapeHtml(formatAmount(grandTotal))}</span></span></div>`
            : ""}
          <footer class="footer">
            <div class="bank">
              Company's PAN: ${escapeHtml(companyPan)}<br />
              ${escapeHtml(bankName)}<br />
              OD Acc:${escapeHtml(odAccountNumber)}<br />
              IFSC Code:${escapeHtml(ifscCode)}
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
  const configuredPath = String(
    process.env.CHROME_EXECUTABLE_PATH ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    "",
  ).trim();
  const windowsRoots = [
    process.env.PROGRAMFILES,
    process.env["PROGRAMFILES(X86)"],
    process.env.LOCALAPPDATA,
  ].filter((value): value is string => Boolean(value));
  const candidates = [
    configuredPath,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    ...windowsRoots.flatMap((root) => [
      path.join(root, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(root, "Chromium", "Application", "chrome.exe"),
      path.join(root, "Microsoft", "Edge", "Application", "msedge.exe"),
    ]),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || "";
};

export const renderInStoreInvoicePdf = async (
  invoice: any,
  options: DocumentRenderOptions = {}
): Promise<Buffer> => {
  // @ts-ignore
  const puppeteer = await import("puppeteer-core");
  let browser: any;

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
    } catch {
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
      await Promise.all(
        Array.from(document.images).map(
          (image) =>
            image.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                image.addEventListener("load", () => resolve(), { once: true });
                image.addEventListener("error", () => resolve(), { once: true });
              }),
        ),
      );
    });
    const pdf = await page.pdf({
      format: "A5",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
};
