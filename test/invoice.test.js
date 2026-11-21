'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

// Each item carries the fields consumed by both calculators. gstRate is a
// percentage for invoice.js; tax.js accepts that percentage and resolves it
// consistently with the item's configured HSN slab.
const cases = [
  {
    name: 'order #1001: mixed 5% / 12% items, no coupon',
    coupon: '',
    items: [
      { id: 2, name: 'Unpolished Toor Dal 1kg', sku: 'GRN-002', hsn: '0713', gstRate: 5, price: 165, qty: 2 },
      { id: 7, name: 'Pasteurized Table Butter 500g', sku: 'DRY-002', hsn: '0405', gstRate: 12, price: 260, qty: 1 }
    ],
    expected: { subtotal: 590, discount: 0, tax: 47.7, cgst: 23.85, sgst: 23.85, total: 637.7,
      rows: [{ gstPercent: 5, line: 330, lineTax: 16.5 }, { gstPercent: 12, line: 260, lineTax: 31.2 }] },
    checkoutExpected: { subtotal: 590, discount: 0, tax: 47.7, total: 637.7 }
  },
  {
    name: 'order #1002: SAVE10 on 5% items',
    coupon: 'SAVE10',
    items: [
      { id: 1, name: 'Indrayani Basmati Rice 5kg', sku: 'GRN-001', hsn: '1006', gstRate: 5, price: 640, qty: 1 },
      { id: 4, name: 'Cold-Pressed Sunflower Oil 1L', sku: 'OIL-001', hsn: '1512', gstRate: 5, price: 190, qty: 2 }
    ],
    expected: { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9,
      rows: [{ gstPercent: 5, line: 640, lineTax: 28.8 }, { gstPercent: 5, line: 380, lineTax: 17.1 }] },
    checkoutExpected: { subtotal: 1020, discount: 102, tax: 45.9, total: 963.9 }
  },
  {
    name: 'order #1004: SAVE10 on ₹2,240 subtotal',
    coupon: 'SAVE10',
    items: [
      { id: 5, name: 'Cold-Pressed Groundnut Oil 5L', sku: 'OIL-002', hsn: '1508', gstRate: 5, price: 1120, qty: 2 }
    ],
    expected: { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5,
      rows: [{ gstPercent: 5, line: 2240, lineTax: 104.5 }] },
    checkoutExpected: { subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5 }
  },
  {
    name: 'order #1008: all 18% items, no coupon',
    coupon: '',
    items: [
      { id: 8, name: 'Assam CTC Masala Chai 250g', sku: 'BEV-001', hsn: '0902', gstRate: 18, price: 140, qty: 1 },
      { id: 12, name: 'Kokum Sherbet Concentrate 750ml', sku: 'BEV-003', hsn: '2106', gstRate: 18, price: 180, qty: 2 }
    ],
    expected: { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590,
      rows: [{ gstPercent: 18, line: 140, lineTax: 25.2 }, { gstPercent: 18, line: 360, lineTax: 64.8 }] },
    checkoutExpected: { subtotal: 500, discount: 0, tax: 90, total: 590 }
  }
];

for (const example of cases) {
  test('CURRENT BEHAVIOUR: ' + example.name, () => {
    const order = { items: example.items, coupon: example.coupon };
    const invoiceFigures = invoice.computeInvoiceFigures(order);
    const checkoutFigures = pricing.computeTotals(example.items, example.coupon);

    assert.deepEqual({
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      cgst: invoiceFigures.cgst,
      sgst: invoiceFigures.sgst,
      total: invoiceFigures.total,
      rows: invoiceFigures.rows.map(({ gstPercent, line, lineTax }) => ({ gstPercent, line, lineTax }))
    }, example.expected);

    assert.deepEqual({
      subtotal: checkoutFigures.subtotal,
      discount: checkoutFigures.discount,
      tax: checkoutFigures.tax,
      total: checkoutFigures.total
    }, example.checkoutExpected);
  });
}

test('invoice matches checkout totals and discounted per-line GST for capped SAVE10', () => {
  const example = cases.find(({ name }) => name.includes('#1004'));
  const order = { items: example.items, coupon: example.coupon };
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutFigures = pricing.computeTotals(example.items, example.coupon);

  assert.deepEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    cgst: invoiceFigures.cgst,
    sgst: invoiceFigures.sgst,
    total: invoiceFigures.total
  }, {
    subtotal: checkoutFigures.subtotal,
    discount: checkoutFigures.discount,
    tax: checkoutFigures.tax,
    cgst: checkoutFigures.cgst,
    sgst: checkoutFigures.sgst,
    total: checkoutFigures.total
  });
  assert.deepEqual(invoiceFigures.rows.map(({ gstPercent, line, lineTax }) => ({ gstPercent, line, lineTax })),
    checkoutFigures.lines.map(({ gstPercent, gross, tax }) => ({ gstPercent, line: gross, lineTax: tax })));
});
