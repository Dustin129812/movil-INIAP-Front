import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    obtenerCatalogosBaseParaEnsayo,
    guardarLoteYEnsayoIntegrado
} from '../../../services/ensayos/ensayosLocalService';

export const useNuevoEnsayo = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const loteBorrador = params.loteDraft ? JSON.parse(params.loteDraft) : null;

    const [isSaving, setIsSaving] = useState(false);
    const [tecnicoId, setTecnicoId] = useState(null);

    const [form, setForm] = useState({
        titulo: '', descripcion: '',
        variedad: '',
        fechaSiembra: new Date().toISOString().split('T')[0],
        distanciaLargo: '', distanciaAncho: '', distanciaUnidad: 'm',
        requiereFinanciamiento: false, financiamiento: '',
        tieneColaborador: false, colNombre: '', colCelular: '',
        tipoEnsayo: 'investigacion',
        disenoExperimental: 'con_diseno',
        tipoTratamiento: '',
        tipoAcolchado: null,
    });

    const TIPO_ENSAYO_LABELS = {
        investigacion: 'Investigación',
        validacion: 'Validación',
        produccion_semillas: 'Producción de Semillas',
        refrescamiento: 'Refrescamiento'
    };

    const DISENO_LABELS = {
        con_diseno: 'Con Diseño Experimental',
        sin_diseno: 'Sin Diseño Experimental',
    };
    
    const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const [dbCultivos, setDbCultivos] = useState([]);
    const [seleccion, setSeleccion] = useState({ cultivo: null });

    const [isSelectorVisible, setIsSelectorVisible] = useState(false);
    const [selectorType, setSelectorType] = useState(null);
    const [selectorOptions, setSelectorOptions] = useState([]);

    useEffect(() => {
        if (!loteBorrador) {
            Alert.alert("Error de Flujo", "No se detectó un polígono de trabajo. Regresando al mapa.");
            router.back();
            return;
        }

        const cargar = async () => {
            const data = await obtenerCatalogosBaseParaEnsayo();
            setTecnicoId(data.tecnicoId);
            setDbCultivos(data.cultivos);
        };
        cargar();
    }, []);

    const abrirSelector = async (tipo) => {
        setSelectorType(tipo);
        if (tipo === 'cultivo') setSelectorOptions(dbCultivos);
        else if (tipo === 'diseno_experimental') {
            setSelectorOptions([
                { id: 'con_diseno', nombre: 'Con Diseño Experimental' },
                { id: 'sin_diseno', nombre: 'Sin Diseño Experimental' },
            ]);
        }
        else if (tipo === 'tipo_ensayo') {
            setSelectorOptions([
                { id: 'investigacion', nombre: 'Investigación' },
                { id: 'validacion', nombre: 'Validación' },
                { id: 'produccion_semillas', nombre: 'Producción de Semillas' },
                { id: 'refrescamiento', nombre: 'Refrescamiento' }
            ]);
        }
        else if (tipo === 'tipo_acolchado') {
            setSelectorOptions([
                { id: null, nombre: 'No aplica / Sin definir' }, // Opción nula
                { id: 'con_acolchado', nombre: 'Con Acolchado' },
                { id: 'parcialmente_acolchado', nombre: 'Parcialmente Acolchado' },
                { id: 'sin_acolchado', nombre: 'Sin Acolchado' }
            ]);
        }
        else if (tipo === 'unidad_medida') {
            setSelectorOptions([
                { id: 'm', nombre: 'Metros (m)' },
                { id: 'cm', nombre: 'Centímetros (cm)' },
                { id: 'mm', nombre: 'Milímetros (mm)' }
            ]);
        }
        setIsSelectorVisible(true);
    };

    const manejarSeleccionModal = (item) => {
        if (selectorType === 'cultivo') setSeleccion({ cultivo: item });
        else if (selectorType === 'tipo_ensayo') updateForm('tipoEnsayo', item.id);
        else if (selectorType === 'diseno_experimental') updateForm('disenoExperimental', item.id);
        else if (selectorType === 'tipo_acolchado') updateForm('tipoAcolchado', item.id);
        else if (selectorType === 'unidad_medida') updateForm('distanciaUnidad', item.id);
        setIsSelectorVisible(false);
    };

    const confirmarGuardado = async () => {
        if (!form.titulo.trim() || !form.variedad.trim() || !form.distanciaLargo.trim() || !form.distanciaAncho.trim()) {
            return Alert.alert("Faltan Datos", "Complete los campos obligatorios (*) incluyendo variedad, largo y ancho de siembra.");
        }

        const payloadEnsayo = {
            ...form,
            distanciaSiembra: `${form.distanciaLargo} x ${form.distanciaAncho} ${form.distanciaUnidad}`,
            financiamiento: form.requiereFinanciamiento ? form.financiamiento : '',
            colNombre: form.tieneColaborador ? form.colNombre : '',
            colCelular: form.tieneColaborador ? form.colCelular : ''
        };

        setIsSaving(true);
        try {
            await guardarLoteYEnsayoIntegrado(loteBorrador, payloadEnsayo, tecnicoId);

            Alert.alert("Éxito", "Lote y Ensayo registrados localmente.");
            router.replace('/(superior)/catalogos-ensayos');
        } catch (e) {
            console.error(e);
            Alert.alert("Error Crítico", "No se pudo registrar la investigación en SQLite.");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        form, updateForm, isSaving, seleccion,
        isSelectorVisible, setIsSelectorVisible, selectorType, selectorOptions,
        abrirSelector, manejarSeleccionModal, confirmarGuardado,
        loteBorrador, TIPO_ENSAYO_LABELS, DISENO_LABELS
    };
};