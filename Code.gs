/**
 * App quản lý công việc - Google Apps Script backend
 * Dữ liệu lưu trong Google Sheet đang gắn với project Apps Script này.
 */

const SHEET_TASKS = 'CongViec';
const SHEET_MEMBERS = 'ThanhVien';
const SHEET_SETTINGS = 'CaiDat';
const SHEET_ORDERS = 'DonHang';
const SHEET_CUSTOMERS = 'KhachHang';
const SHEET_ITEMS = 'MaHang';
const SHEET_MB51 = 'MB51';

const TASK_HEADERS = [
  'ID', 'Tiêu đề', 'Mô tả', 'Trạng thái', 'Ưu tiên', 'Người phụ trách',
  'Ngày bắt đầu', 'Hạn chót', 'Nhãn', 'Tiến độ (%)', 'Người tạo',
  'Ngày tạo', 'Cập nhật lúc', 'Khu vực'
];
const ORDER_HEADERS = [
  'ID', 'Ngày nhận đơn', 'Khách hàng', 'Mã hàng', 'SL đặt', 'ĐVT', 'Kho',
  'Ngày nhận dự kiến', 'Người gửi', 'Ghi chú', 'SL đã lấy', 'Trạng thái', 'Cập nhật lúc',
  'Kho nhận hàng', 'Mã KH SAP', 'Mã hàng SAP', 'Khu vực', 'Mã đơn', 'Lô'
];
// Danh mục: app tự thêm / cập nhật khi lưu đơn, chị cũng có thể sửa tay trong sheet
const CUSTOMER_HEADERS = ['Khách hàng', 'Mã KH SAP', 'Kho nhận mặc định', 'Cập nhật lúc'];
const ITEM_HEADERS = ['Mã hàng', 'Mã hàng SAP', 'ĐVT', 'Viên/thùng', 'm²/thùng', 'Cập nhật lúc'];
// Dữ liệu MB51 đã nhập (chỉ giữ xuất cho khách 601 / huỷ xuất 602), mỗi dòng chứng từ một lần
const MB51_HEADERS = ['Chứng từ', 'Dòng', 'Ngày', 'Kho', 'Mã SAP', 'Mô tả', 'Lô', 'SL (ĐVT gốc)', 'ĐVT gốc', 'SL nhập', 'ĐVT nhập', 'Loại', 'Khách', 'Sales order'];
const MEMBER_HEADERS = ['Tên', 'Email', 'Vai trò'];
const SETTING_HEADERS = ['Loại', 'Giá trị', 'Màu'];

const DEFAULT_SETTINGS = [
  ['TrangThai', 'Cần làm', '#64748b'],
  ['TrangThai', 'Đang làm', '#2563eb'],
  ['TrangThai', 'Chờ duyệt', '#d97706'],
  ['TrangThai', 'Hoàn thành', '#16a34a'],
  ['UuTien', 'Thấp', '#94a3b8'],
  ['UuTien', 'Trung bình', '#0ea5e9'],
  ['UuTien', 'Cao', '#f97316'],
  ['UuTien', 'Khẩn cấp', '#dc2626']
];

/** Mở web app */
function doGet() {
  setup_();
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Quản lý công việc')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * API JSON cho giao diện chạy ngoài Apps Script (GitHub Pages).
 * Gửi POST với body dạng text: {"fn": "saveTask", "args": [...]}
 */
const API_FUNCTIONS = { getInitialData, getTasks, saveTask, updateStatus, deleteTask, getOrders, saveOrders, deleteOrder, getCatalog, importMb51, getMb51 };

function doPost(e) {
  let out;
  try {
    const req = JSON.parse(e.postData.contents);
    const fn = API_FUNCTIONS[req.fn];
    if (!fn) throw new Error('Không có hàm ' + req.fn);
    out = { ok: true, data: fn.apply(null, req.args || []) };
  } catch (err) {
    out = { ok: false, error: err.message || String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Thêm menu khi mở Google Sheet */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📋 Công việc')
    .addItem('Khởi tạo các sheet', 'setup')
    .addToUi();
}

function setup() {
  setup_();
  SpreadsheetApp.getActive().toast('Đã khởi tạo xong các sheet.');
}

/** Tạo các sheet nếu chưa có */
function setup_() {
  const ss = SpreadsheetApp.getActive();
  ensureSheet_(ss, SHEET_TASKS, TASK_HEADERS);
  ensureSheet_(ss, SHEET_ORDERS, ORDER_HEADERS);
  ensureSheet_(ss, SHEET_CUSTOMERS, CUSTOMER_HEADERS);
  ensureSheet_(ss, SHEET_ITEMS, ITEM_HEADERS);
  ensureSheet_(ss, SHEET_MB51, MB51_HEADERS);
  const members = ensureSheet_(ss, SHEET_MEMBERS, MEMBER_HEADERS);
  const settings = ensureSheet_(ss, SHEET_SETTINGS, SETTING_HEADERS);
  if (settings.getLastRow() === 1) {
    settings.getRange(2, 1, DEFAULT_SETTINGS.length, 3).setValues(DEFAULT_SETTINGS);
  }
  if (members.getLastRow() === 1) {
    const email = Session.getActiveUser().getEmail() || '';
    members.appendRow([email ? email.split('@')[0] : 'Tôi', email, 'Quản lý']);
  }
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < headers.length) {
    // Bổ sung cột mới (thêm ở cuối) cho sheet tạo từ phiên bản cũ
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
  }
  return sh;
}

/** Dữ liệu ban đầu cho giao diện */
function getInitialData() {
  setup_();
  const ss = SpreadsheetApp.getActive();
  const settings = readRows_(ss.getSheetByName(SHEET_SETTINGS));
  return {
    tasks: getTasks(),
    orders: getOrders(),
    ...getCatalog(),
    members: readRows_(ss.getSheetByName(SHEET_MEMBERS))
      .filter(r => r[0]).map(r => ({ name: String(r[0]), email: String(r[1]), role: String(r[2]) })),
    statuses: settings.filter(r => r[0] === 'TrangThai').map(r => ({ name: r[1], color: r[2] })),
    priorities: settings.filter(r => r[0] === 'UuTien').map(r => ({ name: r[1], color: r[2] })),
    user: Session.getActiveUser().getEmail() || ''
  };
}

function getTasks() {
  const rows = readRows_(SpreadsheetApp.getActive().getSheetByName(SHEET_TASKS));
  return rows.filter(r => r[0]).map(rowToTask_);
}

/** Thêm mới hoặc cập nhật công việc */
function saveTask(task) {
  if (!task || !String(task.title || '').trim()) throw new Error('Tiêu đề không được để trống');
  return withLock_(() => {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_TASKS);
    const now = new Date();
    let rowIndex = task.id ? findRow_(sh, task.id) : -1;
    if (rowIndex === -1) {
      task.id = task.id || 'CV' + now.getTime().toString(36).toUpperCase();
      task.createdBy = Session.getActiveUser().getEmail() || '';
      task.createdAt = now;
    } else {
      const old = rowToTask_(sh.getRange(rowIndex, 1, 1, TASK_HEADERS.length).getValues()[0]);
      task.createdBy = old.createdBy;
      task.createdAt = old.createdAt ? new Date(old.createdAt) : now;
    }
    task.updatedAt = now;
    const row = taskToRow_(task);
    if (rowIndex === -1) sh.appendRow(row);
    else sh.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    return rowToTask_(row);
  });
}

/** Đổi trạng thái nhanh (kéo thả kanban) */
function updateStatus(id, status) {
  return withLock_(() => {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_TASKS);
    const r = findRow_(sh, id);
    if (r === -1) throw new Error('Không tìm thấy công việc ' + id);
    sh.getRange(r, 4).setValue(status);
    if (status === 'Hoàn thành') sh.getRange(r, 10).setValue(100);
    sh.getRange(r, 13).setValue(new Date());
    return rowToTask_(sh.getRange(r, 1, 1, TASK_HEADERS.length).getValues()[0]);
  });
}

function deleteTask(id) {
  return withLock_(() => {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_TASKS);
    const r = findRow_(sh, id);
    if (r !== -1) sh.deleteRow(r);
    return id;
  });
}

/* ---------- Đơn hàng ---------- */

function getOrders() {
  const rows = readRows_(SpreadsheetApp.getActive().getSheetByName(SHEET_ORDERS));
  return rows.filter(r => r[0]).map(rowToOrder_);
}

/** Thêm mới hoặc cập nhật nhiều dòng đơn hàng cùng lúc */
function saveOrders(orders) {
  if (!Array.isArray(orders) || !orders.length) return [];
  return withLock_(() => {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_ORDERS);
    const now = new Date();
    const stamp = now.getTime().toString(36).toUpperCase();
    const toAppend = [];
    const saved = orders.map((o, i) => {
      if (!String(o.customer || '').trim() || !String(o.code || '').trim()) {
        throw new Error('Thiếu khách hàng hoặc mã hàng ở dòng ' + (i + 1));
      }
      const rowIndex = o.id ? findRow_(sh, o.id) : -1;
      if (rowIndex === -1) {
        o.id = o.id || 'DH' + stamp + (i ? '-' + i : '');
        o.createdAt = o.createdAt || toDateStr_(now);
      }
      o.updatedAt = now;
      const row = orderToRow_(o);
      if (rowIndex === -1) toAppend.push(row);
      else sh.getRange(rowIndex, 1, 1, row.length).setValues([row]);
      return rowToOrder_(row);
    });
    if (toAppend.length) {
      sh.getRange(sh.getLastRow() + 1, 1, toAppend.length, ORDER_HEADERS.length).setValues(toAppend);
    }
    // Quy đổi thùng/viên không nằm trong sheet DonHang, chuyển sang danh mục mã hàng
    upsertCatalog_(saved.map((o, i) => Object.assign({}, o, { perBox: orders[i].perBox, m2PerBox: orders[i].m2PerBox })));
    return saved;
  });
}

/* ---------- Danh mục khách hàng / mã hàng ---------- */

function getCatalog() {
  const ss = SpreadsheetApp.getActive();
  return {
    customers: readRows_(ss.getSheetByName(SHEET_CUSTOMERS)).filter(r => r[0]).map(r => ({
      name: String(r[0]), customerSap: String(r[1] || ''), toWarehouse: String(r[2] || '')
    })),
    items: readRows_(ss.getSheetByName(SHEET_ITEMS)).filter(r => r[0]).map(r => ({
      code: String(r[0]), codeSap: String(r[1] || ''), unit: String(r[2] || ''),
      perBox: Number(r[3]) || 0, m2PerBox: Number(r[4]) || 0
    }))
  };
}

/** Ghi nhớ mã SAP, kho nhận, ĐVT theo tên khách / mã hàng để lần sau tự điền */
function upsertCatalog_(orders) {
  const ss = SpreadsheetApp.getActive();
  const now = new Date();
  // [sheet, cột khoá, các cột cần nhớ: [vị trí cột, trường của đơn]]
  const specs = [
    [ss.getSheetByName(SHEET_CUSTOMERS), 'customer', [[1, 'customerSap'], [2, 'toWarehouse']], CUSTOMER_HEADERS.length],
    [ss.getSheetByName(SHEET_ITEMS), 'code', [[1, 'codeSap'], [2, 'unit'], [3, 'perBox'], [4, 'm2PerBox']], ITEM_HEADERS.length]
  ];
  specs.forEach(([sh, keyField, fields, width]) => {
    const rows = readRows_(sh);
    const index = {};
    rows.forEach((r, i) => { if (r[0]) index[String(r[0]).trim().toLowerCase()] = i; });
    const appended = [];
    orders.forEach(o => {
      const key = String(o[keyField] || '').trim();
      if (!key) return;
      const k = key.toLowerCase();
      if (index[k] === undefined) {
        const row = new Array(width).fill('');
        row[0] = key;
        fields.forEach(([c, f]) => row[c] = o[f] || '');
        row[width - 1] = now;
        index[k] = rows.length + appended.length;
        appended.push(row);
        return;
      }
      const i = index[k];
      const row = i < rows.length ? rows[i] : appended[i - rows.length];
      let changed = false;
      fields.forEach(([c, f]) => { if (o[f] && String(row[c]) !== String(o[f])) { row[c] = o[f]; changed = true; } });
      if (changed && i < rows.length) {
        row[width - 1] = now;
        sh.getRange(i + 2, 1, 1, width).setValues([Array.from({ length: width }, (_, j) => row[j] === undefined ? '' : row[j])]);
      }
    });
    if (appended.length) sh.getRange(sh.getLastRow() + 1, 1, appended.length, width).setValues(appended);
  });
}

/* ---------- MB51 ---------- */

/** Thêm các dòng MB51 chưa có (theo Chứng từ + Dòng), trả về số dòng mới và toàn bộ dữ liệu từ ngày `since` */
function importMb51(rows, since) {
  return withLock_(() => {
    const sh = ensureSheet_(SpreadsheetApp.getActive(), SHEET_MB51, MB51_HEADERS);
    const have = new Set(readRows_(sh).map(r => r[0] + '|' + r[1]));
    const add = [];
    (rows || []).forEach(r => {
      const k = String(r.doc) + '|' + String(r.item);
      if (!r.doc || have.has(k)) return;
      have.add(k);
      add.push([String(r.doc), String(r.item), String(r.date || ''), String(r.plant || ''), String(r.material || ''), r.desc || '', String(r.batch || ''),
        Number(r.qty) || 0, r.baseUnit || '', Number(r.qtyEntry) || 0, r.unitEntry || '', String(r.mvt || ''), String(r.customer || ''), String(r.so || '')]);
    });
    if (add.length) {
      sh.getRange(sh.getLastRow() + 1, 1, add.length, MB51_HEADERS.length).setNumberFormat('@').setValues(add);
    }
    return { added: add.length, rows: getMb51(since) };
  });
}

function getMb51(since) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_MB51);
  const from = since || '';
  return readRows_(sh).map(r => ({
    doc: String(r[0]), item: String(r[1]), date: toDateStr_(r[2]) || String(r[2]), plant: String(r[3]), material: String(r[4]), desc: String(r[5]),
    batch: String(r[6]), qty: Number(r[7]) || 0, baseUnit: String(r[8]), qtyEntry: Number(r[9]) || 0, unitEntry: String(r[10]),
    mvt: String(r[11]), customer: String(r[12]), so: String(r[13])
  })).filter(r => !from || r.date >= from);
}

function deleteOrder(id) {
  return withLock_(() => {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_ORDERS);
    const r = findRow_(sh, id);
    if (r !== -1) sh.deleteRow(r);
    return id;
  });
}

function orderStatus_(o) {
  if (o.status === 'Huỷ') return 'Huỷ';
  const qty = Number(o.qty) || 0, picked = Number(o.picked) || 0;
  if (qty > 0 && picked >= qty) return 'Đã lấy đủ';
  return picked > 0 ? 'Lấy một phần' : 'Chưa lấy';
}

function rowToOrder_(r) {
  return {
    id: String(r[0]),
    createdAt: toDateStr_(r[1]),
    customer: String(r[2] || ''),
    code: String(r[3] || ''),
    qty: Number(r[4]) || 0,
    unit: String(r[5] || ''),
    warehouse: String(r[6] || ''),
    pickupDate: toDateStr_(r[7]),
    sender: String(r[8] || ''),
    note: String(r[9] || ''),
    picked: Number(r[10]) || 0,
    status: String(r[11] || 'Chưa lấy'),
    updatedAt: toDateTimeStr_(r[12]),
    toWarehouse: String(r[13] || ''),
    customerSap: String(r[14] || ''),
    codeSap: String(r[15] || ''),
    area: String(r[16] || ''),
    orderNo: String(r[17] || ''),
    lot: String(r[18] || '')
  };
}

function orderToRow_(o) {
  return [
    o.id,
    parseDate_(o.createdAt) || new Date(),
    String(o.customer).trim(),
    String(o.code).trim(),
    Number(o.qty) || 0,
    o.unit || '',
    o.warehouse || '',
    parseDate_(o.pickupDate),
    o.sender || '',
    o.note || '',
    Number(o.picked) || 0,
    orderStatus_(o),
    o.updatedAt || '',
    o.toWarehouse || '',
    String(o.customerSap || '').trim(),
    String(o.codeSap || '').trim().toUpperCase(),
    o.area || '',
    o.orderNo || '',
    String(o.lot || '').trim()
  ];
}

/* ---------- Hàm hỗ trợ ---------- */

function readRows_(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}

function findRow_(sh, id) {
  if (sh.getLastRow() < 2) return -1;
  const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function toDateStr_(v) {
  if (!v) return '';
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d)) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function toDateTimeStr_(v) {
  if (!v) return '';
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d)) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
}

function parseDate_(s) {
  if (!s) return '';
  const p = String(s).split('-');
  return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : '';
}

function rowToTask_(r) {
  return {
    id: String(r[0]),
    title: String(r[1] || ''),
    description: String(r[2] || ''),
    status: String(r[3] || 'Cần làm'),
    priority: String(r[4] || 'Trung bình'),
    assignee: String(r[5] || ''),
    startDate: toDateStr_(r[6]),
    dueDate: toDateStr_(r[7]),
    tags: String(r[8] || ''),
    progress: Number(r[9]) || 0,
    createdBy: String(r[10] || ''),
    createdAt: toDateTimeStr_(r[11]),
    updatedAt: toDateTimeStr_(r[12]),
    area: String(r[13] || '')
  };
}

function taskToRow_(t) {
  return [
    t.id,
    String(t.title).trim(),
    t.description || '',
    t.status || 'Cần làm',
    t.priority || 'Trung bình',
    t.assignee || '',
    parseDate_(t.startDate),
    parseDate_(t.dueDate),
    t.tags || '',
    Math.max(0, Math.min(100, Number(t.progress) || 0)),
    t.createdBy || '',
    t.createdAt || '',
    t.updatedAt || '',
    t.area || ''
  ];
}
