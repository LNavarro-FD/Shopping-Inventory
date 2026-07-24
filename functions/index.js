/* ============================================================
   Cloud Functions for La Lista / El Nook push notifications.

   Two triggers, one for each shared list:
   - onCurrentListItemAdded: fires when a brand-new item appears
     under /currentList (the main shopping list). Does NOT fire
     again just because a qty or checked state changes on an
     existing item — only on genuinely new items.
   - onRequestItemAdded: same idea for /requests (El Nook flags).

   Both call notifyAll(), which reads every token stored under
   /deviceTokens and sends a push to each one via Firebase Cloud
   Messaging. If a token has gone stale (user uninstalled, revoked
   permission, etc.) it's removed automatically on send failure.
============================================================ */
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();

async function notifyAll(title, body) {
  const tokensSnap = await admin.database().ref("deviceTokens").once("value");
  const tokensObj = tokensSnap.val() || {};
  const tokens = Object.keys(tokensObj);
  if (tokens.length === 0) return;

  const message = {
    notification: { title, body },
    tokens
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    // Clean up any tokens that are no longer valid
    const staleTokens = [];
    response.responses.forEach((r, i) => {
      if (!r.success) staleTokens.push(tokens[i]);
    });
    if (staleTokens.length) {
      const updates = {};
      staleTokens.forEach((tok) => { updates["deviceTokens/" + tok] = null; });
      await admin.database().ref().update(updates);
    }
  } catch (e) {
    console.error("Error sending notification", e);
  }
}

exports.onCurrentListItemAdded = functions.database
  .ref("/currentList/{itemId}")
  .onCreate(async (snapshot) => {
    const item = snapshot.val() || {};
    const name = item.name_es || item.name_en || "Un artículo";
    const addedBy = item.addedBy ? ` (${item.addedBy})` : "";
    await notifyAll("La Lista", `Añadido: ${name}${addedBy}`);
  });

exports.onRequestItemAdded = functions.database
  .ref("/requests/{requestId}")
  .onCreate(async (snapshot) => {
    const item = snapshot.val() || {};
    const name = item.name_es || item.name_en || "Un artículo";
    const by = item.requestedBy ? ` (${item.requestedBy})` : "";
    await notifyAll("El Nook", `Aviso: ${name}${by}`);
  });
