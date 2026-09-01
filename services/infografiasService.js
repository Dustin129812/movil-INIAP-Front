import { initDb } from "../db/client";

import {
    obtenerCultivosActivos,
    obtenerEtapaPorId,
    obtenerEtapasPorCultivo,
    obtenerEnfermedadesPorCultivo,
    obtenerEnfermedadesPorEtapa,
    obtenerPlagasPorCultivo,
    obtenerPlagasPorEtapa,
    obtenerRecomendacionesPorEnfermedad,
    obtenerRecomendacionesPorEtapa,
    obtenerRecomendacionesPorPlaga,
} from "./catalogosConsultaService";

export const CLAVES_SECCION_INFOGRAFIA = {
    INFORMACION: "informacion",
    ENFERMEDADES: "enfermedades",
    PLAGAS: "plagas",
    RECOMENDACIONES: "recomendaciones",
};

export const SECCIONES_INFOGRAFIA = [
    {
        clave: CLAVES_SECCION_INFOGRAFIA.INFORMACION,
        titulo: "Informacion de la etapa",
        descripcion: "Descripcion, duracion e indicadores clave",
        icono: "information-outline",
    },
    {
        clave: CLAVES_SECCION_INFOGRAFIA.ENFERMEDADES,
        titulo: "Enfermedades y nivel de riesgo",
        descripcion: "Enfermedades asociadas a la etapa",
        icono: "leaf-circle-outline",
    },
    {
        clave: CLAVES_SECCION_INFOGRAFIA.PLAGAS,
        titulo: "Plagas y nivel de riesgo",
        descripcion: "Plagas asociadas a la etapa",
        icono: "bug-outline",
    },
    {
        clave: CLAVES_SECCION_INFOGRAFIA.RECOMENDACIONES,
        titulo: "Recomendaciones",
        descripcion: "Manejo, prevencion y control",
        icono: "clipboard-check-outline",
    },
];

export const TIPOS_INFOGRAFIA = {
    CULTIVO: "cultivo",
    ENFERMEDADES: "enfermedades",
    PLAGAS: "plagas",
    INFORME_COMPLETO: "informe_completo",
};

const TIPOS_CON_LISTADO = [
    TIPOS_INFOGRAFIA.ENFERMEDADES,
    TIPOS_INFOGRAFIA.PLAGAS,
];

function normalizarId(valor) {
    const id = Number(valor);

    return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizarIds(idsSeleccionados = []) {
    if (typeof idsSeleccionados === "string") {
        return idsSeleccionados
            .split(",")
            .map((id) => normalizarId(id))
            .filter(Boolean);
    }

    if (!Array.isArray(idsSeleccionados)) {
        return [];
    }

    return idsSeleccionados
        .map((id) => normalizarId(id))
        .filter(Boolean);
}

function tieneTexto(valor) {
    return String(valor || "").trim().length > 0;
}

function texto(valor) {
    return String(valor || "").trim();
}

function buscarCultivo(cultivos, cultivoId) {
    const id = normalizarId(cultivoId);

    if (!id) {
        return null;
    }

    return cultivos.find((cultivo) => Number(cultivo.id) === id) || null;
}

function buscarEtapa(etapas, etapaId) {
    const id = normalizarId(etapaId);

    if (!id) {
        return null;
    }

    return etapas.find((etapa) => Number(etapa.id) === id) || null;
}

function parsearIndicadoresClave(valor) {
    if (Array.isArray(valor)) {
        return valor.map(texto).filter(Boolean);
    }

    if (!tieneTexto(valor)) {
        return [];
    }

    try {
        const parseado = JSON.parse(valor);

        if (Array.isArray(parseado)) {
            return parseado.map(texto).filter(Boolean);
        }
    } catch {
        return String(valor)
            .split(/\r?\n|;/)
            .map(texto)
            .filter(Boolean);
    }

    return [];
}

function normalizarEtapa(etapa) {
    if (!etapa) {
        return null;
    }

    return {
        ...etapa,
        orden: etapa.orden == null ? null : Number(etapa.orden),
        duracion_dias_estimada:
            etapa.duracion_dias_estimada == null
                ? null
                : Number(etapa.duracion_dias_estimada),
        indicadores_clave: parsearIndicadoresClave(
            etapa.indicadores_clave
        ),
    };
}

function crearCampo(id, etiqueta, valor) {
    if (!tieneTexto(valor)) {
        return null;
    }

    return {
        id,
        etiqueta,
        valor: texto(valor),
    };
}

function crearItemEtapa(etapa) {
    const indicadores = Array.isArray(etapa.indicadores_clave)
        ? etapa.indicadores_clave
        : [];
    const campos = [
        crearCampo("descripcion", "Descripcion", etapa.descripcion),
        crearCampo(
            "posicion",
            "Posicion en el ciclo",
            etapa.orden ? `Etapa ${etapa.orden}` : null
        ),
        crearCampo(
            "duracion",
            "Duracion estimada",
            etapa.duracion_dias_estimada
                ? `${etapa.duracion_dias_estimada} dias`
                : null
        ),
    ].filter(Boolean);

    return {
        id: `etapa-${etapa.id}`,
        titulo: etapa.nombre,
        tipo: "etapa",
        campos,
        indicadores,
    };
}

function crearItemSanitario(item, tipo) {
    const etiquetaDetalle =
        tipo === "enfermedad" ? "Sintomas" : "Danos";
    const valorDetalle =
        tipo === "enfermedad" ? item.sintomas : item.danos;

    return {
        id: `${tipo}-${item.id}`,
        tipo,
        titulo: item.nombre,
        subtitulo: item.nombre_cientifico || "",
        nivel_riesgo: item.nivel_riesgo || null,
        campos: [
            crearCampo("riesgo", "Nivel de riesgo", item.nivel_riesgo),
            crearCampo("detalle", etiquetaDetalle, valorDetalle),
            crearCampo("descripcion", "Descripcion", item.descripcion),
        ].filter(Boolean),
    };
}

function crearItemRecomendacion(item) {
    return {
        id: `recomendacion-${item.id}`,
        tipo: item.tipo || "manejo",
        titulo: item.titulo,
        descripcion: item.descripcion,
        instrucciones: item.instrucciones,
        campos: [
            crearCampo("tipo", "Tipo", item.tipo),
            crearCampo("descripcion", "Descripcion", item.descripcion),
            crearCampo("instrucciones", "Instrucciones", item.instrucciones),
        ].filter(Boolean),
    };
}

function crearSeccion({
    clave,
    titulo,
    items,
    emptyText,
}) {
    return {
        clave,
        tipo: clave,
        id: clave,
        titulo,
        items: Array.isArray(items) ? items : [],
        emptyText:
            emptyText || "No existe informacion registrada para esta seccion.",
    };
}

function crearDocumentoInfografia({
    cultivo,
    etapa,
    secciones,
    clavesIncluidas,
}) {
    const titulo = `Infografia de ${cultivo.nombre} - ${etapa.nombre}`;

    return {
        titulo,
        subtitulo: cultivo.nombre_cientifico || "",
        cultivo,
        etapa,
        secciones,
        infografias: secciones,
        totalSecciones: secciones.length,
        clavesIncluidas,
        generadoEn: new Date().toISOString(),
    };
}

async function cargarRecomendaciones(tipo, elementoId) {
    if (tipo === "enfermedad") {
        return await obtenerRecomendacionesPorEnfermedad(elementoId);
    }

    if (tipo === "plaga") {
        return await obtenerRecomendacionesPorPlaga(elementoId);
    }

    return [];
}

async function enriquecerElementosConRecomendaciones(elementos, tipo) {
    return await Promise.all(
        elementos.map(async (elemento) => {
            const recomendaciones = await cargarRecomendaciones(
                tipo,
                elemento.id
            );

            return {
                ...elemento,
                tipo,
                total_recomendaciones: recomendaciones.length,
                recomendaciones,
            };
        })
    );
}

function filtrarSeleccion(elementos, idsSeleccionados, incluirTodo) {
    const ids = normalizarIds(idsSeleccionados);

    if (incluirTodo || ids.length === 0) {
        return elementos;
    }

    const idsSet = new Set(ids);

    return elementos.filter((elemento) => idsSet.has(Number(elemento.id)));
}

export function esTipoConListado(tipo) {
    return TIPOS_CON_LISTADO.includes(tipo);
}

export function obtenerSeccionesDisponibles() {
    return SECCIONES_INFOGRAFIA;
}

export async function obtenerCultivosParaInfografias() {
    await initDb();

    return await obtenerCultivosActivos();
}

export async function obtenerEtapasParaInfografias(cultivoId) {
    await initDb();

    const etapas = await obtenerEtapasPorCultivo(cultivoId);

    return etapas.map(normalizarEtapa).filter(Boolean);
}

export async function obtenerResumenEtapaInfografia({
    etapaId,
}) {
    await initDb();

    const id = normalizarId(etapaId);

    if (!id) {
        return {
            enfermedades: 0,
            plagas: 0,
            recomendaciones: 0,
        };
    }

    const [enfermedades, plagas, recomendaciones] =
        await Promise.all([
            obtenerEnfermedadesPorEtapa(id),
            obtenerPlagasPorEtapa(id),
            obtenerRecomendacionesPorEtapa(id),
        ]);

    return {
        enfermedades: enfermedades.length,
        plagas: plagas.length,
        recomendaciones: recomendaciones.length,
    };
}

export async function obtenerDatosInfografia({
    cultivoId,
    etapaId,
}) {
    await initDb();

    const [cultivos, etapaBase] = await Promise.all([
        obtenerCultivosActivos(),
        obtenerEtapaPorId(etapaId),
    ]);
    const cultivo = buscarCultivo(cultivos, cultivoId);
    const etapa = normalizarEtapa(etapaBase);

    if (!cultivo) {
        throw new Error("No se encontro el cultivo seleccionado.");
    }

    if (!etapa || Number(etapa.cultivo_id) !== Number(cultivo.id)) {
        throw new Error("No se encontro la etapa fenologica seleccionada.");
    }

    const [enfermedades, plagas, recomendaciones] =
        await Promise.all([
            obtenerEnfermedadesPorEtapa(etapa.id),
            obtenerPlagasPorEtapa(etapa.id),
            obtenerRecomendacionesPorEtapa(etapa.id),
        ]);

    const secciones = [];

    // Este normalizador es la fuente unica para la vista previa, imagen y PDF.
    // Las secciones se construyen solas segun los datos reales de la etapa.
    const itemEtapa = crearItemEtapa(etapa);

    if (itemEtapa.campos.length || itemEtapa.indicadores.length) {
        secciones.push(
            crearSeccion({
                clave: CLAVES_SECCION_INFOGRAFIA.INFORMACION,
                titulo: "Informacion de la etapa",
                items: [itemEtapa],
            })
        );
    }

    if (enfermedades.length > 0) {
        secciones.push(
            crearSeccion({
                clave: CLAVES_SECCION_INFOGRAFIA.ENFERMEDADES,
                titulo: "Enfermedades y nivel de riesgo",
                items: enfermedades.map((item) =>
                    crearItemSanitario(item, "enfermedad")
                ),
                emptyText:
                    "Esta etapa no tiene enfermedades registradas.",
            })
        );
    }

    if (plagas.length > 0) {
        secciones.push(
            crearSeccion({
                clave: CLAVES_SECCION_INFOGRAFIA.PLAGAS,
                titulo: "Plagas y nivel de riesgo",
                items: plagas.map((item) =>
                    crearItemSanitario(item, "plaga")
                ),
                emptyText: "Esta etapa no tiene plagas registradas.",
            })
        );
    }

    if (recomendaciones.length > 0) {
        secciones.push(
            crearSeccion({
                clave: CLAVES_SECCION_INFOGRAFIA.RECOMENDACIONES,
                titulo: "Recomendaciones",
                items: recomendaciones.map(crearItemRecomendacion),
                emptyText:
                    "Esta etapa no tiene recomendaciones registradas.",
            })
        );
    }

    return crearDocumentoInfografia({
        cultivo,
        etapa,
        secciones,
        clavesIncluidas: secciones.map((seccion) => seccion.clave),
    });
}

export async function obtenerElementosPorTipo({ cultivoId, tipo }) {
    await initDb();

    const id = normalizarId(cultivoId);

    if (!id || !esTipoConListado(tipo)) {
        return [];
    }

    if (tipo === TIPOS_INFOGRAFIA.ENFERMEDADES) {
        const enfermedades = await obtenerEnfermedadesPorCultivo(id);

        return await enriquecerElementosConRecomendaciones(
            enfermedades,
            "enfermedad"
        );
    }

    const plagas = await obtenerPlagasPorCultivo(id);

    return await enriquecerElementosConRecomendaciones(plagas, "plaga");
}

export async function obtenerContenidoPorCultivo({ cultivoId, tipo }) {
    await initDb();

    const cultivos = await obtenerCultivosActivos();
    const cultivo = buscarCultivo(cultivos, cultivoId);

    if (!cultivo) {
        throw new Error("No se encontro el cultivo seleccionado.");
    }

    if (tipo === TIPOS_INFOGRAFIA.CULTIVO) {
        return {
            cultivo,
            tipo,
            elementos: [],
            total: 1,
        };
    }

    if (tipo === TIPOS_INFOGRAFIA.INFORME_COMPLETO) {
        const [enfermedades, plagas] = await Promise.all([
            obtenerElementosPorTipo({
                cultivoId: cultivo.id,
                tipo: TIPOS_INFOGRAFIA.ENFERMEDADES,
            }),
            obtenerElementosPorTipo({
                cultivoId: cultivo.id,
                tipo: TIPOS_INFOGRAFIA.PLAGAS,
            }),
        ]);

        return {
            cultivo,
            tipo,
            elementos: [...enfermedades, ...plagas],
            enfermedades,
            plagas,
            total: 1 + enfermedades.length + plagas.length,
        };
    }

    const elementos = await obtenerElementosPorTipo({
        cultivoId: cultivo.id,
        tipo,
    });

    return {
        cultivo,
        tipo,
        elementos,
        total: elementos.length,
    };
}

export async function obtenerDatosInfografiaLegacy({
    cultivoId,
    tipo,
    idsSeleccionados = [],
    incluirTodo = false,
}) {
    const contenido = await obtenerContenidoPorCultivo({
        cultivoId,
        tipo,
    });
    const { cultivo } = contenido;
    const seleccionados = filtrarSeleccion(
        contenido.elementos,
        idsSeleccionados,
        incluirTodo
    );

    return {
        cultivo,
        tipo,
        titulo: `Infografia ${cultivo.nombre}`,
        subtitulo: cultivo.nombre_cientifico || "",
        secciones: seleccionados,
        infografias: seleccionados,
        totalSecciones: seleccionados.length,
    };
}

export { buscarEtapa };

export default {
    CLAVES_SECCION_INFOGRAFIA,
    SECCIONES_INFOGRAFIA,
    TIPOS_INFOGRAFIA,
    esTipoConListado,
    obtenerSeccionesDisponibles,
    obtenerCultivosParaInfografias,
    obtenerEtapasParaInfografias,
    obtenerResumenEtapaInfografia,
    obtenerDatosInfografia,
    obtenerElementosPorTipo,
    obtenerContenidoPorCultivo,
    obtenerDatosInfografiaLegacy,
};
