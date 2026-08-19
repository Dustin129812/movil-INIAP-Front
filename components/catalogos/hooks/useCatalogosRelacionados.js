import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { initDb } from "../../../db/client";

import {
    obtenerCultivosActivos,
    obtenerEnfermedadesPorCultivo,
    obtenerEstadoCatalogos,
    obtenerPlagasPorCultivo,
    obtenerRecomendacionesPorEnfermedad,
    obtenerRecomendacionesPorPlaga,
} from "../../../services/catalogosConsultaService";

import {
    forzarSincronizacionCatalogos,
} from "../../../services/catalogosSyncService";

export function useCatalogosRelacionados() {
    const [cultivos, setCultivos] = useState([]);
    const [enfermedades, setEnfermedades] =
        useState([]);
    const [plagas, setPlagas] = useState([]);
    const [recomendaciones, setRecomendaciones] =
        useState([]);

    const [
        cultivoSeleccionado,
        setCultivoSeleccionado,
    ] = useState(null);

    const [
        problemaSeleccionado,
        setProblemaSeleccionado,
    ] = useState(null);

    const [tipoProblema, setTipoProblema] =
        useState("enfermedad");

    const [estadoSincronizacion, setEstadoSincronizacion] =
        useState(null);

    const [cargando, setCargando] = useState(true);
    const [sincronizando, setSincronizando] =
        useState(false);

    const [error, setError] = useState("");

    /**
     * Lista que se muestra según el tipo seleccionado.
     */
    const problemas = useMemo(() => {
        return tipoProblema === "enfermedad"
            ? enfermedades
            : plagas;
    }, [
        tipoProblema,
        enfermedades,
        plagas,
    ]);
    
    /**
 * Obtiene la fecha de la última sincronización registrada.
 */
    const ultimaSincronizacion = useMemo(() => {
    return (
        estadoSincronizacion?.ultima_sincronizacion ||
        estadoSincronizacion?.sincronizado_en ||
        estadoSincronizacion?.updated_at ||
        null
    );
    }, [estadoSincronizacion]);
    /**
     * Limpia las selecciones relacionadas.
     */
    const limpiarSeleccion = useCallback(() => {
        setCultivoSeleccionado(null);
        setProblemaSeleccionado(null);
        setEnfermedades([]);
        setPlagas([]);
        setRecomendaciones([]);
        setTipoProblema("enfermedad");
    }, []);

    /**
     * Carga los catálogos principales desde SQLite.
     */
    const cargarCatalogos = useCallback(async () => {
        try {
            setCargando(true);
            setError("");

            await initDb();

            const [
                cultivosLocales,
                estadoLocal,
            ] = await Promise.all([
                obtenerCultivosActivos(),
                obtenerEstadoCatalogos(),
            ]);

            setCultivos(cultivosLocales);
            setEstadoSincronizacion(estadoLocal);

            return {
                success: true,
                cultivos: cultivosLocales,
            };
        } catch (errorCarga) {
            const mensaje =
                errorCarga?.message ||
                "No fue posible cargar los catálogos.";

            setError(mensaje);

            return {
                success: false,
                message: mensaje,
            };
        } finally {
            setCargando(false);
        }
    }, []);

    /**
     * Selecciona un cultivo y consulta sus relaciones.
     */
    const seleccionarCultivo = useCallback(
        async (cultivo) => {
            if (!cultivo?.id) {
                return;
            }

            try {
                setCargando(true);
                setError("");
                setCultivoSeleccionado(cultivo);
                setProblemaSeleccionado(null);
                setRecomendaciones([]);

                const [
                    enfermedadesLocales,
                    plagasLocales,
                ] = await Promise.all([
                    obtenerEnfermedadesPorCultivo(
                        cultivo.id
                    ),
                    obtenerPlagasPorCultivo(
                        cultivo.id
                    ),
                ]);

                setEnfermedades(
                    enfermedadesLocales
                );

                setPlagas(plagasLocales);
            } catch (errorConsulta) {
                setError(
                    errorConsulta?.message ||
                    "No fue posible consultar los problemas del cultivo."
                );
            } finally {
                setCargando(false);
            }
        },
        []
    );

    /**
     * Cambia entre enfermedades y plagas.
     */
    const cambiarTipoProblema = useCallback(
        (tipo) => {
            if (
                tipo !== "enfermedad" &&
                tipo !== "plaga"
            ) {
                return;
            }

            setTipoProblema(tipo);
            setProblemaSeleccionado(null);
            setRecomendaciones([]);
            setError("");
        },
        []
    );

    /**
     * Selecciona una enfermedad o plaga y carga
     * sus recomendaciones.
     */
    const seleccionarProblema = useCallback(
        async (problema) => {
            if (!problema?.id) {
                return;
            }

            try {
                setCargando(true);
                setError("");
                setProblemaSeleccionado(problema);

                const resultados =
                    tipoProblema === "enfermedad"
                        ? await obtenerRecomendacionesPorEnfermedad(
                            problema.id
                        )
                        : await obtenerRecomendacionesPorPlaga(
                            problema.id
                        );

                setRecomendaciones(resultados);
            } catch (errorConsulta) {
                setError(
                    errorConsulta?.message ||
                    "No fue posible consultar las recomendaciones."
                );
            } finally {
                setCargando(false);
            }
        },
        [tipoProblema]
    );

    /**
     * Fuerza una descarga completa desde el backend.
     */
    const sincronizar = useCallback(async () => {
        try {
            setSincronizando(true);
            setError("");

            const resultado =
                await forzarSincronizacionCatalogos();

            if (!resultado.success) {
                setError(resultado.message);

                return resultado;
            }

            limpiarSeleccion();
            await cargarCatalogos();

            return resultado;
        } catch (errorSync) {
            const mensaje =
                errorSync?.message ||
                "No fue posible sincronizar los catálogos.";

            setError(mensaje);

            return {
                success: false,
                message: mensaje,
            };
        } finally {
            setSincronizando(false);
        }
    }, [
        cargarCatalogos,
        limpiarSeleccion,
    ]);

    /**
     * Carga inicial.
     */
    useEffect(() => {
        cargarCatalogos();
    }, [cargarCatalogos]);

    return {
        cultivos,
        enfermedades,
        plagas,
        problemas,
        recomendaciones,

        cultivoSeleccionado,
        problemaSeleccionado,
        tipoProblema,
        estadoSincronizacion,
        ultimaSincronizacion,

        cargando,
        sincronizando,
        error,

        cargarCatalogos,
        seleccionarCultivo,
        cambiarTipoProblema,
        seleccionarProblema,
        sincronizar,
        actualizarCatalogos: sincronizar,
        limpiarSeleccion,
    };
}

export default useCatalogosRelacionados;