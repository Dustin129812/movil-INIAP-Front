import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useSeguimiento } from '../../../../components/seguimiento/hooks/useSeguimiento';
import TimelineUI from '../../../../components/seguimiento/ui/TimelineUI';
import { useProyectoDetalle } from '../../../../components/proyectos/hooks/useProyectoDetalle';

export default function SeguimientoScreen() {
    const { id } = useLocalSearchParams();
    const { proyectoData, isLoading: loadingProyecto } = useProyectoDetalle(id);

    const cultivoId = proyectoData?.cultivo_id || null;

    const {
        etapas,
        seguimientos,
        resumen,
        isLoading,
        iniciarSeguimiento,
        recargar,
    } = useSeguimiento(id, cultivoId);

    return (
        <TimelineUI
            etapas={etapas}
            seguimientos={seguimientos}
            resumen={resumen}
            isLoading={isLoading || loadingProyecto}
            proyecto={proyectoData}
            onIniciarSeguimiento={(etapaCultivoId) => iniciarSeguimiento(etapaCultivoId)}
            onRefresh={recargar}
        />
    );
}
