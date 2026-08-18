import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle, Defs, Pattern, Rect } from 'react-native-svg';

// Normaliza un array de vértices [{lng,lat}] o [[lng,lat],...] a puntos
// en un viewBox fijo de 300x200, con padding, listos para dibujar.
function normalizarPuntos(vertices, viewW = 300, viewH = 200, padding = 24) {
    if (!vertices || vertices.length === 0) return [];

    const puntos = vertices.map((v) => (Array.isArray(v) ? { lng: v[0], lat: v[1] } : v));

    const lngs = puntos.map((p) => p.lng);
    const lats = puntos.map((p) => p.lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const rangoLng = maxLng - minLng || 1;
    const rangoLat = maxLat - minLat || 1;

    const usableW = viewW - padding * 2;
    const usableH = viewH - padding * 2;

    return puntos.map((p) => {
        const x = padding + ((p.lng - minLng) / rangoLng) * usableW;
        // Invertido en Y: lat mayor = arriba en el mapa
        const y = padding + (1 - (p.lat - minLat) / rangoLat) * usableH;
        return { x, y };
    });
}

export default function VerticesMap({ vertices, color = '#EF9F27', fill = true, showDots = true, style }) {
    const puntos = normalizarPuntos(vertices);

    if (puntos.length === 0) {
        return <View style={[styles.container, style]} />;
    }

    // Polygon de react-native-svg cierra automáticamente la figura
    // (conecta el último punto de vuelta al primero) — por eso ya no
    // se ve como una polilínea abierta cruzándose.
    const puntosStr = puntos.map((p) => `${p.x},${p.y}`).join(' ');

    return (
        <View style={[styles.container, style]}>
            <Svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
                {showDots && (
                    <Defs>
                        <Pattern id="dotGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                            <Circle cx="1.5" cy="1.5" r="1" fill="#FFFFFF" fillOpacity={0.06} />
                        </Pattern>
                    </Defs>
                )}
                {showDots && <Rect x="0" y="0" width="300" height="200" fill="url(#dotGrid)" />}

                <Polygon
                    points={puntosStr}
                    fill={fill ? color : 'none'}
                    fillOpacity={fill ? 0.18 : 0}
                    stroke={color}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                />

                {puntos.map((p, i) => (
                    <Circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
                ))}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
});
