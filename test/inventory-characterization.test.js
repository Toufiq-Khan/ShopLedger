var test = require('node:test');
var assert = require('node:assert/strict');

var inventory = require('../lib/inventory');
var orders = require('../lib/orders');

test('selling the exact remaining sellable stock succeeds', function () {
  var products = [
    {
      id: 6,
      sku: 'DRY-001',
      name: 'A2 Gir Cow Ghee 500ml',
      stock: 1,
      reserved: 0
    },
    {
      id: 8,
      sku: 'SPC-001',
      name: 'Byadgi Chilli Powder',
      stock: 4,
      reserved: 3
    }
  ];

  assert.equal(inventory.getSellableStock(products[0]), 1);
  assert.deepEqual(inventory.check(products, [{ id: 6, qty: 1 }]), { ok: true });

  assert.equal(inventory.getSellableStock(products[1]), 1);
  assert.deepEqual(inventory.check(products, [{ id: 8, qty: 1 }]), { ok: true });
});

test('cancelling pending order 1007 restores the cancelled quantities to stock', function () {
  var db = {
    products: [
      { id: 6, sku: 'DRY-001', name: 'A2 Gir Cow Ghee 500ml', stock: 1, reserved: 0 },
      { id: 4, sku: 'OIL-001', name: 'Cold-Pressed Sunflower Oil 1L', stock: 6, reserved: 0 }
    ],
    customers: [],
    orders: [
      {
        id: 1007,
        date: '04/03/2022',
        customer: 'Suresh Deshmukh',
        customerId: 4,
        paymentMode: 'khata',
        status: 'pending',
        items: [
          { id: 6, sku: 'DRY-001', name: 'A2 Gir Cow Ghee 500ml', qty: 2 },
          { id: 4, sku: 'OIL-001', name: 'Cold-Pressed Sunflower Oil 1L', qty: 2 }
        ],
        total: 1407
      }
    ]
  };

  var result = orders.cancel(db, 1007, 'Characterization test');

  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.deepEqual(db.products, [
    { id: 6, sku: 'DRY-001', name: 'A2 Gir Cow Ghee 500ml', stock: 3, reserved: 0 },
    { id: 4, sku: 'OIL-001', name: 'Cold-Pressed Sunflower Oil 1L', stock: 8, reserved: 0 }
  ]);
});
