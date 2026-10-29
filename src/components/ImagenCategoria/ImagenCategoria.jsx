import { useId } from "react";
import "./ImagenCategoria.css";

// ============================================================
// IMAGEN POR CATEGORÍA
//
// Dibuja una ilustración (SVG en línea) que representa el tipo de un
// registro. La imagen NO se guarda por registro: se elige a partir del
// tipo/categoría, así que cualquier recurso, evento o publicación nueva
// obtiene su imagen automáticamente sin tocar la base de datos.
//
// Uso:
//   <ImagenCategoria grupo="recurso" tipo={recurso.tipo} />
//   <ImagenCategoria grupo="evento" tipo={evento.tipo} />
//   <ImagenCategoria grupo="info" tipo={publicacion.categoria} />
//   <ImagenCategoria grupo="servicio" tipo={servicio.name} />
// ============================================================

function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

const PALETAS = {
    blue: { desde: "#3b7bf6", hasta: "#123c8c" },
    green: { desde: "#22b573", hasta: "#0b543a" },
    purple: { desde: "#8b5cf6", hasta: "#3d1e8f" },
    orange: { desde: "#f59e0b", hasta: "#8a3a08" },
    red: { desde: "#ef4444", hasta: "#7d1616" },
    teal: { desde: "#14b8a6", hasta: "#0b4f57" }
};

const MAPA = {
    recurso: {
        salas: { paleta: "blue", motivo: "sala" },
        laboratorios: { paleta: "green", motivo: "laboratorio" },
        auditorios: { paleta: "purple", motivo: "auditorio" },
        equipos: { paleta: "orange", motivo: "equipo" }
    },
    evento: {
        academico: { paleta: "blue", motivo: "academico" },
        formacion: { paleta: "green", motivo: "formacion" },
        cultural: { paleta: "orange", motivo: "cultural" },
        deportivo: { paleta: "purple", motivo: "deportivo" }
    },
    info: {
        "aviso academico": { paleta: "blue", motivo: "aviso" },
        convocatoria: { paleta: "purple", motivo: "convocatoria" },
        resultado: { paleta: "green", motivo: "resultado" },
        taller: { paleta: "orange", motivo: "taller" },
        seminario: { paleta: "red", motivo: "seminario" },
        calendario: { paleta: "teal", motivo: "reservas" },
        normatividad: { paleta: "red", motivo: "solicitudes" }
    },
    servicio: {
        solicitudes: { paleta: "blue", motivo: "solicitudes" },
        reservas: { paleta: "teal", motivo: "reservas" },
        recursos: { paleta: "green", motivo: "recursos" },
        eventos: { paleta: "purple", motivo: "eventos" },
        notificaciones: { paleta: "orange", motivo: "notificaciones" },
        pqrs: { paleta: "red", motivo: "pqrs" }
    }
};

const BLANCO = "#ffffff";

// Las líneas y huecos usan el color oscuro de la paleta para que la
// ilustración combine con el fondo.
function Motivo({ motivo, oscuro }) {
    switch (motivo) {
        // ---------- Recursos ----------
        case "sala":
            return (
                <g>
                    <rect x="46" y="34" width="148" height="88" rx="10" fill={BLANCO} opacity="0.94" />
                    <rect x="60" y="50" width="70" height="7" rx="3.5" fill={oscuro} opacity="0.30" />
                    <rect x="60" y="66" width="104" height="6" rx="3" fill={oscuro} opacity="0.18" />
                    <rect x="60" y="80" width="88" height="6" rx="3" fill={oscuro} opacity="0.18" />
                    <rect x="222" y="42" width="120" height="70" rx="10" fill={BLANCO} opacity="0.55" />
                    <path d="M222 77h120M282 42v70" stroke={oscuro} strokeWidth="4" opacity="0.22" />
                    <rect x="52" y="146" width="96" height="13" rx="6" fill={BLANCO} opacity="0.9" />
                    <rect x="168" y="146" width="96" height="13" rx="6" fill={BLANCO} opacity="0.78" />
                    <rect x="284" y="146" width="70" height="13" rx="6" fill={BLANCO} opacity="0.62" />
                    <circle cx="76" cy="181" r="13" fill={BLANCO} opacity="0.55" />
                    <circle cx="124" cy="181" r="13" fill={BLANCO} opacity="0.55" />
                    <circle cx="192" cy="181" r="13" fill={BLANCO} opacity="0.48" />
                    <circle cx="240" cy="181" r="13" fill={BLANCO} opacity="0.48" />
                    <circle cx="306" cy="181" r="13" fill={BLANCO} opacity="0.38" />
                </g>
            );

        case "laboratorio":
            return (
                <g>
                    <path d="M176 48h40v40l26 48a30 30 0 0 1-27 44h-38a30 30 0 0 1-27-44l26-48z" fill={BLANCO} opacity="0.94" />
                    <path d="M158 140h76l12 26a18 18 0 0 1-16 25h-68a18 18 0 0 1-16-25z" fill={oscuro} opacity="0.32" />
                    <rect x="120" y="150" width="160" height="12" rx="6" fill={BLANCO} opacity="0.85" />
                    <rect x="300" y="70" width="14" height="80" rx="7" fill={BLANCO} opacity="0.75" />
                    <circle cx="307" cy="160" r="22" fill={BLANCO} opacity="0.9" />
                    <circle cx="307" cy="160" r="12" fill={oscuro} opacity="0.3" />
                    <rect x="80" y="80" width="12" height="70" rx="6" fill={BLANCO} opacity="0.55" />
                    <rect x="104" y="100" width="12" height="50" rx="6" fill={BLANCO} opacity="0.45" />
                </g>
            );

        case "auditorio":
            return (
                <g>
                    <rect x="96" y="26" width="208" height="96" rx="12" fill={BLANCO} opacity="0.94" />
                    <rect x="120" y="48" width="76" height="7" rx="3.5" fill={oscuro} opacity="0.3" />
                    <rect x="120" y="64" width="118" height="6" rx="3" fill={oscuro} opacity="0.18" />
                    <rect x="120" y="78" width="96" height="6" rx="3" fill={oscuro} opacity="0.18" />
                    <rect x="64" y="136" width="272" height="15" rx="7.5" fill={BLANCO} opacity="0.85" />
                    <circle cx="92" cy="184" r="15" fill={BLANCO} opacity="0.5" />
                    <circle cx="146" cy="184" r="15" fill={BLANCO} opacity="0.5" />
                    <circle cx="200" cy="184" r="15" fill={BLANCO} opacity="0.5" />
                    <circle cx="254" cy="184" r="15" fill={BLANCO} opacity="0.5" />
                    <circle cx="308" cy="184" r="15" fill={BLANCO} opacity="0.5" />
                </g>
            );

        case "equipo":
            return (
                <g>
                    <rect x="112" y="58" width="160" height="100" rx="10" fill={BLANCO} opacity="0.94" />
                    <rect x="126" y="72" width="132" height="72" rx="4" fill={oscuro} opacity="0.3" />
                    <rect x="92" y="162" width="200" height="13" rx="6.5" fill={BLANCO} opacity="0.85" />
                    <rect x="292" y="56" width="58" height="36" rx="8" fill={BLANCO} opacity="0.75" />
                    <circle cx="346" cy="74" r="7" fill={oscuro} opacity="0.45" />
                    <path d="M292 74l-38 20" stroke={BLANCO} strokeWidth="5" opacity="0.35" strokeLinecap="round" />
                </g>
            );

        // ---------- Eventos ----------
        case "academico":
            return (
                <g>
                    <path d="M200 50l112 46-112 46-112-46z" fill={BLANCO} opacity="0.95" />
                    <path d="M118 116v42c0 17 37 30 82 30s82-13 82-30v-42l-82 34z" fill={BLANCO} opacity="0.68" />
                    <path d="M312 96v64" stroke={BLANCO} strokeWidth="7" strokeLinecap="round" />
                    <circle cx="312" cy="168" r="10" fill={BLANCO} />
                </g>
            );

        case "formacion":
            return (
                <g>
                    <rect x="78" y="30" width="176" height="104" rx="10" fill={BLANCO} opacity="0.94" />
                    <rect x="96" y="50" width="64" height="7" rx="3.5" fill={oscuro} opacity="0.3" />
                    <rect x="96" y="66" width="104" height="6" rx="3" fill={oscuro} opacity="0.18" />
                    <rect x="96" y="80" width="84" height="6" rx="3" fill={oscuro} opacity="0.18" />
                    <path d="M254 134l26 46" stroke={BLANCO} strokeWidth="8" strokeLinecap="round" opacity="0.8" />
                    <circle cx="120" cy="180" r="17" fill={BLANCO} opacity="0.6" />
                    <circle cx="176" cy="186" r="15" fill={BLANCO} opacity="0.5" />
                    <circle cx="226" cy="190" r="13" fill={BLANCO} opacity="0.4" />
                </g>
            );

        case "cultural":
            return (
                <g>
                    <circle cx="140" cy="158" r="24" fill={BLANCO} opacity="0.94" />
                    <rect x="158" y="54" width="10" height="104" rx="5" fill={BLANCO} opacity="0.94" />
                    <path d="M158 54c34 6 58 20 58 46" stroke={BLANCO} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.94" />
                    <circle cx="270" cy="176" r="20" fill={BLANCO} opacity="0.6" />
                    <path d="M270 60c26 0 44 18 44 40" stroke={BLANCO} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.45" />
                </g>
            );

        case "deportivo":
            return (
                <g>
                    <circle cx="196" cy="104" r="54" fill={BLANCO} opacity="0.94" />
                    <path d="M196 66l22 16-8 26h-28l-8-26z" fill={oscuro} opacity="0.4" />
                    <path d="M196 50v16M196 142v16M142 104h16M234 104h16" stroke={oscuro} strokeWidth="5" opacity="0.3" strokeLinecap="round" />
                    <path d="M52 186h296" stroke={BLANCO} strokeWidth="7" opacity="0.45" strokeLinecap="round" />
                    <path d="M300 120a40 40 0 0 1 0 60" stroke={BLANCO} strokeWidth="6" fill="none" opacity="0.35" />
                </g>
            );

        // ---------- Información académica ----------
        case "aviso":
            return (
                <g>
                    <rect x="80" y="44" width="240" height="112" rx="18" fill={BLANCO} opacity="0.94" />
                    <path d="M150 156l-8 34 44-34z" fill={BLANCO} opacity="0.94" />
                    <circle cx="200" cy="86" r="10" fill={oscuro} opacity="0.45" />
                    <rect x="195" y="104" width="10" height="30" rx="5" fill={oscuro} opacity="0.45" />
                </g>
            );

        case "convocatoria":
            return (
                <g>
                    <path d="M110 96l120-46v120l-120-46z" fill={BLANCO} opacity="0.94" />
                    <rect x="80" y="92" width="34" height="44" rx="10" fill={BLANCO} opacity="0.8" />
                    <path d="M240 78c22 8 34 20 34 32s-12 24-34 32" stroke={BLANCO} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.8" />
                    <path d="M128 136l14 38" stroke={BLANCO} strokeWidth="10" strokeLinecap="round" opacity="0.7" />
                </g>
            );

        case "resultado":
            return (
                <g>
                    <rect x="86" y="120" width="34" height="56" rx="8" fill={BLANCO} opacity="0.55" />
                    <rect x="140" y="92" width="34" height="84" rx="8" fill={BLANCO} opacity="0.75" />
                    <rect x="194" y="62" width="34" height="114" rx="8" fill={BLANCO} opacity="0.94" />
                    <circle cx="296" cy="92" r="34" fill={BLANCO} opacity="0.9" />
                    <path d="M282 92l10 11 20-22" stroke={oscuro} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                </g>
            );

        case "taller":
            return (
                <g>
                    <path d="M100 54h84a26 26 0 0 1 26 26v94h-84a26 26 0 0 1-26-26z" fill={BLANCO} opacity="0.94" />
                    <path d="M226 54h74v120h-74" fill={BLANCO} opacity="0.6" />
                    <path d="M262 70l34 34-52 52-30 8 8-30z" fill={BLANCO} opacity="0.85" />
                </g>
            );

        case "seminario":
            return (
                <g>
                    <rect x="150" y="46" width="100" height="12" rx="6" fill={BLANCO} opacity="0.9" />
                    <path d="M168 58h64l-8 82h-48z" fill={BLANCO} opacity="0.75" />
                    <circle cx="120" cy="170" r="16" fill={BLANCO} opacity="0.55" />
                    <circle cx="280" cy="170" r="16" fill={BLANCO} opacity="0.55" />
                    <circle cx="160" cy="186" r="14" fill={BLANCO} opacity="0.4" />
                    <circle cx="240" cy="186" r="14" fill={BLANCO} opacity="0.4" />
                </g>
            );

        // ---------- Servicios ----------
        case "solicitudes":
            return (
                <g>
                    <path d="M130 34h96l44 44v108H130z" fill={BLANCO} opacity="0.94" />
                    <path d="M226 34v44h44" fill={BLANCO} opacity="0.55" />
                    <rect x="154" y="96" width="76" height="7" rx="3.5" fill={oscuro} opacity="0.3" />
                    <rect x="154" y="114" width="58" height="7" rx="3.5" fill={oscuro} opacity="0.2" />
                    <circle cx="248" cy="152" r="30" fill={BLANCO} opacity="0.92" />
                    <path d="M234 152l10 11 20-22" stroke={oscuro} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
                </g>
            );

        case "reservas":
            return (
                <g>
                    <rect x="100" y="46" width="200" height="140" rx="18" fill={BLANCO} opacity="0.94" />
                    <rect x="100" y="46" width="200" height="42" rx="18" fill={BLANCO} opacity="0.55" />
                    <circle cx="144" cy="98" r="10" fill={oscuro} opacity="0.45" />
                    <circle cx="200" cy="98" r="10" fill={oscuro} opacity="0.25" />
                    <circle cx="256" cy="98" r="10" fill={oscuro} opacity="0.25" />
                    <circle cx="144" cy="140" r="10" fill={oscuro} opacity="0.25" />
                    <circle cx="200" cy="140" r="10" fill={oscuro} opacity="0.45" />
                    <circle cx="256" cy="140" r="10" fill={oscuro} opacity="0.25" />
                    <path d="M138 36v20M262 36v20" stroke={BLANCO} strokeWidth="10" strokeLinecap="round" />
                </g>
            );

        case "recursos":
            return (
                <g>
                    <path d="M200 40l96 40-96 40-96-40z" fill={BLANCO} opacity="0.9" />
                    <path d="M104 80v52l96 40v-52z" fill={BLANCO} opacity="0.62" />
                    <path d="M296 80v52l-96 40v-52z" fill={BLANCO} opacity="0.75" />
                    <path d="M104 80l96 40 96-40" stroke={oscuro} strokeWidth="4" opacity="0.2" fill="none" />
                </g>
            );

        case "eventos":
            return (
                <g>
                    <rect x="100" y="46" width="200" height="140" rx="18" fill={BLANCO} opacity="0.92" />
                    <rect x="100" y="46" width="200" height="42" rx="18" fill={BLANCO} opacity="0.5" />
                    <path d="M200 106l9 18 20 3-14 14 3 20-18-10-18 10 3-20-14-14 20-3z" fill={oscuro} opacity="0.35" />
                    <path d="M138 36v20M262 36v20" stroke={BLANCO} strokeWidth="10" strokeLinecap="round" />
                </g>
            );

        case "notificaciones":
            return (
                <g>
                    <path d="M200 42a58 58 0 0 1 58 58v38l16 22H126l16-22v-38a58 58 0 0 1 58-58z" fill={BLANCO} opacity="0.94" />
                    <path d="M176 174a24 24 0 0 0 48 0" stroke={BLANCO} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.8" />
                    <circle cx="258" cy="60" r="18" fill={BLANCO} opacity="0.9" />
                    <circle cx="258" cy="60" r="8" fill={oscuro} opacity="0.35" />
                </g>
            );

        case "pqrs":
            return (
                <g>
                    <path d="M92 52h176a18 18 0 0 1 18 18v68a18 18 0 0 1-18 18h-70l-40 30v-30h-66a18 18 0 0 1-18-18V70a18 18 0 0 1 18-18z" fill={BLANCO} opacity="0.94" />
                    <circle cx="140" cy="104" r="8" fill={oscuro} opacity="0.35" />
                    <circle cx="180" cy="104" r="8" fill={oscuro} opacity="0.35" />
                    <circle cx="220" cy="104" r="8" fill={oscuro} opacity="0.35" />
                    <path d="M262 118h46a14 14 0 0 1 14 14v40a14 14 0 0 1-14 14h-10l-22 18v-18h-14" fill={BLANCO} opacity="0.6" />
                </g>
            );

        default:
            return (
                <g>
                    <rect x="90" y="70" width="90" height="90" rx="14" fill={BLANCO} opacity="0.85" />
                    <rect x="200" y="50" width="110" height="70" rx="14" fill={BLANCO} opacity="0.6" />
                    <rect x="180" y="140" width="130" height="46" rx="14" fill={BLANCO} opacity="0.45" />
                </g>
            );
    }
}

function ImagenCategoria({ grupo = "recurso", tipo, semilla, className = "" }) {
    const clave = normalizar(tipo);
    const definicion = MAPA[grupo]?.[clave] || { paleta: "blue", motivo: "generico" };
    const paleta = PALETAS[definicion.paleta] || PALETAS.blue;

    // Variación ligera y estable: la mitad de las tarjetas del mismo tipo se
    // dibujan espejadas. Así la lista no parece una imagen repetida.
    const marca = String(semilla ?? tipo ?? "");
    let suma = 0;
    for (let i = 0; i < marca.length; i += 1) suma += marca.charCodeAt(i);
    const espejo = marca !== "" && suma % 2 === 1;

    // useId evita gradientes con el mismo id cuando hay varias tarjetas.
    const uid = useId().replace(/[:]/g, "");
    const gradId = `ic-${uid}`;

    return (
        <svg
            className={`imagen-categoria ${className}`.trim()}
            viewBox="0 0 400 220"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={paleta.desde} />
                    <stop offset="100%" stopColor={paleta.hasta} />
                </linearGradient>
            </defs>
            <rect width="400" height="220" fill={`url(#${gradId})`} />
            <circle cx="332" cy="36" r="92" fill="#ffffff" opacity="0.08" />
            <circle cx="56" cy="206" r="74" fill="#ffffff" opacity="0.06" />
            <g transform={espejo ? "translate(400 0) scale(-1 1)" : undefined}>
                <Motivo motivo={definicion.motivo} oscuro={paleta.hasta} />
            </g>
        </svg>
    );
}

export default ImagenCategoria;
