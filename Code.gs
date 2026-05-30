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
  Sets:      ['id', 'workoutId', 'exerciseId', 'person', 'scheme', 'weight', 'reps', 'ts', 'updated', 'duration', 'rest', 'number', 'warmup']
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
    return sh;
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(TABLES[name]);
    return sh;
  }
  // Schema evolution: make sure every column the app now expects exists,
  // appending any that are missing (e.g. the sprint columns) to the header.
  var hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var missing = TABLES[name].filter(function (c) { return hdr.indexOf(c) === -1; });
  if (missing.length) {
    sh.getRange(1, hdr.length + 1, 1, missing.length).setValues([missing]);
  }
  return sh;
}

function headerOf_(sh) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
}

function readTable_(name) {
  var sh = sheetFor_(name);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var obj = {};
    var blank = true;
    for (var c = 0; c < headers.length; c++) {
      var v = values[r][c];
      // Dates (the workout date) come back as Date objects — emit a clean
      // 'yyyy-MM-dd' string instead of a timezone-shifted ISO timestamp.
      if (v instanceof Date) v = Utilities.formatDate(v, tz, 'yyyy-MM-dd');
      obj[headers[c]] = v;
      if (v !== '' && v !== null) blank = false;
    }
    if (!blank) rows.push(obj);
  }
  return rows;
}

function upsert_(name, row) {
  if (!TABLES[name]) throw new Error('Unknown table: ' + name);
  var sh = sheetFor_(name);
  var headers = headerOf_(sh);          // write by the sheet's own column order
  var idCol = headers.indexOf('id');
  if (idCol < 0) idCol = 0;
  var rowValues = headers.map(function (h) { return row[h] === undefined ? '' : row[h]; });
  var data = sh.getDataRange().getValues();

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][idCol]) === String(row.id)) {
      sh.getRange(r + 1, 1, 1, headers.length).setValues([rowValues]);
      return;
    }
  }
  sh.appendRow(rowValues);
}
