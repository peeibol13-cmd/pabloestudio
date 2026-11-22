// Recibe las reservas de la web, las apunta en una hoja de Google, te avisa y devuelve las horas ocupadas.

var EMAIL = "peeibol13@gmail.com";   // aquí te llega el aviso de cada cita
var TELEGRAM_TOKEN = "";                       // opcional: aviso instantáneo en Telegram (mira el LEEME)
var TELEGRAM_CHAT_ID = "";
var HOJA = "Citas";

function hoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName(HOJA);
  if (!h) {
    h = ss.insertSheet(HOJA);
    h.appendRow(["Reservada el", "Día", "Hora", "Servicio", "Precio", "Nombre", "Teléfono", "Nota", "Estado"]);
    h.getRange("B:C").setNumberFormat("@");
  }
  return h;
}

function texto_(v, formato) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), formato);
  return String(v).trim();
}

function ocupadas_() {
  var d = hoja_().getDataRange().getValues(), o = [];
  for (var i = 1; i < d.length; i++) {
    var estado = String(d[i][8]).trim();
    if (estado === "Cancelada") continue;           // cambia el Estado a "Cancelada" para liberar la hora
    o.push(texto_(d[i][1], "yyyy-MM-dd") + " " + texto_(d[i][2], "HH:mm"));
  }
  return o;
}

function limpiar_(v, max) {
  v = String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(v) ? "'" + v : v;          // evita fórmulas en la hoja
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ ocupadas: ocupadas_() });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var d = JSON.parse(e.postData.contents);
    var dia = String(d.dia || ""), hora = String(d.hora || "");
    var nombre = limpiar_(d.nombre, 60), tel = limpiar_(d.telefono, 20);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia) || !/^\d{2}:\d{2}$/.test(hora) || !nombre || !tel) return json_({ ok: false, error: "datos" });
    if (ocupadas_().indexOf(dia + " " + hora) > -1) return json_({ ok: false, error: "ocupada" });

    var h = hoja_(), fila = h.getLastRow() + 1;
    h.getRange(fila, 2, 1, 2).setNumberFormat("@");
    h.getRange(fila, 1, 1, 9).setValues([[new Date(), dia, hora, limpiar_(d.servicio, 80), Number(d.precio) || "", nombre, tel, limpiar_(d.nota, 300), "Reservada"]]);

    var resumen = "Nueva cita\n\n" + nombre + " · " + tel + "\n" + limpiar_(d.servicio, 80) + " (" + (Number(d.precio) || "") + " €)\n" + dia + " a las " + hora + (d.nota ? "\nNota: " + limpiar_(d.nota, 300) : "");
    MailApp.sendEmail(EMAIL, "Nueva cita: " + nombre + " · " + dia + " " + hora, resumen);
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      UrlFetchApp.fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage", {
        method: "post", contentType: "application/json", muteHttpExceptions: true,
        payload: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: resumen })
      });
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "fallo" });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
