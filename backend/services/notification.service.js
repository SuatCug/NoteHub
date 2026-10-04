const { Notification } = require('../models');

// Aynı kişinin aynı hedefe tekrar yaptığı bu olaylar yeni kayıt açmaz; mevcut bildirim öne alınıp okunmamış yapılır.
const COLLAPSIBLE_TYPES = ['like', 'follow', 'group_join', 'group_request', 'group_approved'];

const toId = (v) => (v ? String(v) : undefined);

// Bildirim oluşturur. Kişi kendi eylemi için bildirim almaz. Bildirim hatası asıl işlemi bozmasın diye hata yutulur.
const notify = async ({ recipient, actor, type, note, group, text }) => {
  if (!recipient || toId(recipient) === toId(actor)) return;
  try {
    const key = { recipient, actor, type, ...(note && { note }), ...(group && { group }) };
    if (COLLAPSIBLE_TYPES.includes(type)) {
      await Notification.findOneAndUpdate(
        key,
        { $set: { read: false, createdAt: new Date() } },
        { upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      await Notification.create({ ...key, text: text?.slice(0, 140) });
    }
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

// Geri alınan eylemlerin (beğeniyi / takibi kaldırma, yorumu silme) bildirimi silinir.
const removeNotification = async ({ recipient, actor, type, note, group, text }) => {
  try {
    await Notification.deleteOne({ recipient, actor, type, ...(note && { note }), ...(group && { group }), ...(text && { text }) });
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

module.exports = { notify, removeNotification };
