import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    FlatList,
    ScrollView,
    Platform,
} from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCroquisMapa } from '../hooks/useCroquisMapa';

const calcularAreaPoligono = (puntos) => {
    if (!puntos || puntos.length < 3) return 0;
    let area = 0;
    const R = 6378137;
    for (let i = 0; i < puntos.length; i++) {
        let p1 = puntos[i];
        let p2 = puntos[(i + 1) % puntos.length];
        area += (p2.longitude - p1.longitude) * (Math.PI / 180) * (2 + Math.sin(p1.latitude * Math.PI / 180) + Math.sin(p2.latitude * Math.PI / 180));
    }
    return Math.abs((area * R * R) / 2);
};

export default function CroquisMapaUI() {
    const {
        mapRef, location, points, isSaving, gpsAccuracy, isTracking,
        showForm, setShowForm, form, updateForm,
        isSelectorVisible, setIsSelectorVisible, selectorType, selectorOptions, ubicacionSeleccionada,
        setCrosshairLocation, centrarEnGPS, toggleTracking, agregarVerticeManual, deshacerUltimoPunto,
        preGuardarLote, abrirSelector, handleSelectOption, confirmarGuardado, origen, mostrarCondiciones,
        setMostrarCondiciones, mapType, rotarTipoMapa
    } = useCroquisMapa();

    const [mostrarHectareas, setMostrarHectareas] = useState(false);

    if (!location) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#34C759" />
                <Text style={styles.loadingText}>Calibrando sensores topográficos...</Text>
            </View>
        );
    }

    const areaM2 = calcularAreaPoligono(points);
    const textoArea = mostrarHectareas
        ? `${(areaM2 / 10000).toFixed(2)} ha`
        : `${areaM2.toFixed(2)} m²`;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={location}
                onRegionChangeComplete={(reg) => setCrosshairLocation({ latitude: reg.latitude, longitude: reg.longitude })}
                mapType={mapType}
                showsUserLocation={true}
                showsCompass={true}
                scrollEnabled={!isTracking}
                zoomEnabled={!isTracking}
            >
                {points.length > 2 && (
                    <Polygon
                        coordinates={points}
                        strokeColor="#34C759"
                        fillColor="rgba(52, 199, 89, 0.3)"
                        strokeWidth={3}
                    />
                )}
                {points.map((p, index) => (
                    <Marker key={index} coordinate={p} anchor={{ x: 0.5, y: 0.5 }}>
                        <View style={styles.vertexMarker}>
                            <Text style={styles.vertexText}>{index + 1}</Text>
                        </View>
                    </Marker>
                ))}
            </MapView>

            {!isTracking && (
                <View style={styles.crosshairContainer} pointerEvents="none">
                    <MaterialCommunityIcons name="crosshairs" size={40} color="#34C759" />
                </View>
            )}

            <View style={styles.hudContainer}>
                <View style={styles.hudPanel}>
                    <MaterialCommunityIcons
                        name="satellite-uplink"
                        size={18}
                        color={gpsAccuracy.includes('±') && parseFloat(gpsAccuracy.slice(1, -1)) > 20 ? '#d32f2f' : '#4caf50'}
                    />
                    <View style={styles.hudData}>
                        <Text style={styles.hudLabel}>Precisión</Text>
                        <Text style={[styles.hudValue, gpsAccuracy.includes('±') && parseFloat(gpsAccuracy.slice(1, -1)) > 20 && { color: '#d32f2f' }]}>
                            {gpsAccuracy}
                        </Text>
                    </View>
                </View>
                <View style={styles.hudPanel}>
                    <MaterialCommunityIcons
                        name={isTracking ? 'shoe-print' : 'shape-polygon-plus'}
                        size={18}
                        color={isTracking ? '#e65100' : '#1976d2'}
                    />
                    <View style={styles.hudData}>
                        <Text style={styles.hudLabel}>{isTracking ? 'Rastreo' : 'Vértices'}</Text>
                        <Text style={[styles.hudValue, isTracking && { color: '#e65100' }]}>
                            {isTracking ? 'Activo' : points.length}
                        </Text>
                    </View>
                </View>
            </View>

            {points.length > 2 && !showForm && (
                <TouchableOpacity
                    style={styles.areaBadge}
                    onPress={() => setMostrarHectareas(!mostrarHectareas)}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="texture-box" size={20} color="#fff" />
                    <Text style={styles.areaBadgeText}>{textoArea}</Text>
                    <MaterialCommunityIcons name="swap-horizontal" size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.layerButton} onPress={rotarTipoMapa} activeOpacity={0.8}>
                <MaterialCommunityIcons
                    name={mapType === 'satellite' ? 'earth' : mapType === 'standard' ? 'map-outline' : 'layers-outline'}
                    size={24}
                    color="#34C759"
                />
            </TouchableOpacity>

            <TouchableOpacity style={styles.gpsButton} onPress={centrarEnGPS}>
                <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#34C759" />
            </TouchableOpacity>

            {!showForm ? (
                <View style={styles.actionDock}>
                    <View style={styles.rowButtons}>
                        <TouchableOpacity
                            style={[styles.dockButton, isTracking ? styles.trackButtonActive : styles.trackButton]}
                            onPress={toggleTracking}
                        >
                            <MaterialCommunityIcons
                                name={isTracking ? 'stop-circle-outline' : 'walk'}
                                size={22}
                                color={isTracking ? '#fff' : '#34C759'}
                            />
                            <Text style={[styles.dockButtonText, { color: isTracking ? '#fff' : '#34C759' }]}>
                                {isTracking ? 'Detener' : 'Auto'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.dockButton, styles.manualButton, isTracking && styles.buttonDisabled]}
                            onPress={agregarVerticeManual}
                            disabled={isTracking}
                        >
                            <MaterialCommunityIcons name="target" size={22} color={isTracking ? '#9e9e9e' : '#fff'} />
                            <Text style={[styles.dockButtonText, { color: isTracking ? '#9e9e9e' : '#fff' }]}>Fijar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.rowButtons, { marginTop: 10 }]}>
                        <TouchableOpacity
                            style={[styles.dockButton, styles.undoButton, (points.length === 0 || isTracking) && styles.buttonDisabled]}
                            onPress={deshacerUltimoPunto}
                            disabled={points.length === 0 || isTracking}
                        >
                            <MaterialCommunityIcons
                                name="undo-variant"
                                size={22}
                                color={(points.length === 0 || isTracking) ? '#9e9e9e' : '#d32f2f'}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.dockButton, styles.saveButton, (points.length < 3 || isTracking) && styles.buttonDisabled]}
                            onPress={preGuardarLote}
                            disabled={points.length < 3 || isTracking}
                        >
                            <MaterialCommunityIcons name="content-save-check" size={22} color="#fff" />
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <MaterialCommunityIcons name="map-check" size={28} color="#34C759" />
                            <Text style={styles.modalTitle}>Confirmar Lote</Text>
                        </View>

                        <ScrollView
                            style={styles.scrollForm}
                            contentContainerStyle={styles.scrollFormContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.inputLabel}>Nombre del Lote *</Text>
                            <View style={styles.inputGroup}>
                                <MaterialCommunityIcons name="tag-outline" size={20} color="#78909c" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInputClean}
                                    placeholder="Ej. Lote 01"
                                    value={form.nombreLote}
                                    onChangeText={(v) => updateForm('nombreLote', v)}
                                />
                            </View>

                            <Text style={styles.inputLabel}>Ubicación del Lote *</Text>
                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => abrirSelector('provincia')}>
                                <Text style={styles.dropdownLabel}>Provincia:</Text>
                                <Text style={styles.dropdownValue}>
                                    {ubicacionSeleccionada.provincia ? ubicacionSeleccionada.provincia.name : 'Tocar para buscar...'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color="#94a3b8" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => abrirSelector('canton')}>
                                <Text style={styles.dropdownLabel}>Cantón:</Text>
                                <Text style={styles.dropdownValue}>
                                    {ubicacionSeleccionada.canton ? ubicacionSeleccionada.canton.name : 'Tocar para buscar...'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color="#94a3b8" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => abrirSelector('estacion')}>
                                <Text style={styles.dropdownLabel}>Estación:</Text>
                                <Text style={styles.dropdownValue}>
                                    {ubicacionSeleccionada.estacion ? ubicacionSeleccionada.estacion.name : 'Ninguna (Opcional)'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color="#94a3b8" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.collapsibleHeader}
                                onPress={() => setMostrarCondiciones(!mostrarCondiciones)}
                                activeOpacity={0.7}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="sprout-outline" size={22} color={mostrarCondiciones ? '#34C759' : '#546e7a'} />
                                    <Text style={[styles.collapsibleTitle, mostrarCondiciones && { color: '#34C759' }]}>
                                        Condiciones del Terreno
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name={mostrarCondiciones ? 'chevron-up' : 'chevron-down'} size={24} color={mostrarCondiciones ? '#34C759' : '#94a3b8'} />
                            </TouchableOpacity>

                            {mostrarCondiciones && (
                                <View style={styles.collapsibleContent}>
                                    <Text style={styles.inputLabel}>Cultivo Anterior</Text>
                                    <View style={styles.inputGroup}>
                                        <MaterialCommunityIcons name="history" size={20} color="#78909c" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInputClean}
                                            placeholder="Ej. Maíz"
                                            value={form.cultivoAnterior}
                                            onChangeText={(v) => updateForm('cultivoAnterior', v)}
                                        />
                                    </View>

                                    <Text style={styles.inputLabel}>Tipo de Riego</Text>
                                    <TouchableOpacity
                                        style={[styles.dropdownBtn, { backgroundColor: '#e8f5e9', borderColor: '#81c784' }]}
                                        onPress={() => abrirSelector('tipo_riego')}
                                    >
                                        <MaterialCommunityIcons name="water-outline" size={22} color="#2e7d32" style={{ marginRight: 10 }} />
                                        <Text style={[styles.dropdownValue, { color: '#1b5e20', fontSize: 16, textTransform: 'uppercase' }]}>
                                            {form.tipoRiego ? form.tipoRiego.replace('_', ' ') : 'SELECCIONAR'}
                                        </Text>
                                        <MaterialCommunityIcons name="menu-down" size={24} color="#2e7d32" />
                                    </TouchableOpacity>

                                    <Text style={styles.inputLabel}>Topografía</Text>
                                    <View style={styles.segmentedControl}>
                                        {['Plana', 'Ondulada', 'Quebrada'].map((tipo) => (
                                            <TouchableOpacity
                                                key={tipo}
                                                style={[styles.segmentBtn, form.topografia === tipo && styles.segmentBtnActive]}
                                                onPress={() => updateForm('topografia', tipo)}
                                            >
                                                <Text style={[styles.segmentText, form.topografia === tipo && styles.segmentTextActive]}>
                                                    {tipo}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {isSelectorVisible && (
                            <View style={[styles.selectorOverlay]}>
                                <View style={[styles.modalCard, { maxHeight: '70%', margin: 20 }]}>
                                    <Text style={styles.modalTitle}>Seleccione opción</Text>
                                    {selectorOptions.length === 0 ? (
                                        <Text style={{ textAlign: 'center', marginTop: 20, color: '#78909c' }}>No hay opciones disponibles.</Text>
                                    ) : (
                                        <FlatList
                                            data={selectorOptions}
                                            keyExtractor={(i) => i.id?.toString() || i.uuid_movil?.toString()}
                                            showsVerticalScrollIndicator={false}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectOption(item)}>
                                                    <Text style={styles.optionText}>{item.name}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    )}
                                    <TouchableOpacity
                                        style={{ marginTop: 20, alignItems: 'center', paddingVertical: 10 }}
                                        onPress={() => setIsSelectorVisible(false)}
                                    >
                                        <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 16 }}>Cerrar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelAction} onPress={() => setShowForm(false)}>
                                <Text style={styles.cancelActionText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmAction, isSaving && styles.confirmActionDisabled]}
                                onPress={confirmarGuardado}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.confirmActionText}>Guardar Local</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' },
    loadingText: { marginTop: 16, color: '#37474f', fontWeight: '600', fontSize: 16 },

    vertexMarker: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', borderWidth: 2, borderColor: '#34C759', justifyContent: 'center', alignItems: 'center' },
    vertexText: { fontSize: 10, fontWeight: 'bold', color: '#34C759' },
    crosshairContainer: { position: 'absolute', top: '50%', left: '50%', marginTop: -20, marginLeft: -20, zIndex: 10 },
    hudContainer: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
    hudPanel: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '48%',
    },
    hudData: { marginLeft: 8 },
    hudLabel: { fontSize: 10, color: '#78909c', textTransform: 'uppercase', fontWeight: 'bold' },
    hudValue: { fontSize: 14, color: '#263238', fontWeight: '900' },

    areaBadge: {
        position: 'absolute',
        top: 120,
        alignSelf: 'center',
        backgroundColor: '#34C759',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    areaBadgeText: { color: '#fff', fontWeight: '900', fontSize: 16, marginLeft: 8 },

    actionDock: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 12,
        borderRadius: 20,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    rowButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    dockButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
    trackButton: { flex: 1, backgroundColor: '#e8f5e9', marginRight: 8, borderWidth: 1, borderColor: '#c8e6c9' },
    trackButtonActive: { flex: 1, backgroundColor: '#e65100', marginRight: 8, elevation: 4 },
    manualButton: { flex: 1.5, backgroundColor: '#1976d2', marginLeft: 8 },
    undoButton: { flex: 1, backgroundColor: '#ffebee', marginRight: 8 },
    saveButton: { flex: 1.5, backgroundColor: '#34C759', marginLeft: 8 },
    buttonDisabled: { backgroundColor: '#f5f5f5', opacity: 0.8 },
    dockButtonText: { fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
    saveButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },

    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(38, 50, 56, 0.7)',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 10,
        maxHeight: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
    },
    selectorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        zIndex: 2000,
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 22, fontWeight: '900', color: '#34C759', marginLeft: 10 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 16 },
    cancelAction: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 8 },
    cancelActionText: { color: '#78909c', fontWeight: 'bold', fontSize: 15 },
    confirmAction: { backgroundColor: '#34C759', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
    confirmActionDisabled: { backgroundColor: '#a5d6a7' },
    confirmActionText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

    scrollForm: { maxHeight: 400 },
    scrollFormContent: { paddingBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#546e7a', marginBottom: 8, textTransform: 'uppercase' },
    inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, marginBottom: 20 },
    inputIcon: { marginRight: 10 },
    textInputClean: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#0f172a' },
    dropdownBtn: { flexDirection: 'row', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
    dropdownLabel: { fontWeight: '700', color: '#64748b', marginRight: 10, width: 75, fontSize: 14 },
    dropdownValue: { flex: 1, color: '#0f172a', fontWeight: '800', fontSize: 15 },
    collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, marginBottom: 10 },
    collapsibleTitle: { fontSize: 15, fontWeight: '800', color: '#546e7a', marginLeft: 10 },
    collapsibleContent: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 10 },
    segmentedControl: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
    segmentBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
    segmentBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    segmentText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    segmentTextActive: { color: '#0f172a', fontWeight: '900' },
    optionItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f2f5' },
    optionText: { fontSize: 16, color: '#263238', fontWeight: '500' },

    layerButton: {
        position: 'absolute',
        bottom: 220,
        right: 20,
        zIndex: 10,
        backgroundColor: '#fff',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    gpsButton: {
        position: 'absolute',
        bottom: 160,
        right: 20,
        zIndex: 10,
        backgroundColor: '#fff',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
});
