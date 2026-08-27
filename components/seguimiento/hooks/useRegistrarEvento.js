import { useState, useCallback, useEffect } from 'react';
import { db } from '../../../db/client';
import { eq } from 'drizzle-orm';
import {
    enfermedades as enfermedadesTable,
    plagas as plagasTable,
    recomendaciones as recomendacionesTable,
    etapaEnfermedad,
    etapaPlaga,
    etapaRecomendacion,
} from '../../../db/schema';

export const TIPOS_EVENTO = [
    { key: 'avance', label: 'Avance', icon: 'trending-up', color: '#30D158' },
    { key: 'observacion', label: 'Observación', icon: 'eye', color: '#8E8E93' },
    { key: 'incidencia_enfermedad', label: 'Enfermedad', icon: 'virus', color: '#FF9500' },
    { key: 'incidencia_plaga', label: 'Plaga', icon: 'bug', color: '#FF453A' },
    { key: 'tratamiento_aplicado', label: 'Tratamiento', icon: 'medical-bag', color: '#0A84FF' },
];

export const SEVERIDADES = [
    { key: 'leve', label: 'Leve', color: '#30D158' },
    { key: 'moderada', label: 'Moderada', color: '#FF9500' },
    { key: 'severa', label: 'Severa', color: '#FF453A' },
];

export const useRegistrarEvento = (etapaCultivoId) => {
    const [form, setForm] = useState({
        tipo_evento: 'avance',
        titulo: '',
        descripcion: '',
        fecha_evento: new Date().toISOString(),
        enfermedad_id: null,
        plaga_id: null,
        recomendacion_id: null,
        severidad: null,
    });

    const [catalogoEnfermedades, setCatalogoEnfermedades] = useState([]);
    const [catalogoPlagas, setCatalogoPlagas] = useState([]);
    const [catalogoRecomendaciones, setCatalogoRecomendaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    const cargarCatalogos = useCallback(async () => {
        try {
            if (etapaCultivoId) {
                const [enfs, plas, recs] = await Promise.all([
                    db
                        .select({
                            id: enfermedadesTable.id,
                            nombre: enfermedadesTable.nombre,
                            nombre_cientifico: enfermedadesTable.nombre_cientifico,
                            nivel_riesgo: etapaEnfermedad.nivel_riesgo,
                        })
                        .from(etapaEnfermedad)
                        .innerJoin(
                            enfermedadesTable,
                            eq(etapaEnfermedad.enfermedad_id, enfermedadesTable.id)
                        )
                        .where(eq(etapaEnfermedad.etapa_cultivo_id, Number(etapaCultivoId))),
                    db
                        .select({
                            id: plagasTable.id,
                            nombre: plagasTable.nombre,
                            nombre_cientifico: plagasTable.nombre_cientifico,
                            nivel_riesgo: etapaPlaga.nivel_riesgo,
                        })
                        .from(etapaPlaga)
                        .innerJoin(
                            plagasTable,
                            eq(etapaPlaga.plaga_id, plagasTable.id)
                        )
                        .where(eq(etapaPlaga.etapa_cultivo_id, Number(etapaCultivoId))),
                    db
                        .select({
                            id: recomendacionesTable.id,
                            titulo: recomendacionesTable.titulo,
                            tipo: recomendacionesTable.tipo,
                        })
                        .from(etapaRecomendacion)
                        .innerJoin(
                            recomendacionesTable,
                            eq(etapaRecomendacion.recomendacion_id, recomendacionesTable.id)
                        )
                        .where(eq(etapaRecomendacion.etapa_cultivo_id, Number(etapaCultivoId))),
                ]);

                if (enfs && enfs.length > 0) {
                    setCatalogoEnfermedades(enfs);
                } else {
                    const todosEnf = await db.select().from(enfermedadesTable).where(eq(enfermedadesTable.estado, 'activo'));
                    setCatalogoEnfermedades(todosEnf || []);
                }

                if (plas && plas.length > 0) {
                    setCatalogoPlagas(plas);
                } else {
                    const todosPla = await db.select().from(plagasTable).where(eq(plagasTable.estado, 'activo'));
                    setCatalogoPlagas(todosPla || []);
                }

                if (recs && recs.length > 0) {
                    setCatalogoRecomendaciones(recs);
                } else {
                    const todosRec = await db.select().from(recomendacionesTable).where(eq(recomendacionesTable.estado, 'activo'));
                    setCatalogoRecomendaciones(todosRec || []);
                }
            } else {
                const [enfs, plas, recs] = await Promise.all([
                    db.select().from(enfermedadesTable).where(eq(enfermedadesTable.estado, 'activo')),
                    db.select().from(plagasTable).where(eq(plagasTable.estado, 'activo')),
                    db.select().from(recomendacionesTable).where(eq(recomendacionesTable.estado, 'activo')),
                ]);

                setCatalogoEnfermedades(enfs || []);
                setCatalogoPlagas(plas || []);
                setCatalogoRecomendaciones(recs || []);
            }
        } catch (err) {
            console.error('[RegistrarEvento] Error cargando catálogos:', err);
        }
    }, [etapaCultivoId]);

    useEffect(() => {
        cargarCatalogos();
    }, [cargarCatalogos]);

    const setField = useCallback((field, value) => {
        setForm((prev) => {
            const updated = { ...prev, [field]: value };

            if (field === 'tipo_evento') {
                updated.enfermedad_id = null;
                updated.plaga_id = null;
                updated.recomendacion_id = null;
                updated.severidad = null;
            }

            return updated;
        });
    }, []);

    const isValid = useCallback(() => {
        if (!form.titulo || !form.titulo.trim()) return false;
        if (!form.tipo_evento) return false;
        return true;
    }, [form]);

    const resetForm = useCallback(() => {
        setForm({
            tipo_evento: 'avance',
            titulo: '',
            descripcion: '',
            fecha_evento: new Date().toISOString(),
            enfermedad_id: null,
            plaga_id: null,
            recomendacion_id: null,
            severidad: null,
        });
    }, []);

    return {
        form,
        setField,
        isValid: isValid(),
        resetForm,
        loading,
        setLoading,
        catalogoEnfermedades,
        catalogoPlagas,
        catalogoRecomendaciones,
        TIPOS_EVENTO,
        SEVERIDADES,
    };
};

export default useRegistrarEvento;
