import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { seguimientoLocalService, seguimientoService } from '../../../services/seguimiento';
import { db } from '../../../db/client';
import { seguimientos, eventosSeguimiento } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const useSeguimiento = (proyectoUuid, cultivoId) => {
    const [etapas, setEtapas] = useState([]);
    const [seguimientosData, setSeguimientosData] = useState([]);
    const [etapaActual, setEtapaActual] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = useCallback(async () => {
        if (!proyectoUuid) return;
        setIsLoading(true);
        setError(null);

        try {
            // 1. Cargar etapas del catálogo local
            let etapasLocales = await seguimientoLocalService.obtenerEtapasLocal(cultivoId);
            setEtapas(etapasLocales || []);

            // 2. Cargar seguimientos locales
            const segsLocales = await seguimientoLocalService.obtenerSeguimientosLocal(proyectoUuid);

            // 3. Para cada seguimiento, cargar sus eventos
            const segsConEventos = await Promise.all(
                segsLocales.map(async (seg) => {
                    const eventos = await seguimientoLocalService.obtenerEventosLocal(seg.uuid_movil);
                    return { ...seg, eventos: eventos || [] };
                })
            );

            setSeguimientosData(segsConEventos);

            // 4. Determinar etapa actual (en_progreso)
            const enProgreso = segsConEventos.find((s) => s.estado === 'en_progreso');
            setEtapaActual(enProgreso || null);

            // 5. Calcular resumen
            const completadas = segsConEventos.filter((s) => s.estado === 'completada').length;
            const totalEtapas = (etapasLocales && etapasLocales.length > 0)
                ? etapasLocales.length
                : segsConEventos.length;

            setResumen({
                completadas,
                enProgreso: enProgreso ? 1 : 0,
                total: totalEtapas,
                progreso: totalEtapas > 0 ? completadas / totalEtapas : 0,
            });

            // 6. Intentar sincronizar etapas desde el servidor si hay conexión
            const net = await NetInfo.fetch();
            if (net.isConnected && net.isInternetReachable) {
                try {
                    if (cultivoId) {
                        const resp = await seguimientoService.obtenerEtapasCultivo(cultivoId);
                        if (resp && resp.success && resp.data) {
                            await seguimientoLocalService.guardarEtapasCatalogo(resp.data);
                            const fresh = await seguimientoLocalService.obtenerEtapasLocal(cultivoId);
                            setEtapas(fresh || []);
                        }
                    }
                } catch (syncErr) {
                    console.warn('[Seguimiento] Sync etapas remoto omitido:', syncErr?.message);
                }
            }
        } catch (err) {
            console.error('[Seguimiento] Error cargando datos:', err);
            setError('Error al cargar el seguimiento');
        } finally {
            setIsLoading(false);
        }
    }, [proyectoUuid, cultivoId]);

    useFocusEffect(
        useCallback(() => {
            cargarDatos();
        }, [cargarDatos])
    );

    const iniciarSeguimiento = useCallback(async (etapaCultivoId, fechaInicio) => {
        try {
            const fecha = fechaInicio || new Date().toISOString().split('T')[0];
            const nuevo = await seguimientoLocalService.guardarSeguimientoLocal({
                proyecto_uuid: proyectoUuid,
                etapa_cultivo_id: etapaCultivoId,
                fecha_inicio: fecha,
            });

            // Sincronizar inmediatamente al backend si hay conexión
            try {
                const net = await NetInfo.fetch();
                if (net.isConnected && net.isInternetReachable) {
                    const resp = await seguimientoService.iniciarSeguimiento({
                        proyecto_id: proyectoUuid,
                        etapa_cultivo_id: Number(etapaCultivoId),
                        fecha_inicio: fecha,
                        uuid_movil: nuevo.uuid_movil,
                    });
                    if (resp?.data?.id) {
                        await db
                            .update(seguimientos)
                            .set({
                                server_id: resp.data.id,
                                sync_status: 'synced',
                            })
                            .where(eq(seguimientos.uuid_movil, nuevo.uuid_movil));
                    }
                }
            } catch (apiErr) {
                console.warn('[Seguimiento] Guardado local exitoso, sync pendiente:', apiErr?.message);
            }

            await cargarDatos();
            return nuevo;
        } catch (err) {
            console.error('[Seguimiento] Error iniciando seguimiento:', err);
            throw err;
        }
    }, [proyectoUuid, cargarDatos]);

    const completarEtapa = useCallback(async (seguimientoUuid) => {
        try {
            await seguimientoLocalService.actualizarEstadoSeguimiento(
                seguimientoUuid,
                'completada'
            );

            // Sincronizar al backend si hay conexión
            try {
                const net = await NetInfo.fetch();
                if (net.isConnected && net.isInternetReachable) {
                    await seguimientoService.avanzarEtapa(seguimientoUuid);
                }
            } catch (apiErr) {
                console.warn('[Seguimiento] Completado local exitoso, sync pendiente:', apiErr?.message);
            }

            await cargarDatos();
        } catch (err) {
            console.error('[Seguimiento] Error completando etapa:', err);
            throw err;
        }
    }, [cargarDatos]);

    const registrarEvento = useCallback(async (seguimientoUuid, datosEvento) => {
        try {
            const evento = await seguimientoLocalService.guardarEventoLocal({
                ...datosEvento,
                seguimiento_uuid: seguimientoUuid,
            });

            // Sincronizar al backend si hay conexión
            try {
                const net = await NetInfo.fetch();
                if (net.isConnected && net.isInternetReachable) {
                    const resp = await seguimientoService.registrarEvento(seguimientoUuid, {
                        tipo_evento: datosEvento.tipo_evento,
                        titulo: datosEvento.titulo,
                        descripcion: datosEvento.descripcion || null,
                        fecha_evento: datosEvento.fecha_evento || new Date().toISOString(),
                        enfermedad_id: datosEvento.enfermedad_id ? Number(datosEvento.enfermedad_id) : null,
                        plaga_id: datosEvento.plaga_id ? Number(datosEvento.plaga_id) : null,
                        recomendacion_id: datosEvento.recomendacion_id ? Number(datosEvento.recomendacion_id) : null,
                        severidad: datosEvento.severidad || null,
                        uuid_movil: evento.uuid_movil,
                    });
                    if (resp?.data?.id) {
                        await db
                            .update(eventosSeguimiento)
                            .set({
                                server_id: resp.data.id,
                                sync_status: 'synced',
                            })
                            .where(eq(eventosSeguimiento.uuid_movil, evento.uuid_movil));
                    }
                }
            } catch (apiErr) {
                console.warn('[Seguimiento] Evento guardado localmente, sync pendiente:', apiErr?.message);
            }

            await cargarDatos();
            return evento;
        } catch (err) {
            console.error('[Seguimiento] Error registrando evento:', err);
            throw err;
        }
    }, [cargarDatos]);

    return {
        etapas,
        seguimientos: seguimientosData,
        etapaActual,
        resumen,
        isLoading,
        error,
        iniciarSeguimiento,
        completarEtapa,
        registrarEvento,
        recargar: cargarDatos,
    };
};

export default useSeguimiento;
