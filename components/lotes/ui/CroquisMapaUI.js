import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    FlatList,
    ScrollView,
    Animated,
    Dimensions,
    Platform,
    StatusBar,
    PanResponder,
    Keyboard,
    Alert,
} from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import { cacheDirectory, makeDirectoryAsync, moveAsync, getInfoAsync } from 'expo-file-system/legacy';
import { useCroquisMapa } from '../hooks/useCroquisMapa';
import { useTheme } from '../../../services/ThemeContext';

const { width } = Dimensions.get('window');

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

const LUGARES_SUGERIDOS = [
    { id: '1', title: 'Lote San José - Sector Norte', lat: -0.22, lng: -78.51 },
    { id: '2', title: 'Lote El Carmen - Cultivo Maíz', lat: -0.23, lng: -78.52 },
    { id: '3', title: 'Estación Meteorológica Central', lat: -0.21, lng: -78.50 },
];

export default function CroquisMapaUI() {
    const router = useRouter();
    const { edit } = useLocalSearchParams();
    const editLoteId = edit ? parseInt(edit) : null;

    const {
        mapRef, location, points, isSaving, gpsAccuracy, isTracking,
        showForm, setShowForm, form, updateForm,
        isSelectorVisible, setIsSelectorVisible, selectorType, selectorOptions, ubicacionSeleccionada,
        setCrosshairLocation, centrarEnGPS, toggleTracking, agregarVerticeManual, deshacerUltimoPunto,
        preGuardarLote, abrirSelector, handleSelectOption, confirmarGuardado, origen, mostrarCondiciones,
        setMostrarCondiciones, mapType, rotarTipoMapa, isEditMode, editLoteData,
        setImagenUrlLote
    } = useCroquisMapa(editLoteId);

    const { isDark } = useTheme();

    const [mostrarHectareas, setMostrarHectareas] = useState(false);
    const [busquedaText, setBusquedaText] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);

    // Animación y Gesto para desplazar el Bottom Sheet
    const sheetY = useRef(new Animated.Value(0)).current;
    const [sheetCollapsed, setSheetCollapsed] = useState(false);

    // Ref para capturar la imagen del mapa con view-shot
    const mapViewRef = useRef(null);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0 || (gestureState.dy < 0 && sheetCollapsed)) {
                    sheetY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 60) {
                    Animated.spring(sheetY, { toValue: 130, useNativeDriver: false }).start();
                    setSheetCollapsed(true);
                } else {
                    Animated.spring(sheetY, { toValue: 0, useNativeDriver: false }).start();
                    setSheetCollapsed(false);
                }
            },
        })
    ).current;

    const handleSearchTextChange = (text) => {
        setBusquedaText(text);
        if (text.trim().length > 0) {
            const filtrados = LUGARES_SUGERIDOS.filter(item =>
                item.title.toLowerCase().includes(text.toLowerCase())
            );
            setResultadosBusqueda(filtrados);
        } else {
            setResultadosBusqueda([]);
        }
    };

    const seleccionarLugarBuscado = (item) => {
        setBusquedaText(item.title);
        setResultadosBusqueda([]);
        Keyboard.dismiss();
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: item.lat,
                longitude: item.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }, 1000);
        }
    };

    // Capturar imagen del mapa para usar como fondo en la tarjeta del lote
    const capturarImagenMapa = async () => {
        if (!mapViewRef.current) {
            return null;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const snapshot = await captureRef(mapViewRef, {
                format: 'jpg',
                quality: 0.8,
            });

            let cleanUri = snapshot;
            if (cleanUri && cleanUri.endsWith('/..')) {
                cleanUri = cleanUri.replace('/..', '');
            }
            if (cleanUri && cleanUri.endsWith('/')) {
                cleanUri = cleanUri.slice(0, -1);
            }

            setImagenUrlLote(cleanUri);
            return cleanUri;
        } catch (error) {
            console.error('Error capturando imagen del mapa');
            Alert.alert('Error', 'No se pudo capturar la imagen del mapa');
            return null;
        }
    };

    const toggleSheetState = () => {
        if (sheetCollapsed) {
            Animated.spring(sheetY, { toValue: 0, useNativeDriver: false }).start();
            setSheetCollapsed(false);
        } else {
            Animated.spring(sheetY, { toValue: 130, useNativeDriver: false }).start();
            setSheetCollapsed(true);
        }
    };

    if (!location) {
        return (
            <View style={styles.centered}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <ActivityIndicator size="large" color="#30D158" />
                <Text style={styles.loadingText}>Calibrando sensores topográficos...</Text>
            </View>
        );
    }

    const areaM2 = calcularAreaPoligono(points);
    const textoArea = mostrarHectareas
        ? `${(areaM2 / 10000).toFixed(2)} ha`
        : `${areaM2.toFixed(2)} m²`;

    const containerBg = isDark ? '#121212' : '#F2F2F7';

    return (
        <View style={[styles.container, { backgroundColor: containerBg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View ref={mapViewRef} collapsable={false} style={styles.map}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={location}
                onRegionChangeComplete={(reg) => setCrosshairLocation({ latitude: reg.latitude, longitude: reg.longitude })}
                mapType={mapType}
                showsUserLocation={true}
                showsCompass={false}
                scrollEnabled={!isTracking}
                zoomEnabled={!isTracking}
            >
                {points.length > 2 && (
                    <Polygon
                        coordinates={points}
                        strokeColor="#30D158"
                        fillColor="rgba(48, 209, 88, 0.25)"
                        strokeWidth={2.5}
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
            </View>

            {/* Visor verde oculto durante el modal de guardado */}
            {!isTracking && !showForm && (
                <View style={styles.crosshairContainer} pointerEvents="none">
                    <MaterialCommunityIcons name="crosshairs" size={32} color="#30D158" />
                </View>
            )}

            {/* Top Bar HUD */}
            <View style={styles.hudContainer}>
                {isEditMode && editLoteData && (
                    <View style={styles.hudPanelEdit}>
                        <MaterialCommunityIcons
                            name={editLoteData.sync_status === 'SYNCED' ? 'check-circle' : 'clock-outline'}
                            size={15}
                            color={editLoteData.sync_status === 'SYNCED' ? '#34C759' : '#FF9500'}
                        />
                        <Text style={[styles.hudLabel, { color: editLoteData.sync_status === 'SYNCED' ? '#34C759' : '#FF9500' }]}>
                            {editLoteData.sync_status === 'SYNCED' ? 'Activo' : 'Pendiente'}
                        </Text>
                    </View>
                )}
                <View style={styles.hudPanel}>
                    <MaterialCommunityIcons
                        name="satellite-uplink"
                        size={15}
                        color={gpsAccuracy.includes('±') && parseFloat(gpsAccuracy.slice(1, -1)) > 20 ? '#FF453A' : '#30D158'}
                    />
                    <Text style={styles.hudLabel}>Precisión</Text>
                    <Text style={[styles.hudValue, gpsAccuracy.includes('±') && parseFloat(gpsAccuracy.slice(1, -1)) > 20 && { color: '#FF453A' }]}>
                        {gpsAccuracy}
                    </Text>
                </View>

                <View style={styles.hudPanel}>
                    <MaterialCommunityIcons
                        name={isTracking ? 'shoe-print' : 'shape-polygon-plus'}
                        size={15}
                        color={isTracking ? '#FF9F0A' : '#0A84FF'}
                    />
                    <Text style={styles.hudLabel}>{isTracking ? 'Rastreo' : 'Vértices'}</Text>
                    <Text style={[styles.hudValue, isTracking && { color: '#FF9F0A' }]}>
                        {isTracking ? 'Activo' : points.length}
                    </Text>
                </View>
            </View>

            {/* Insignia de Área */}
            {points.length > 2 && !showForm && (
                <TouchableOpacity
                    style={styles.areaBadge}
                    onPress={() => setMostrarHectareas(!mostrarHectareas)}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="texture-box" size={18} color="#30D158" />
                    <Text style={styles.areaBadgeText}>{textoArea}</Text>
                    <MaterialCommunityIcons name="swap-horizontal" size={14} color="#8E8E93" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
            )}

            {/* Botones Flotantes Capas / GPS */}
            <View style={styles.rightControlCapsule}>
                <TouchableOpacity style={styles.capsuleBtn} onPress={rotarTipoMapa} activeOpacity={0.7}>
                    <MaterialCommunityIcons
                        name={mapType === 'satellite' ? 'earth' : mapType === 'standard' ? 'map-outline' : 'layers-outline'}
                        size={22}
                        color="#0A84FF"
                    />
                </TouchableOpacity>
                <View style={styles.capsuleDivider} />
                <TouchableOpacity style={styles.capsuleBtn} onPress={centrarEnGPS} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="navigation-variant" size={22} color="#0A84FF" />
                </TouchableOpacity>
            </View>

            {/* Bottom Sheet Principal (Subir y Bajar) */}
            {!showForm ? (
                <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetY }] }]}>
                    <View {...panResponder.panHandlers} style={styles.dragHeader}>
                        <TouchableOpacity onPress={toggleSheetState} activeOpacity={0.8}>
                            <View style={styles.dragHandle} />
                        </TouchableOpacity>
                    </View>

                    {/* Buscador de Mapa */}
                    <View style={styles.searchRow}>
                        <View style={styles.searchBar}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar lote, sector o lugar..."
                                placeholderTextColor="#8E8E93"
                                value={busquedaText}
                                onChangeText={handleSearchTextChange}
                                onFocus={() => setIsSearchFocused(true)}
                            />
                            {busquedaText.length > 0 ? (
                                <TouchableOpacity onPress={() => handleSearchTextChange('')}>
                                    <MaterialCommunityIcons name="close-circle" size={18} color="#8E8E93" />
                                </TouchableOpacity>
                            ) : (
                                <MaterialCommunityIcons name="microphone" size={18} color="#8E8E93" />
                            )}
                        </View>
                    </View>

                    {/* Resultados de Búsqueda */}
                    {resultadosBusqueda.length > 0 && (
                        <View style={styles.searchResultsContainer}>
                            {resultadosBusqueda.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.searchResultItem}
                                    onPress={() => seleccionarLugarBuscado(item)}
                                >
                                    <MaterialCommunityIcons name="map-marker-outline" size={18} color="#30D158" style={{ marginRight: 10 }} />
                                    <Text style={styles.searchResultText}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Botones de Acción */}
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            style={[styles.appleTile, isTracking && styles.appleTileOrange]}
                            onPress={toggleTracking}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.tileIconContainer, { backgroundColor: isTracking ? 'rgba(255, 159, 10, 0.15)' : 'rgba(48, 209, 88, 0.15)' }]}>
                                <MaterialCommunityIcons
                                    name={isTracking ? 'stop-circle-outline' : 'walk'}
                                    size={24}
                                    color={isTracking ? '#FF9F0A' : '#30D158'}
                                />
                            </View>
                            <Text style={styles.tileLabel}>{isTracking ? 'Detener' : 'Auto GPS'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.appleTile, isTracking && styles.tileDisabled]}
                            onPress={agregarVerticeManual}
                            disabled={isTracking}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.tileIconContainer, { backgroundColor: 'rgba(10, 132, 255, 0.15)' }]}>
                                <MaterialCommunityIcons name="target" size={24} color="#0A84FF" />
                            </View>
                            <Text style={styles.tileLabel}>Fijar Punto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.appleTile, (points.length === 0 || isTracking) && styles.tileDisabled]}
                            onPress={deshacerUltimoPunto}
                            disabled={points.length === 0 || isTracking}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.tileIconContainer, { backgroundColor: 'rgba(255, 69, 58, 0.15)' }]}>
                                <MaterialCommunityIcons name="undo-variant" size={24} color="#FF453A" />
                            </View>
                            <Text style={styles.tileLabel}>Deshacer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.appleTile, (points.length < 3 || isTracking) && styles.tileDisabled]}
                            onPress={async () => {
                                if (points.length >= 3 && !isTracking) {
                                    try {
                                        const imageUri = await capturarImagenMapa();
                                        setImagenUrlLote(imageUri);
                                        preGuardarLote();
                                    } catch (error) {
                                        console.error('Error en proceso de guardado');
                                        Alert.alert('Error', 'No se pudo procesar');
                                    }
                                }
                            }}
                            disabled={points.length < 3 || isTracking}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.tileIconContainer, { backgroundColor: 'rgba(48, 209, 88, 0.15)' }]}>
                                <MaterialCommunityIcons name="check-circle-outline" size={24} color="#30D158" />
                            </View>
                            <Text style={styles.tileLabel}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            ) : (
                /* Modal Confirmar Lote sin recortes */
                <View style={styles.modalOverlay}>
                    <View style={styles.appleModalCard}>
                        <View style={styles.dragHandle} />
                        <View style={styles.modalHeader}>
                            <MaterialCommunityIcons name="map-check" size={24} color="#30D158" />
                            <Text style={styles.modalTitle}>Confirmar Lote</Text>
                        </View>

                        <ScrollView
                            style={styles.scrollForm}
                            contentContainerStyle={styles.scrollFormContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.inputLabel}>Nombre del Lote *</Text>
                            <View style={styles.inputGroup}>
                                <MaterialCommunityIcons name="tag-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInputClean}
                                    placeholder="Ej. Lote San José"
                                    placeholderTextColor="#636366"
                                    value={form.nombreLote}
                                    onChangeText={(v) => updateForm('nombreLote', v)}
                                />
                            </View>

                            <Text style={styles.inputLabel}>Estado del Lote</Text>
                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => abrirSelector('estado_verificacion')}>
                                <Text style={styles.dropdownLabel}>Estado</Text>
                                <View style={styles.dropdownValueContainer}>
                                    <Text style={[styles.dropdownValue, {
                                        color: form.estadoVerificacion === 'verificado' ? '#34C759' : '#FF9500'
                                    }]} numberOfLines={1}>
                                        {form.estadoVerificacion === 'verificado' ? 'Activo' : 'Pendiente'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#636366" />
                                </View>
                            </TouchableOpacity>

                            <Text style={styles.inputLabel}>Ubicación del Lote *</Text>
                            
                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => abrirSelector('provincia')}>
                                <Text style={styles.dropdownLabel}>Provincia</Text>
                                <View style={styles.dropdownValueContainer}>
                                    <Text style={styles.dropdownValue} numberOfLines={1}>
                                        {ubicacionSeleccionada.provincia
                                            ? (ubicacionSeleccionada.provincia.name || ubicacionSeleccionada.provincia.nombre)
                                            : 'Seleccionar...'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#636366" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => abrirSelector('canton')}>
                                <Text style={styles.dropdownLabel}>Cantón</Text>
                                <View style={styles.dropdownValueContainer}>
                                    <Text style={styles.dropdownValue} numberOfLines={1}>
                                        {ubicacionSeleccionada.canton
                                            ? (ubicacionSeleccionada.canton.name || ubicacionSeleccionada.canton.nombre)
                                            : 'Seleccionar...'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#636366" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => abrirSelector('estacion')}>
                                <Text style={styles.dropdownLabel}>Estación</Text>
                                <View style={styles.dropdownValueContainer}>
                                    <Text style={styles.dropdownValue} numberOfLines={1}>
                                        {ubicacionSeleccionada.estacion
                                            ? (ubicacionSeleccionada.estacion.name || ubicacionSeleccionada.estacion.nombre)
                                            : 'Opcional'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#636366" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.collapsibleHeader}
                                onPress={() => setMostrarCondiciones(!mostrarCondiciones)}
                                activeOpacity={0.7}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="sprout-outline" size={20} color="#30D158" />
                                    <Text style={styles.collapsibleTitle}>Condiciones del Terreno</Text>
                                </View>
                                <MaterialCommunityIcons name={mostrarCondiciones ? 'chevron-up' : 'chevron-down'} size={20} color="#8E8E93" />
                            </TouchableOpacity>

                            {mostrarCondiciones && (
                                <View style={styles.collapsibleContent}>
                                    <Text style={styles.inputLabel}>Cultivo Anterior</Text>
                                    <View style={styles.inputGroup}>
                                        <MaterialCommunityIcons name="history" size={20} color="#8E8E93" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.textInputClean}
                                            placeholder="Ej. Maíz"
                                            placeholderTextColor="#636366"
                                            value={form.cultivoAnterior}
                                            onChangeText={(v) => updateForm('cultivoAnterior', v)}
                                        />
                                    </View>

                                    <Text style={styles.inputLabel}>Tipo de Riego</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownBtn}
                                        onPress={() => abrirSelector('tipo_riego')}
                                    >
                                        <Text style={styles.dropdownLabel}>Riego</Text>
                                        <View style={styles.dropdownValueContainer}>
                                            <Text style={[styles.dropdownValue, { color: '#0A84FF' }]} numberOfLines={1}>
                                                {form.tipoRiego ? form.tipoRiego.replace('_', ' ') : 'SELECCIONAR'}
                                            </Text>
                                            <MaterialCommunityIcons name="chevron-right" size={20} color="#636366" />
                                        </View>
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
                                    <Text style={styles.confirmActionText}>{isEditMode ? 'Actualizar Lote' : 'Guardar Local'}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Modal Selector Independiente (Capa superior zIndex para evitar recortes) */}
            {isSelectorVisible && (
                <View style={styles.selectorOverlay}>
                    <View style={styles.selectorModalCard}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.selectorTitle}>
                            {selectorType === 'provincia' ? 'Seleccionar Provincia' :
                             selectorType === 'canton' ? 'Seleccionar Cantón' :
                             selectorType === 'estacion' ? 'Seleccionar Estación' :
                             selectorType === 'estado_verificacion' ? 'Seleccionar Estado' :
                             selectorType === 'tipo_riego' ? 'Seleccionar Tipo de Riego' :
                             'Seleccionar Opción'}
                        </Text>

                        {(!selectorOptions || selectorOptions.length === 0) ? (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#8E8E93" />
                                <Text style={styles.emptyText}>
                                    {selectorType === 'canton' && !ubicacionSeleccionada.provincia
                                        ? 'Primero seleccione una provincia.'
                                        : 'No hay opciones disponibles.'}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={selectorOptions}
                                keyExtractor={(item, index) => item.id?.toString() || item.uuid_movil?.toString() || index.toString()}
                                showsVerticalScrollIndicator={false}
                                style={{ maxHeight: 280 }}
                                renderItem={({ item }) => {
                                    const nombreOpcion = item.name || item.nombre || item.label || item.descripcion || item;
                                    return (
                                        <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectOption(item)}>
                                            <Text style={styles.optionText}>{nombreOpcion}</Text>
                                            <MaterialCommunityIcons name="chevron-right" size={18} color="#636366" />
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.closeSelectorBtn}
                            onPress={() => setIsSelectorVisible(false)}
                        >
                            <Text style={styles.closeSelectorText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    map: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' },
    loadingText: { marginTop: 16, color: '#8E8E93', fontWeight: '600', fontSize: 15 },

    vertexMarker: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#1C1C1E',
        borderWidth: 2,
        borderColor: '#30D158',
        justifyContent: 'center',
        alignItems: 'center',
    },
    vertexText: { fontSize: 11, fontWeight: 'bold', color: '#30D158' },
    crosshairContainer: { position: 'absolute', top: '50%', left: '50%', marginTop: -16, marginLeft: -16, zIndex: 1 },

    // HUD Superior
    hudContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 54 : 36,
        left: 16,
        flexDirection: 'row',
        gap: 8,
    },
    hudPanel: {
        flexDirection: 'row',
        backgroundColor: 'rgba(28, 28, 30, 0.85)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    hudLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '600', marginLeft: 6 },
    hudValue: { fontSize: 11, color: '#FFFFFF', fontWeight: '800', marginLeft: 4 },

    // Area Badge
    areaBadge: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 104 : 86,
        alignSelf: 'center',
        backgroundColor: 'rgba(28, 28, 30, 0.90)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    areaBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, marginLeft: 6 },

    // Cápsula Derecha
    rightControlCapsule: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 54 : 36,
        right: 16,
        backgroundColor: 'rgba(28, 28, 30, 0.90)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    capsuleBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    capsuleDivider: {
        width: 28,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    // Bottom Sheet
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
        zIndex: 10,
    },
    dragHeader: {
        width: '100%',
        paddingVertical: 12,
        alignItems: 'center',
    },
    dragHandle: {
        width: 36,
        height: 5,
        backgroundColor: '#48484A',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 8,
    },

    // Buscador
    searchRow: { marginBottom: 12 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 42,
    },
    searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
    searchResultsContainer: {
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        marginBottom: 12,
        maxHeight: 140,
        overflow: 'hidden',
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    searchResultText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },

    // Action Tiles
    actionGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    appleTile: {
        flex: 1,
        backgroundColor: '#2C2C2E',
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appleTileOrange: {
        backgroundColor: 'rgba(255, 159, 10, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 159, 10, 0.4)',
    },
    tileDisabled: { opacity: 0.4 },
    tileIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    tileLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },

    // Formulario Modal Confirmar
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'flex-end',
        zIndex: 100,
    },
    appleModalCard: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        maxHeight: '88%',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginLeft: 8 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 14 },
    cancelAction: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 8 },
    cancelActionText: { color: '#8E8E93', fontWeight: '600', fontSize: 15 },
    confirmAction: { backgroundColor: '#30D158', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 14 },
    confirmActionDisabled: { opacity: 0.5 },
    confirmActionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

    scrollForm: { flexShrink: 1 },
    scrollFormContent: { paddingBottom: 10 },
    inputLabel: { fontSize: 11, fontWeight: '700', color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 12, paddingHorizontal: 14, marginBottom: 12 },
    inputIcon: { marginRight: 8 },
    textInputClean: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#FFFFFF' },

    // Layout Dropdowns iOS Limpio
    dropdownBtn: {
        flexDirection: 'row',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownLabel: { fontWeight: '600', color: '#8E8E93', fontSize: 14 },
    dropdownValueContainer: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginLeft: 10 },
    dropdownValue: { color: '#FFFFFF', fontWeight: '600', fontSize: 14, marginRight: 4 },

    collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2C2C2E', padding: 14, borderRadius: 12, marginBottom: 10, marginTop: 4 },
    collapsibleTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginLeft: 8 },
    collapsibleContent: { backgroundColor: '#1C1C1E', padding: 10, borderRadius: 12, marginBottom: 10 },
    segmentedControl: { flexDirection: 'row', backgroundColor: '#2C2C2E', borderRadius: 10, padding: 2 },
    segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    segmentBtnActive: { backgroundColor: '#636366' },
    segmentText: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
    segmentTextActive: { color: '#FFFFFF', fontWeight: '800' },

    // Modal Selector Independiente (zIndex Top)
    selectorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'flex-end',
        zIndex: 2000,
    },
    selectorModalCard: {
        backgroundColor: '#2C2C2E',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    selectorTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 16, textAlign: 'center' },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    optionText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
    emptyContainer: { alignItems: 'center', paddingVertical: 24 },
    emptyText: { color: '#8E8E93', fontSize: 14, marginTop: 8, textAlign: 'center' },
    closeSelectorBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
    closeSelectorText: { color: '#FF453A', fontWeight: '700', fontSize: 16 },
});