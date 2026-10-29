import assert from "node:assert/strict";
import { test } from "node:test";
import { buildInStoreInvoiceHtml, type DocumentRenderOptions } from "../service/inStoreInvoicePdf.service.js";

const invoiceFixture = () => ({
  invoicenumber: "DISPLAY-QA",
  invoicedate: "2026-10-22",
  customername: "Sample Customer",
  customeraddress: "Chennai, Tamil Nadu, 600100",
  customertaxstate: "Tamil Nadu",
  invoicedata: {
    items: [{ name: "Laptop", price: 45000, unitPrice: 45000, quantity: 1, hsncode: "84713010", totalamount: 45000 }],
    subtotal: 45000, taxablevalue: 45000, tax: 18, taxmode: "cgst_sgst",
    cgst: 4050, sgst: 4050, total: 53100,
    taxamount: 8100,
    taxcomponents: [{ label: "CGST Amount (9%)", amount: 4050 }, { label: "SGST Amount (9%)", amount: 4050 }],
    placeofsupply: "Tamil Nadu",
  },
});

for (const kind of ["product", "rental", "service"] as const) {
  test(`${kind}: only the printed place of supply changes; payload stays intact`, () => {
    const invoice: any = invoiceFixture();
    const options: DocumentRenderOptions = { documentType: kind === "service" ? "service" : "invoice" };
    if (kind === "rental") {
      Object.assign(invoice.invoicedata.items[0], { rentstartdate: "2026-10-22", rentenddate: "2026-11-22", saccode: "997315" });
    }
    if (kind === "service") {
      invoice.servicedata = {
        items: [{ description: "Repair", quantity: 1, price: 1000, saccode: "998714", totalamount: 1000 }],
        total: 1180, taxamount: 180,
        taxcomponents: [{ label: "CGST Amount (9%)", amount: 90 }, { label: "SGST Amount (9%)", amount: 90 }],
      };
      invoice.totalorderamount = 54280;
    }
    const original = structuredClone(invoice);
    const before = buildInStoreInvoiceHtml(invoice, options);
    const after = buildInStoreInvoiceHtml(invoice, { ...options, placeOfSupplyText: "Same as billing" });
    assert.ok(before.includes('<td class="center">Tamil Nadu</td>'));
    assert.equal(after, before.replace('<td class="center">Tamil Nadu</td>', '<td class="center">Same as billing</td>'));
    assert.deepEqual(invoice, original);
  });
}

test("existing quotation state display still handles different supply and billing states", () => {
  const invoice = {
    ...invoiceFixture(),
    billingaddresssnapshot: { name: "Sample Customer", address: "Chennai", state: "Tamil Nadu" },
    customertaxstate: "Karnataka",
  };
  invoice.invoicedata.placeofsupply = "Karnataka";
  const html = buildInStoreInvoiceHtml(invoice, { documentType: "quotation" });
  assert.ok(html.includes('<td class="center">Karnataka</td>'));
});

test("billing snapshots supplied as JSON retain their address and state", () => {
  const invoice = {
    ...invoiceFixture(),
    billingaddresssnapshot: JSON.stringify({ name: "Sample Customer", address: "Chennai", state: "Tamil Nadu" }),
  };
  const original = structuredClone(invoice);
  const html = buildInStoreInvoiceHtml(invoice, { placeOfSupplyText: "Same as billing" });
  assert.ok(html.includes('<td class="center">Same as billing</td>'));
  assert.deepEqual(invoice, original);
});
