import React, { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import EtapaDetalleUI from '../../../../components/seguimiento/ui/EtapaDetalleUI';
import { seguimientoLocalService, seguimientoService } from '../../../../services/seguimiento';
import { useTheme } from '../../../../services/theme';

export default function EtapaScreen() {
    const { id, seguimientoUuid, etapaCultivoId } = useLocalSearchParams();
    const { isDark } = useTheme();
    const [seguimiento, setSeguimiento] = useState(null);
    const [etapa, setEtapa] = useState(null);
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Obtener seguimientos del proyecto
            const segs = await seguimientoLocalService.obtenerSeguimientosLocal(id);
            const seg = segs.find((s) => s.uuid_movil === seguimientoUuid);
            setSeguimiento(seg || null);

            // 2. Obtener etapa del catálogo
            const targetEtapaId = etapaCultivoId || seg?.etapa_cultivo_id;
            if (targetEtapaId) {
                const etapas = await seguimientoLocalService.obtenerEtapasLocal();
                const et = etapas.find((e) => e.id === Number(targetEtapaId));
                setEtapa(et || null);
            }

            // 3. Obtener eventos del seguimiento
            if (seguimientoUuid) {
                const evts = await seguimientoLocalService.obtenerEventosLocal(seguimientoUuid);
                setEventos(evts || []);
            }
        } catch (err) {
            console.error('[EtapaScreen] Error cargando datos:', err);
        } finally {
            setLoading(false);
        }
    }, [id, seguimientoUuid, etapaCultivoId]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const handleFinalizarEtapa = useCallback(async (uuid) => {
        try {
            await seguimientoLocalService.actualizarEstadoSeguimiento(uuid, 'completada');
            try {
                const net = await NetInfo.fetch();
                if (net.isConnected && net.isInternetReachable) {
                    await seguimientoService.avanzarEtapa(uuid);
                }
            } catch (apiErr) {
                console.warn('[EtapaScreen] Sync API omitido:', apiErr?.message);
            }
            router.back();
        } catch (err) {
            console.error('[EtapaScreen] Error finalizando etapa:', err);
        }
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000000' : '#F2F2F7' }}>
                <ActivityIndicator size="large" color="#0A84FF" />
            </View>
        );
    }

    return (
        <EtapaDetalleUI
            seguimiento={seguimiento}
            etapa={etapa}
            eventos={eventos}
            onFinalizarEtapa={handleFinalizarEtapa}
            proyectoId={id}
        />
    );
}
