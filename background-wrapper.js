// Can reference this in manifest.json if having trouble loading background.js

try {
  importScripts("background.js");
} catch (e) {
  console.error(e);
}
