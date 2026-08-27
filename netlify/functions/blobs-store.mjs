import { getStore } from "@netlify/blobs";

// Centrale helper om de Blobs store op te halen. Gebruikt handmatige
// configuratie met site ID en token als die beschikbaar zijn, dat is
// betrouwbaarder dan automatische herkenning, vooral bij Background
// Functions in lokale ontwikkeling. Valt terug op automatische herkenning
// als de omgevingsvariabelen ontbreken.

export function haalTakenStoreOp() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (siteID && token) {
    return getStore({ name: "schrijfwijzer-taken", siteID, token });
  }

  return getStore("schrijfwijzer-taken");
}
