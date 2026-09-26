# Заявки в Google Таблицу

Каждая заявка с сайта (и позже — от агента Camirix) добавляется строкой в твою таблицу.
Ключей Google не нужно: таблица сама принимает строки через маленький скрипт.

## Настройка (5 минут, один раз)

1. Создай таблицу на sheets.google.com, назови «Ember Court — лиды».
2. Меню **Расширения → Apps Script**. Удали всё, что там есть, и вставь код ниже. Нажми 💾.
3. **Начать развертывание → Новое развертывание** → тип **Веб-приложение**:
   - Выполнять как: **Я**
   - У кого есть доступ: **Все**
   → **Развернуть** → разреши доступ своему аккаунту (Дополнительно → Перейти…).
4. Скопируй **URL веб-приложения** (заканчивается на `/exec`).
5. Vercel → ember-court → Settings → Environment Variables → `LEADS_SHEET_URL` = этот URL (Production) → Save → Deployments → Redeploy.

URL не публикуй: кто его знает, может дописывать строки в таблицу.

## Код скрипта

```js
const HEAD = ["Дата", "Имя", "Компания", "Связь", "Что нужно", "Язык", "Источник", "Статус", "Следующий шаг", "Заметки"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEAD);
      sh.getRange(1, 1, 1, HEAD.length).setFontWeight("bold");
      sh.setFrozenRows(1);
    }
    const d = JSON.parse(e.postData.contents);
    // A leading "=" would make Sheets run the visitor's text as a formula: store it as text.
    const safe = (v) => { const s = String(v || "").slice(0, 300); return /^[=+\-@]/.test(s) ? "'" + s : s; };
    sh.appendRow([new Date(), safe(d.name), safe(d.site), safe(d.contact), safe(d.need), safe(d.lang), safe(d.source), "новая", "", ""]);
    return ContentService.createTextOutput('{"ok":true}').setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// The Monday report asks how many requests came in: rows from the last 7 days and in total.
function doGet() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const rows = Math.max(sh.getLastRow() - 1, 0);
  const since = Date.now() - 7 * 864e5;
  const dates = rows ? sh.getRange(2, 1, rows, 1).getValues().flat() : [];
  const week = dates.filter((d) => d instanceof Date && d.getTime() >= since).length;
  return ContentService.createTextOutput(JSON.stringify({ week, total: rows })).setMimeType(ContentService.MimeType.JSON);
}
```

Колонки «Статус», «Следующий шаг», «Заметки» — для тебя: новая → написали → созвон → клиент / отказ.
