import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    obtenerCultivosParaInfografias,
    obtenerDatosInfografia,
    obtenerEtapasParaInfografias,
    obtenerResumenEtapaInfografia,
} from "../../../services/infografiasService";
import { generarPdf } from "../../../services/pdfService";

function normalizarTexto(valor) {
    return String(valor || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function normalizarId(valor) {
    const id = Number(valor);

    return Number.isInteger(id) && id > 0 ? id : null;
}

function buscarPorId(lista, idEntrada) {
    const id = normalizarId(idEntrada);

    if (!id) {
        return null;
    }

    return (
        lista.find((item) => Number(item.id) === id) || null
    );
}

function filtrarPorBusqueda(lista, busqueda) {
    const consulta = normalizarTexto(busqueda.trim());

    if (!consulta) {
        return lista;
    }

    return lista.filter((item) =>
        normalizarTexto(
            [
                item.nombre,
                item.nombre_cientifico,
                item.descripcion,
            ]
                .filter(Boolean)
                .join(" ")
        ).includes(consulta)
    );
}

export function useInfografias({
    cultivoIdInicial = null,
    etapaIdInicial = null,
} = {}) {
    const [cultivos, setCultivos] = useState([]);
    const [etapas, setEtapas] = useState([]);
    const [cultivoSeleccionado, setCultivoSeleccionado] =
        useState(null);
    const [etapaSeleccionada, setEtapaSeleccionada] =
        useState(null);
    const [busquedaCultivo, setBusquedaCultivo] = useState("");
    const [busquedaEtapa, setBusquedaEtapa] = useState("");
    const [documento, setDocumento] = useState(null);
    const [infografias, setInfografias] = useState([]);
    const [indiceVistaPrevia, setIndiceVistaPrevia] = useState(0);
    const [resumenEtapa, setResumenEtapa] = useState({
        enfermedades: 0,
        plagas: 0,
        recomendaciones: 0,
    });
    const [cargando, setCargando] = useState(false);
    const [cargandoEtapas, setCargandoEtapas] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const [resultadoGeneracion, setResultadoGeneracion] = useState(null);
    const [error, setError] = useState("");

    const cultivosFiltrados = useMemo(
        () => filtrarPorBusqueda(cultivos, busquedaCultivo),
        [cultivos, busquedaCultivo]
    );

    const etapasFiltradas = useMemo(
        () => filtrarPorBusqueda(etapas, busquedaEtapa),
        [etapas, busquedaEtapa]
    );

    const cargarResumenEtapa = useCallback(async (etapaId) => {
        const id = normalizarId(etapaId);

        if (!id) {
            setResumenEtapa({
                enfermedades: 0,
                plagas: 0,
                recomendaciones: 0,
            });

            return null;
        }

        const resumen = await obtenerResumenEtapaInfografia({
            etapaId: id,
        });

        setResumenEtapa(resumen);

        return resumen;
    }, []);

    const cargarEtapas = useCallback(
        async ({
            cultivoId,
            etapaPreferidaId = etapaIdInicial,
        } = {}) => {
            const id = normalizarId(cultivoId);

            if (!id) {
                setEtapas([]);
                setEtapaSeleccionada(null);
                setResumenEtapa({
                    enfermedades: 0,
                    plagas: 0,
                    recomendaciones: 0,
                });

                return [];
            }

            try {
                setCargandoEtapas(true);
                setError("");

                const etapasLocales =
                    await obtenerEtapasParaInfografias(id);
                const etapaInicial =
                    buscarPorId(
                        etapasLocales,
                        etapaPreferidaId
                    ) ||
                    etapasLocales[0] ||
                    null;

                setEtapas(etapasLocales);
                setEtapaSeleccionada(etapaInicial);
                setBusquedaEtapa("");

                if (etapaInicial?.id) {
                    await cargarResumenEtapa(etapaInicial.id);
                } else {
                    setResumenEtapa({
                        enfermedades: 0,
                        plagas: 0,
                        recomendaciones: 0,
                    });
                }

                return etapasLocales;
            } catch (errorCarga) {
                setError(
                    errorCarga?.message ||
                        "No fue posible cargar las etapas locales."
                );
                setEtapas([]);
                setEtapaSeleccionada(null);

                return [];
            } finally {
                setCargandoEtapas(false);
            }
        },
        [cargarResumenEtapa, etapaIdInicial]
    );

    const seleccionarCultivo = useCallback(
        async (cultivo) => {
            setCultivoSeleccionado(cultivo || null);
            setDocumento(null);
            setInfografias([]);
            setResultadoGeneracion(null);
            setIndiceVistaPrevia(0);
            setError("");

            await cargarEtapas({
                cultivoId: cultivo?.id,
                etapaPreferidaId: etapaIdInicial,
            });
        },
        [cargarEtapas, etapaIdInicial]
    );

    const cargarCultivos = useCallback(async () => {
        try {
            setCargando(true);
            setError("");

            const cultivosLocales =
                await obtenerCultivosParaInfografias();
            const cultivoInicial =
                buscarPorId(cultivosLocales, cultivoIdInicial) ||
                cultivosLocales[0] ||
                null;

            setCultivos(cultivosLocales);

            if (cultivoInicial) {
                setCultivoSeleccionado(cultivoInicial);
                await cargarEtapas({
                    cultivoId: cultivoInicial.id,
                    etapaPreferidaId: etapaIdInicial,
                });
            }

            return cultivosLocales;
        } catch (errorCarga) {
            setError(
                errorCarga?.message ||
                    "No fue posible cargar los cultivos locales."
            );

            return [];
        } finally {
            setCargando(false);
        }
    }, [cargarEtapas, cultivoIdInicial, etapaIdInicial]);

    const seleccionarEtapa = useCallback(
        async (etapa) => {
            setEtapaSeleccionada(etapa || null);
            setDocumento(null);
            setInfografias([]);
            setResultadoGeneracion(null);
            setIndiceVistaPrevia(0);
            setError("");

            await cargarResumenEtapa(etapa?.id);
        },
        [cargarResumenEtapa]
    );

    const generarVistaPrevia = useCallback(
        async ({
            cultivoId = cultivoSeleccionado?.id,
            etapaId = etapaSeleccionada?.id,
        } = {}) => {
            const cultivoIdNormalizado = normalizarId(cultivoId);
            const etapaIdNormalizado = normalizarId(etapaId);

            if (!cultivoIdNormalizado) {
                setError("Selecciona un cultivo para continuar.");

                return null;
            }

            if (!etapaIdNormalizado) {
                setError(
                    "Selecciona una etapa fenologica para continuar."
                );

                return null;
            }

            try {
                setGenerando(true);
                setError("");

                const resultado = await obtenerDatosInfografia({
                    cultivoId: cultivoIdNormalizado,
                    etapaId: etapaIdNormalizado,
                });

                if (!resultado.secciones?.length) {
                    throw new Error(
                        "No hay informacion local para generar la vista previa."
                    );
                }

                setCultivoSeleccionado(resultado.cultivo);
                setEtapaSeleccionada(resultado.etapa);
                setDocumento(resultado);
                setInfografias(resultado.secciones);
                setResultadoGeneracion(null);
                setIndiceVistaPrevia(0);

                return resultado;
            } catch (errorGeneracion) {
                setError(
                    errorGeneracion?.message ||
                        "No fue posible preparar la vista previa."
                );

                return null;
            } finally {
                setGenerando(false);
            }
        },
        [
            cultivoSeleccionado?.id,
            etapaSeleccionada?.id,
        ]
    );

    const generarPdfDocumento = useCallback(
        async (documentoEntrada = documento) => {
            if (!documentoEntrada?.secciones?.length) {
                setError(
                    "Prepara una vista previa antes de generar el PDF."
                );

                return null;
            }

            try {
                setGenerandoPdf(true);
                setError("");

                const resultado = await generarPdf(documentoEntrada);

                setResultadoGeneracion(resultado);

                return resultado;
            } catch (errorPdf) {
                setError(
                    errorPdf?.message ||
                        "No fue posible generar el PDF local."
                );
                throw errorPdf;
            } finally {
                setGenerandoPdf(false);
            }
        },
        [documento]
    );

    const siguiente = useCallback(() => {
        setIndiceVistaPrevia((actual) => {
            if (!infografias.length) {
                return 0;
            }

            return Math.min(actual + 1, infografias.length - 1);
        });
    }, [infografias.length]);

    const anterior = useCallback(() => {
        setIndiceVistaPrevia((actual) => Math.max(actual - 1, 0));
    }, []);

    useEffect(() => {
        cargarCultivos();
    }, [cargarCultivos]);

    return {
        cultivos,
        cultivosFiltrados,
        etapas,
        etapasFiltradas,
        cultivoSeleccionado,
        etapaSeleccionada,
        busquedaCultivo,
        busquedaEtapa,
        documento,
        infografias,
        infografiaActual:
            infografias[indiceVistaPrevia] || null,
        titulo: documento?.titulo || "",
        indiceVistaPrevia,
        resumenEtapa,
        cargando,
        cargandoEtapas,
        generando,
        generandoPdf,
        resultadoGeneracion,
        error,

        setBusquedaCultivo,
        setBusquedaEtapa,
        setError,
        cargarCultivos,
        cargarEtapas,
        cargarResumenEtapa,
        seleccionarCultivo,
        seleccionarEtapa,
        generarVistaPrevia,
        generarPdfDocumento,
        siguiente,
        anterior,

        elementos: [],
        elementosFiltrados: [],
        idsSeleccionados: [],
        totalSeleccionados: 0,
        todosSeleccionados: false,
        busqueda: busquedaCultivo,
        formatoSalida: "infografia",
        setBusqueda: setBusquedaCultivo,
        setFormatoSalida: () => {},
        alternarSeleccion: () => {},
        seleccionarTodos: () => {},
        limpiarSeleccion: () => {},
    };
}

export default useInfografias;
