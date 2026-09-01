import React, { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { useRegistrarEvento } from '../../../../components/seguimiento/hooks/useRegistrarEvento';
import RegistrarEventoUI from '../../../../components/seguimiento/ui/RegistrarEventoUI';
import { seguimientoLocalService, seguimientoService } from '../../../../services/seguimiento';

export default function EventoScreen() {
    const { id, seguimientoUuid, etapaCultivoId } = useLocalSearchParams();
    const [etapaNombre, setEtapaNombre] = useState('');

    const {
        form,
        setField,
        isValid,
        loading,
        setLoading,
        catalogoEnfermedades,
        catalogoPlagas,
        catalogoRecomendaciones,
        TIPOS_EVENTO,
        SEVERIDADES,
    } = useRegistrarEvento(etapaCultivoId);

    useEffect(() => {
        const cargarNombre = async () => {
            if (etapaCultivoId) {
                const etapas = await seguimientoLocalService.obtenerEtapasLocal();
                const et = etapas.find((e) => e.id === Number(etapaCultivoId));
                if (et) setEtapaNombre(et.nombre);
            }
        };
        cargarNombre();
    }, [etapaCultivoId]);

    const handleGuardar = useCallback(async () => {
        if (!isValid || !seguimientoUuid) return;
        setLoading(true);
        try {
            const evento = await seguimientoLocalService.guardarEventoLocal({
                ...form,
                seguimiento_uuid: seguimientoUuid,
            });

            try {
                const net = await NetInfo.fetch();
                if (net.isConnected && net.isInternetReachable) {
                    await seguimientoService.registrarEvento(seguimientoUuid, {
                        tipo_evento: form.tipo_evento,
                        titulo: form.titulo,
                        descripcion: form.descripcion || null,
                        fecha_evento: form.fecha_evento || new Date().toISOString(),
                        enfermedad_id: form.enfermedad_id ? Number(form.enfermedad_id) : null,
                        plaga_id: form.plaga_id ? Number(form.plaga_id) : null,
                        recomendacion_id: form.recomendacion_id ? Number(form.recomendacion_id) : null,
                        severidad: form.severidad || null,
                        uuid_movil: evento.uuid_movil,
                    });
                }
            } catch (apiErr) {
                console.warn('[EventoScreen] Sync API omitido:', apiErr?.message);
            }

            router.back();
        } catch (err) {
            console.error('[EventoScreen] Error guardando evento:', err);
        } finally {
            setLoading(false);
        }
    }, [form, isValid, seguimientoUuid, setLoading]);

    return (
        <RegistrarEventoUI
            form={form}
            setField={setField}
            isValid={isValid}
            onGuardar={handleGuardar}
            loading={loading}
            catalogoEnfermedades={catalogoEnfermedades}
            catalogoPlagas={catalogoPlagas}
            catalogoRecomendaciones={catalogoRecomendaciones}
            TIPOS_EVENTO={TIPOS_EVENTO}
            SEVERIDADES={SEVERIDADES}
            etapaNombre={etapaNombre}
        />
    );
}
