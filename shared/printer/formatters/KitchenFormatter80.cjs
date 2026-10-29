const LINE_WIDTH = 48;

function center(text) {
  if (text.length >= LINE_WIDTH) {
    return text.slice(0, LINE_WIDTH);
  }

  const left = Math.floor(
    (LINE_WIDTH - text.length) / 2
  );

  return ' '.repeat(left) + text;
}

function line(char = '-') {
  return char.repeat(LINE_WIDTH);
}

class KitchenFormatter80 {
  format(data, _paperSize) {
    let out = '';

    out += center('*** KITCHEN ORDER ***') + '\n';
    out += line('=') + '\n';

    out += `KOT NO : ${data.kotNumber}\n`;
    out += `TABLE  : ${data.tableName || data.tableNo}\n`;
    out += `TYPE   : ${data.orderType}\n`;
if (data.createdByName) {
  out += `STEWARD: ${data.createdByName}\n`;
}

    const dt = new Date(data.createdAt);
    out += dt.toLocaleString() + '\n';

    out += line() + '\n';

    for (const item of data.items) {
      const qty = String(item.quantity).padStart(3, ' ');

      out += `${qty} x ${item.name.toUpperCase()}\n`;

      if (item.note && item.note.trim()) {
        out += `      NOTE: ${item.note}\n`;
      }

      out += '\n';
    }

    out += line('=') + '\n';
    // out += center('SEND TO KITCHEN') + '\n';
    out += '\n';

    return out;
  }
}

module.exports = {
  KitchenFormatter80,
};