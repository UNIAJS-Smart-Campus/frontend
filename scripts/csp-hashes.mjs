// Calcula los hashes SHA-256 de los bloques <style>/<script> inline que Vite
// emite en dist/index.html. Son los valores que van en la cabecera
// Content-Security-Policy de vercel.json: si se edita index.html (el splash o
// el script de tema), hay que volver a correr esto y actualizar la cabecera.
//
// Uso:  npm run build && npm run csp:hashes
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist/index.html");

let html;
try {
	html = readFileSync(dist, "utf8");
} catch {
	console.error("No existe dist/index.html. Ejecuta primero: npm run build");
	process.exit(1);
}

const bloques = [...html.matchAll(/<(style|script)(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/\1>/g)];

if (!bloques.length) {
	console.error("No se encontraron bloques inline en dist/index.html.");
	process.exit(1);
}

for (const [, tag, body] of bloques) {
	// Vercel compila en Linux y git guarda index.html con LF: los hashes tienen
	// que calcularse sobre LF aunque el checkout local sea CRLF (Windows).
	const normalizado = body.replace(/\r\n/g, "\n");
	const hash = createHash("sha256").update(normalizado, "utf8").digest("base64");
	console.log(`<${tag}> 'sha256-${hash}'`);
}
