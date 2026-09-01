import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { Linking, Platform, Share } from "react-native";

export const CAPACIDADES_EXPORTACION = {
    imagenTemporal: true,
    compartirNativo: true,
    pdf: true,
    pdfTemporal: true,
    descargaPersistente: true,
    guardadoNativo: true,
    visorExterno: true,
    galeria: false,
};

export function obtenerCapacidadesExportacion() {
    return {
        ...CAPACIDADES_EXPORTACION,
    };
}

export function crearNombreArchivo(base = "infografia", extension = "png") {
    const limpio = String(base)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);

    return `${limpio || "infografia"}-${Date.now()}.${extension}`;
}

function tieneTexto(valor) {
    return String(valor || "").trim().length > 0;
}

function texto(valor) {
    return String(valor || "").trim();
}

function escaparHtml(valor) {
    return texto(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function textoConSaltos(valor) {
    return escaparHtml(valor).replace(/\r?\n/g, "<br />");
}

function normalizarCampos(campos = []) {
    if (!Array.isArray(campos)) {
        return [];
    }

    return campos
        .map((campo) => ({
            id: campo.id || campo.etiqueta || campo.label,
            etiqueta: campo.etiqueta || campo.label,
            valor: campo.valor || campo.value,
        }))
        .filter(
            (campo) =>
                tieneTexto(campo.etiqueta) && tieneTexto(campo.valor)
        );
}

function normalizarItem(item = {}, indice) {
    const contenido = item.contenido || item.elemento || item;

    return {
        id: item.id || contenido.id || `item-${indice}`,
        tipo: item.tipo || contenido.tipo || "item",
        titulo:
            item.titulo ||
            contenido.nombre ||
            contenido.titulo ||
            `Item ${indice + 1}`,
        subtitulo:
            item.subtitulo || contenido.nombre_cientifico || "",
        nivel_riesgo:
            item.nivel_riesgo || contenido.nivel_riesgo || null,
        descripcion:
            item.descripcion || contenido.descripcion || "",
        instrucciones:
            item.instrucciones || contenido.instrucciones || "",
        indicadores: Array.isArray(item.indicadores)
            ? item.indicadores.filter(tieneTexto)
            : [],
        campos: normalizarCampos(item.campos || contenido.campos),
    };
}

function normalizarSeccion(seccion = {}, indice) {
    const items = Array.isArray(seccion.items)
        ? seccion.items
        : Array.isArray(seccion.recomendaciones)
          ? seccion.recomendaciones
          : [];

    return {
        id: seccion.id || seccion.clave || `seccion-${indice}`,
        clave: seccion.clave || seccion.tipo || `seccion-${indice}`,
        tipo: seccion.tipo || seccion.clave || "seccion",
        titulo: seccion.titulo || `Seccion ${indice + 1}`,
        emptyText:
            seccion.emptyText ||
            "No existe informacion registrada para esta seccion.",
        items: items.map(normalizarItem),
    };
}

export function normalizarDocumentoPdf({
    titulo = "Infografia del cultivo",
    subtitulo = "",
    cultivo = null,
    etapa = null,
    secciones = [],
    infografias = [],
    generadoEn = null,
} = {}) {
    const seccionesEntrada = Array.isArray(secciones) && secciones.length
        ? secciones
        : infografias;
    const seccionesNormalizadas = (Array.isArray(seccionesEntrada)
        ? seccionesEntrada
        : []
    ).map(normalizarSeccion);

    return {
        titulo: texto(titulo) || "Infografia del cultivo",
        subtitulo: texto(subtitulo || cultivo?.nombre_cientifico),
        cultivo,
        etapa,
        secciones: seccionesNormalizadas,
        totalSecciones: seccionesNormalizadas.length,
        generadoEn: generadoEn || new Date().toISOString(),
    };
}

function claseCss(valor, fallback = "item") {
    const limpio = texto(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return limpio || fallback;
}

function obtenerInicial(valor) {
    const limpio = texto(valor);

    return escaparHtml(limpio.charAt(0).toUpperCase() || "A");
}

function obtenerIconoSeccion(clave) {
    const normalizado = claseCss(clave, "seccion");

    if (normalizado === "informacion") {
        return "i";
    }

    if (normalizado === "enfermedades") {
        return "+";
    }

    if (normalizado === "plagas") {
        return "*";
    }

    if (normalizado === "recomendaciones") {
        return "R";
    }

    return "A";
}

function renderCampo(campo) {
    return `
        <div class="field field-${claseCss(campo.id || campo.etiqueta, "dato")}">
            <span>${escaparHtml(campo.etiqueta)}</span>
            <p>${textoConSaltos(campo.valor)}</p>
        </div>
    `;
}

function renderIndicadores(indicadores = []) {
    if (!indicadores.length) {
        return "";
    }

    return `
        <div class="indicators">
            <h4>Indicadores clave</h4>
            ${indicadores
                .map(
                    (indicador) => `
                        <div class="check-row">
                            <span class="check">&#10003;</span>
                            <p>${escaparHtml(indicador)}</p>
                        </div>
                    `
                )
                .join("")}
        </div>
    `;
}

function claseRiesgo(riesgo) {
    const normalizado = texto(riesgo).toLowerCase();

    if (normalizado.includes("alto")) {
        return "risk risk-high";
    }

    if (normalizado.includes("bajo")) {
        return "risk risk-low";
    }

    if (normalizado.includes("medio")) {
        return "risk risk-medium";
    }

    return "risk";
}

function renderCamposItem(item) {
    const campos = item.campos.map(renderCampo).join("");
    const descripcionLibre =
        !campos && tieneTexto(item.descripcion)
            ? `<p class="item-text">${textoConSaltos(
                  item.descripcion
              )}</p>`
            : "";
    const instrucciones =
        tieneTexto(item.instrucciones) &&
        !item.campos.some((campo) => campo.id === "instrucciones")
            ? `<p class="item-text">${textoConSaltos(
                  item.instrucciones
              )}</p>`
            : "";

    return `
        <div class="item-fields">
            ${campos || descripcionLibre || '<p class="empty">Sin detalle registrado.</p>'}
            ${instrucciones}
        </div>
    `;
}

function renderItem(item, seccion) {
    const claveSeccion = claseCss(seccion.clave, "seccion");
    const tipoItem = claseCss(item.tipo, "item");
    const mostrarTipo =
        claveSeccion === "recomendaciones" && tieneTexto(item.tipo);

    return `
        <article class="item item-${tipoItem}">
            <div class="item-marker">${obtenerInicial(item.titulo)}</div>
            <div class="item-body">
                <div class="item-head">
                    <div class="item-title-wrap">
                        ${
                            mostrarTipo
                                ? `<span class="type-tag">${escaparHtml(
                                      item.tipo
                                  )}</span>`
                                : ""
                        }
                        <h3>${escaparHtml(item.titulo)}</h3>
                        ${
                            tieneTexto(item.subtitulo)
                                ? `<p class="scientific">${escaparHtml(
                                      item.subtitulo
                                  )}</p>`
                                : ""
                        }
                    </div>
                    ${
                        tieneTexto(item.nivel_riesgo)
                            ? `<span class="${claseRiesgo(
                                  item.nivel_riesgo
                              )}">${escaparHtml(item.nivel_riesgo)}</span>`
                            : ""
                    }
                </div>
                ${renderCamposItem(item)}
                ${renderIndicadores(item.indicadores)}
            </div>
        </article>
    `;
}

function renderItemInformacion(item) {
    const campos = item.campos.map(renderCampo).join("");
    const indicadores = renderIndicadores(item.indicadores);
    const claseLayout =
        campos && indicadores ? "info-layout" : "info-layout info-single";

    return `
        <article class="${claseLayout}">
            ${
                campos
                    ? `<div class="info-panel">
                        <h3>${escaparHtml(item.titulo)}</h3>
                        ${campos}
                    </div>`
                    : ""
            }
            ${indicadores ? `<div class="info-panel">${indicadores}</div>` : ""}
        </article>
    `;
}

function renderSeccion(seccion) {
    const claseSeccion = claseCss(seccion.clave, "seccion");
    const contenido = seccion.items.length
        ? seccion.items
              .map((item) =>
                  claseSeccion === "informacion"
                      ? renderItemInformacion(item)
                      : renderItem(item, seccion)
              )
              .join("")
        : `<p class="empty">${escaparHtml(seccion.emptyText)}</p>`;

    return `
        <section class="section section-${claseSeccion}">
            <div class="section-head">
                <span class="section-icon">${obtenerIconoSeccion(
                    seccion.clave
                )}</span>
                <h2>${escaparHtml(seccion.titulo)}</h2>
            </div>
            <div class="section-body">
                ${contenido}
            </div>
        </section>
    `;
}

function formatearFecha(iso) {
    const fecha = new Date(iso);

    if (Number.isNaN(fecha.getTime())) {
        return "";
    }

    return fecha.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatearHora(iso) {
    const fecha = new Date(iso);

    if (Number.isNaN(fecha.getTime())) {
        return "";
    }

    return fecha.toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function renderMetaSuperior(documento, fecha, hora) {
    const generado = fecha
        ? `<div>Generado: ${escaparHtml(fecha)}${
              hora ? ` - ${escaparHtml(hora)}` : ""
          }</div>`
        : "";
    const etapa = documento.etapa?.orden
        ? `Etapa: ${escaparHtml(documento.etapa.orden)}`
        : "";
    const duracion = documento.etapa?.duracion_dias_estimada
        ? `Duracion estimada: ${escaparHtml(
              documento.etapa.duracion_dias_estimada
          )} dias`
        : "";
    const separador = etapa && duracion ? "<span>&bull;</span>" : "";
    const etapaDuracion = etapa || duracion
        ? `<div>${etapa}${separador}${duracion}</div>`
        : "";

    if (!generado && !etapaDuracion) {
        return "";
    }

    return `
        <div class="header-meta">
            ${generado}
            ${etapaDuracion}
        </div>
    `;
}

function renderPillsEtapa(etapa = {}) {
    const pills = [];

    if (etapa.orden) {
        pills.push(`<span class="pill">Etapa ${escaparHtml(etapa.orden)}</span>`);
    }

    if (etapa.duracion_dias_estimada) {
        pills.push(
            `<span class="pill">${escaparHtml(
                etapa.duracion_dias_estimada
            )} dias</span>`
        );
    }

    if (!pills.length) {
        return "";
    }

    return `<div class="meta-row">${pills.join("")}</div>`;
}

function crearHtmlDocumento(documento) {
    const fecha = formatearFecha(documento.generadoEn);
    const hora = formatearHora(documento.generadoEn);
    const seccionesHtml = documento.secciones
        .map(renderSeccion)
        .join("");

    return `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8" />
                <style>
                    @page {
                        margin: 16mm;
                        size: A4 portrait;
                    }

                    * {
                        box-sizing: border-box;
                    }

                    html {
                        background: #ffffff;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        background: #ffffff;
                        color: #15271f;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                        margin: 0;
                        print-color-adjust: exact;
                    }

                    .document {
                        background: #ffffff;
                        border: 1px solid #d9e6dc;
                        border-radius: 9px;
                        padding: 16px;
                    }

                    .topbar {
                        align-items: flex-start;
                        display: flex;
                        gap: 18px;
                        justify-content: space-between;
                    }

                    .brand-block {
                        min-width: 220px;
                    }

                    .brand {
                        color: #0a6b43;
                        font-size: 24px;
                        font-weight: 900;
                        line-height: 1;
                        margin: 0;
                    }

                    .brand-rule {
                        background: #0a6b43;
                        border-radius: 999px;
                        height: 4px;
                        margin-top: 6px;
                        width: 54px;
                    }

                    .header-meta {
                        color: #172820;
                        font-size: 12px;
                        font-weight: 800;
                        line-height: 1.55;
                        text-align: right;
                    }

                    .header-meta span {
                        color: #0f6b43;
                        padding: 0 5px;
                    }

                    .hero {
                        background: linear-gradient(120deg, #f8fcf6 0%, #ffffff 55%, #dfeedd 56%, #f4efe0 100%);
                        border: 1px solid #d1e0d2;
                        border-radius: 7px;
                        margin-top: 14px;
                        min-height: 160px;
                        overflow: hidden;
                        padding: 20px 260px 18px 22px;
                        page-break-inside: avoid;
                        position: relative;
                    }

                    .hero::after {
                        background:
                            linear-gradient(100deg, rgba(255, 255, 255, 0.78) 0 14%, transparent 14%),
                            repeating-linear-gradient(105deg, rgba(12, 96, 55, 0.94) 0 14px, rgba(19, 122, 67, 0.94) 14px 32px, rgba(236, 182, 54, 0.9) 32px 38px, rgba(37, 112, 55, 0.94) 38px 56px);
                        bottom: 0;
                        content: "";
                        position: absolute;
                        right: 0;
                        top: 0;
                        width: 275px;
                    }

                    .hero-content {
                        position: relative;
                        z-index: 1;
                    }

                    .crop-label {
                        color: #0a6b43;
                        font-size: 10px;
                        font-weight: 900;
                        letter-spacing: 0;
                        margin: 0 0 3px;
                        text-transform: uppercase;
                    }

                    .crop-name {
                        color: #0f5d3d;
                        font-size: 34px;
                        font-weight: 900;
                        letter-spacing: 0;
                        line-height: 0.96;
                        margin: 0;
                        text-transform: uppercase;
                    }

                    .scientific {
                        color: #20362c;
                        font-size: 13px;
                        font-style: italic;
                        font-weight: 800;
                        margin: 6px 0 0;
                    }

                    .stage {
                        color: #0c4a2f;
                        font-size: 23px;
                        font-weight: 900;
                        line-height: 1.15;
                        margin: 28px 0 0;
                        max-width: 330px;
                        text-transform: uppercase;
                    }

                    .meta-row {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        margin-top: 12px;
                    }

                    .pill {
                        background: rgba(255, 255, 255, 0.72);
                        border: 1px solid #c8dbc8;
                        border-radius: 6px;
                        color: #20362c;
                        display: inline-block;
                        font-size: 12px;
                        font-weight: 900;
                        padding: 8px 12px;
                    }

                    .section {
                        background: #ffffff;
                        border: 1px solid #dfe9df;
                        border-radius: 8px;
                        margin-top: 12px;
                        padding: 12px;
                    }

                    .section-head {
                        align-items: center;
                        display: flex;
                        gap: 9px;
                        margin-bottom: 10px;
                        page-break-after: avoid;
                    }

                    .section-icon {
                        background: #0f6b43;
                        border-radius: 999px;
                        color: #ffffff;
                        display: inline-block;
                        font-size: 12px;
                        font-weight: 900;
                        height: 22px;
                        line-height: 22px;
                        text-align: center;
                        width: 22px;
                    }

                    .section h2 {
                        color: #0f6b43;
                        flex: 1;
                        font-size: 14px;
                        font-weight: 900;
                        letter-spacing: 0;
                        margin: 0;
                        text-transform: uppercase;
                    }

                    .section-body {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 12px;
                    }

                    .section-informacion {
                        background: linear-gradient(120deg, #ffffff, #f7fbf5);
                    }

                    .section-informacion .section-body {
                        display: block;
                    }

                    .section-enfermedades {
                        background: linear-gradient(120deg, #fffefe, #fff4f2);
                        border-color: #f3c5c1;
                    }

                    .section-enfermedades .section-icon {
                        background: #dd2626;
                    }

                    .section-enfermedades h2 {
                        color: #df2020;
                    }

                    .section-plagas {
                        background: linear-gradient(120deg, #fffefa, #fff6ea);
                        border-color: #ffd4a1;
                    }

                    .section-plagas .section-icon {
                        background: #f47c00;
                    }

                    .section-plagas h2 {
                        color: #f47c00;
                    }

                    .section-recomendaciones {
                        background: linear-gradient(120deg, #f8fbff, #eef6ff);
                        border-color: #cfe3fb;
                    }

                    .section-recomendaciones .section-icon {
                        background: #1b72c9;
                    }

                    .section-recomendaciones h2 {
                        color: #1b66b5;
                    }

                    .info-layout {
                        display: grid;
                        gap: 12px;
                        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                        page-break-inside: avoid;
                    }

                    .info-single {
                        grid-template-columns: minmax(0, 1fr);
                    }

                    .info-panel {
                        background: rgba(255, 255, 255, 0.78);
                        border-radius: 7px;
                        min-height: 92px;
                        padding: 6px;
                    }

                    .info-panel h3 {
                        color: #0f5134;
                        font-size: 13px;
                        font-weight: 900;
                        margin: 0 0 8px;
                    }

                    .item {
                        background: rgba(255, 255, 255, 0.88);
                        border: 1px solid #e4ece4;
                        border-radius: 8px;
                        display: flex;
                        gap: 12px;
                        padding: 12px;
                        page-break-inside: avoid;
                        width: calc(50% - 6px);
                    }

                    .section-recomendaciones .item {
                        background: linear-gradient(120deg, #ffffff, #f7fbf4);
                    }

                    .section-enfermedades .item {
                        border-color: #f4b4ae;
                    }

                    .section-plagas .item {
                        border-color: #ffc57a;
                    }

                    .section-recomendaciones .item {
                        border-color: #c9dfc7;
                    }

                    .item-marker {
                        background: #eaf5e6;
                        border-radius: 999px;
                        color: #0f6b43;
                        display: block;
                        flex: 0 0 50px;
                        font-size: 18px;
                        font-weight: 900;
                        height: 50px;
                        line-height: 50px;
                        text-align: center;
                        width: 50px;
                    }

                    .section-enfermedades .item-marker {
                        background: #ffe2df;
                        color: #d32622;
                    }

                    .section-plagas .item-marker {
                        background: #fff0d9;
                        color: #f47c00;
                    }

                    .section-recomendaciones .item-marker {
                        background: #e7f3ff;
                        color: #1b72c9;
                    }

                    .item-body {
                        flex: 1;
                        min-width: 0;
                    }

                    .item-head {
                        align-items: flex-start;
                        display: flex;
                        gap: 10px;
                        justify-content: space-between;
                    }

                    .item-title-wrap {
                        flex: 1;
                        min-width: 0;
                    }

                    .item h3 {
                        color: #141f1a;
                        font-size: 13px;
                        font-weight: 900;
                        line-height: 1.18;
                        margin: 0 0 3px;
                    }

                    .risk {
                        background: #eef3ea;
                        border: 1px solid #d5ded4;
                        border-radius: 5px;
                        color: #365246;
                        flex: 0 0 auto;
                        font-size: 10px;
                        font-weight: 900;
                        padding: 6px 9px;
                        text-transform: uppercase;
                    }

                    .risk-high {
                        background: #ffe4e2;
                        border-color: #ff9d9a;
                        color: #c73631;
                    }

                    .risk-medium {
                        background: #fff1ce;
                        border-color: #f7c574;
                        color: #b76a00;
                    }

                    .risk-low {
                        background: #def3e2;
                        border-color: #a7d8b0;
                        color: #237641;
                    }

                    .type-tag {
                        color: #0f6b43;
                        display: inline-block;
                        font-size: 10px;
                        font-weight: 900;
                        margin: 0 0 5px;
                        text-transform: uppercase;
                    }

                    .item-fields {
                        margin-top: 8px;
                    }

                    .field {
                        margin-top: 8px;
                        page-break-inside: avoid;
                    }

                    .field span {
                        color: #0f6b43;
                        display: inline-block;
                        font-size: 9px;
                        font-weight: 900;
                        text-transform: uppercase;
                    }

                    .section-enfermedades .field span {
                        color: #df2020;
                    }

                    .section-plagas .field span {
                        color: #f47c00;
                    }

                    .section-recomendaciones .field span {
                        color: #0f6b43;
                    }

                    .field p,
                    .item-text,
                    .empty {
                        color: #172820;
                        font-size: 11px;
                        font-weight: 600;
                        line-height: 1.45;
                        margin: 5px 0 0;
                    }

                    .empty {
                        background: rgba(255, 255, 255, 0.75);
                        border-radius: 7px;
                        padding: 10px;
                        width: 100%;
                    }

                    .indicators {
                        height: 100%;
                    }

                    .indicators h4 {
                        color: #1f6c43;
                        font-size: 13px;
                        font-weight: 900;
                        margin: 0 0 8px;
                        text-transform: uppercase;
                    }

                    .check-row {
                        align-items: flex-start;
                        display: flex;
                        gap: 9px;
                        margin-top: 7px;
                        page-break-inside: avoid;
                    }

                    .check {
                        color: #1f8f50;
                        font-size: 12px;
                        font-weight: 900;
                        line-height: 1.2;
                    }

                    .check-row p {
                        color: #172820;
                        flex: 1;
                        font-size: 11px;
                        font-weight: 650;
                        line-height: 1.35;
                        margin: 0;
                    }

                    .footer {
                        align-items: center;
                        background: linear-gradient(120deg, #ffffff, #f4faf2);
                        border: 1px solid #e3ede2;
                        border-radius: 8px;
                        color: #0f5d3d;
                        display: flex;
                        font-size: 11px;
                        font-weight: 900;
                        justify-content: space-between;
                        margin-top: 12px;
                        min-height: 54px;
                        padding: 12px 16px;
                        page-break-inside: avoid;
                    }

                    .footer strong {
                        color: #0a6b43;
                        font-size: 24px;
                        font-weight: 900;
                        letter-spacing: 0;
                    }

                    .footer span {
                        color: #2a4a3b;
                        font-weight: 700;
                        text-align: right;
                    }

                    @media print {
                        .item,
                        .info-layout,
                        .footer,
                        .hero {
                            break-inside: avoid;
                            page-break-inside: avoid;
                        }

                        .section-head {
                            break-after: avoid;
                            page-break-after: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <main class="document">
                    <div class="topbar">
                        <div class="brand-block">
                            <p class="brand">AgroDecide</p>
                            <div class="brand-rule"></div>
                        </div>
                        ${renderMetaSuperior(documento, fecha, hora)}
                    </div>

                    <header class="hero">
                        <div class="hero-content">
                            <p class="crop-label">Cultivo</p>
                            <p class="crop-name">${escaparHtml(
                                documento.cultivo?.nombre || "Cultivo"
                            )}</p>
                            ${
                                tieneTexto(documento.cultivo?.nombre_cientifico)
                                    ? `<p class="scientific">${escaparHtml(
                                          documento.cultivo.nombre_cientifico
                                      )}</p>`
                                    : ""
                            }
                            <h1 class="stage">${escaparHtml(
                                documento.etapa?.nombre || documento.titulo
                            )}</h1>
                            ${renderPillsEtapa(documento.etapa || {})}
                        </div>
                    </header>

                    ${seccionesHtml}

                    <footer class="footer">
                        <strong>INIAP</strong>
                        <span>Instituto Nacional de Investigaciones Agropecuarias<br />Generado localmente desde AgroDecide</span>
                    </footer>
                </main>
            </body>
        </html>
    `;
}

export async function generarPdf(parametros = {}) {
    const documento = normalizarDocumentoPdf(parametros);

    if (!documento.secciones.length) {
        throw new Error("No existe informacion para generar el PDF.");
    }

    const html = crearHtmlDocumento(documento);
    const resultado = await Print.printToFileAsync({
        html,
        base64: false,
    });

    return {
        uri: resultado.uri,
        nombreArchivo: crearNombreArchivo(documento.titulo, "pdf"),
        titulo: documento.titulo,
        totalSecciones: documento.totalSecciones,
        generadoEn: new Date().toISOString(),
        mimeType: "application/pdf",
    };
}

export async function abrirPdf({ uri } = {}) {
    if (!uri) {
        throw new Error("No existe un PDF para visualizar.");
    }

    if (Platform.OS === "android" && uri.startsWith("file://")) {
        const disponible = await Sharing.isAvailableAsync();

        if (!disponible) {
            throw new Error(
                "Android no permite abrir directamente archivos file:// y este proyecto no tiene expo-file-system instalado para convertirlos a content://."
            );
        }

        await Sharing.shareAsync(uri, {
            dialogTitle: "Abrir PDF AgroDecide",
            mimeType: "application/pdf",
            UTI: "com.adobe.pdf",
        });

        return {
            success: true,
            metodo: "expo-sharing",
        };
    }

    try {
        await WebBrowser.openBrowserAsync(uri);

        return {
            success: true,
            metodo: "expo-web-browser",
        };
    } catch (errorWeb) {
        const puedeAbrir = await Linking.canOpenURL(uri);

        if (puedeAbrir) {
            await Linking.openURL(uri);

            return {
                success: true,
                metodo: "linking",
            };
        }

        throw new Error(
            errorWeb?.message ||
                "No fue posible abrir el PDF en este dispositivo."
        );
    }
}

export async function compartirArchivo({
    uri,
    dialogTitle = "Compartir archivo AgroDecide",
    mimeType = "application/pdf",
    uti = "com.adobe.pdf",
} = {}) {
    if (!uri) {
        throw new Error("No existe un archivo para compartir.");
    }

    const disponible = await Sharing.isAvailableAsync();

    if (disponible) {
        await Sharing.shareAsync(uri, {
            dialogTitle,
            mimeType,
            UTI: uti,
        });

        return {
            success: true,
            action: "shared",
        };
    }

    const resultado = await Share.share({
        title: dialogTitle,
        url: uri,
        message: uri,
    });

    return {
        success: true,
        action: resultado.action,
    };
}

export async function guardarArchivoLocal({
    uri,
    dialogTitle = "Guardar o compartir archivo AgroDecide",
    mimeType = "application/pdf",
    uti = "com.adobe.pdf",
} = {}) {
    return await compartirArchivo({
        uri,
        dialogTitle,
        mimeType,
        uti,
    });
}

export default {
    CAPACIDADES_EXPORTACION,
    obtenerCapacidadesExportacion,
    crearNombreArchivo,
    normalizarDocumentoPdf,
    generarPdf,
    abrirPdf,
    guardarArchivoLocal,
    compartirArchivo,
};
