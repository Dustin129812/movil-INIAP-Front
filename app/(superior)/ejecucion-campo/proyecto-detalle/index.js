import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import ProyectoDetalleUI from "../../../../components/ensayos/ui/ProyectoDetalleUI";

export default function ProyectoDetalleScreen() {
    const params = useLocalSearchParams();

    const uuidResolver = params.proyecto_uuid || params.id;

    return <ProyectoDetalleUI proyecto_uuid={uuidResolver} />;
}