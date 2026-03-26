// ═══════════════════════════════════════════════════
// GOOGLE APPS SCRIPT — Paste this into script.google.com
// to collect visitor login data in a Google Sheet.
//
// SETUP STEPS:
// 1. Go to https://sheets.google.com → Create a new spreadsheet
// 2. Name it "Portfolio Visitors" (or whatever you like)
// 3. In Row 1, add headers:  Name | Phone | Timestamp
// 4. Go to Extensions → Apps Script
// 5. Delete the default code and paste THIS entire file
// 6. Click Deploy → New Deployment
// 7. Type = "Web app"
// 8. Execute as = "Me"
// 9. Who has access = "Anyone"
// 10. Click Deploy → Copy the Web App URL
// 11. Paste that URL into script.js where it says:
//     const SHEET_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
// ═══════════════════════════════════════════════════

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.name || "",
      data.phone || "",
      data.timestamp || new Date().toISOString()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("Portfolio visitor logger is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}
