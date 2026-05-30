/**
 * Gym Tracker — Google Apps Script backend
 * --------------------------------------------------------------
 * Paste this into the Apps Script editor of the Google Sheet you
 * want to use as the database (Extensions ▸ Apps Script), then
 * Deploy ▸ New deployment ▸ Web app:
 *   - Execute as: Me
 *   - Who has access: Anyone with the link
 * Copy the resulting /exec URL and paste it into the app's Settings.
 *
 * The script lazily creates the tabs/headers it needs on first run,
 * so you can start from a blank spreadsheet.
 */

var TABLES = {
  Exercises: ['id', 'name', 'weightType', 'category', 'step', 'inverted', 'archived', 'sortOrder', 'updated'],
  Workouts:  ['id', 'date', 'type', 'participants', 'status', 'notes', 'updated'],
  Sets:      ['id', 'workoutId', 'exerciseId', 'person', 'scheme', 'weight', 'reps', 'ts', 'updated']
};

// Wraps any object as a JSON HTTP response.
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return json(getAll_());
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var req = JSON.parse(e.postData.contents);
    var actions = req.actions || [];
    for (var i = 0; i < actions.length; i++) {
      upsert_(actions[i].table, actions[i].row);
    }
    return json({ ok: true, data: getAll_() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getAll_() {
  var out = {};
  Object.keys(TABLES).forEach(function (name) {
    out[name] = readTable_(name);
  });
  return out;
}

function sheetFor_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(TABLES[name]);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(TABLES[name]);
  }
  return sh;
}

function readTable_(name) {
  var sh = sheetFor_(name);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var obj = {};
    var blank = true;
    for (var c = 0; c < headers.length; c++) {
      obj[headers[c]] = values[r][c];
      if (values[r][c] !== '' && values[r][c] !== null) blank = false;
    }
    if (!blank) rows.push(obj);
  }
  return rows;
}

function upsert_(name, row) {
  if (!TABLES[name]) throw new Error('Unknown table: ' + name);
  var sh = sheetFor_(name);
  var headers = TABLES[name];
  var data = sh.getDataRange().getValues();
  var idCol = 0; // 'id' is always first
  var rowValues = headers.map(function (h) { return row[h] === undefined ? '' : row[h]; });

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][idCol]) === String(row.id)) {
      sh.getRange(r + 1, 1, 1, headers.length).setValues([rowValues]);
      return;
    }
  }
  sh.appendRow(rowValues);
}
