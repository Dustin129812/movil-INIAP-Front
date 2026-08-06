// import React, { useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Animated, Easing, ImageBackground, Image } from 'react-native';
// import { useRouter } from 'expo-router';

// export default function SplashScreen() {
//     const router = useRouter();

//     const dotSize = 15;
//     const dotMargin = 8;
//     const xOffset = dotSize / 2 + dotMargin;
//     const yOffset = dotSize / 2 + dotMargin;

//     const dot1Pos = useRef(new Animated.ValueXY({ x: -xOffset, y: -yOffset })).current;
//     const dot2Pos = useRef(new Animated.ValueXY({ x: xOffset, y: -yOffset })).current;
//     const dot3Pos = useRef(new Animated.ValueXY({ x: -xOffset, y: yOffset })).current;
//     const dot4Pos = useRef(new Animated.ValueXY({ x: xOffset, y: yOffset })).current;

//     const dot1Opacity = useRef(new Animated.Value(1)).current;
//     const dot3Opacity = useRef(new Animated.Value(1)).current;
//     const dot4Opacity = useRef(new Animated.Value(1)).current;

//     useEffect(() => {
//         const animationSequence = Animated.sequence([
//             Animated.parallel([
//                 Animated.timing(dot1Pos, { toValue: { x: -xOffset, y: -yOffset }, duration: 0, useNativeDriver: true }),
//                 Animated.timing(dot2Pos, { toValue: { x: xOffset, y: -yOffset }, duration: 0, useNativeDriver: true }),
//                 Animated.timing(dot3Pos, { toValue: { x: -xOffset, y: yOffset }, duration: 0, useNativeDriver: true }),
//                 Animated.timing(dot4Pos, { toValue: { x: xOffset, y: yOffset }, duration: 0, useNativeDriver: true }),
//                 Animated.timing(dot1Opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
//                 Animated.timing(dot3Opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
//                 Animated.timing(dot4Opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
//             ]),
//             Animated.delay(100),

//             Animated.parallel([
//                 Animated.timing(dot1Pos, { toValue: { x: xOffset, y: -yOffset }, duration: 400, easing: Easing.linear, useNativeDriver: true }),
//                 Animated.timing(dot2Pos, { toValue: { x: xOffset, y: yOffset }, duration: 400, easing: Easing.linear, useNativeDriver: true }),
//                 Animated.timing(dot4Pos, { toValue: { x: -xOffset, y: yOffset }, duration: 400, easing: Easing.linear, useNativeDriver: true }),
//                 Animated.timing(dot3Pos, { toValue: { x: -xOffset, y: -yOffset }, duration: 400, easing: Easing.linear, useNativeDriver: true }),
//             ]),
//             Animated.delay(200),

//             Animated.parallel([
//                 Animated.timing(dot1Pos, { toValue: { x: -xOffset, y: -yOffset }, duration: 400, easing: Easing.linear, useNativeDriver: true }),
//                 Animated.timing(dot2Pos, { toValue: { x: xOffset, y: -yOffset }, duration: 400, easing: Easing.linear, useNativeDriver: true }),
//                 Animated.timing(dot4Pos, { toValue: { x: xOffset, y: yOffset }, duration: 400, easing: Easing.linear, useNativeDriver: true }),
//                 Animated.timing(dot3Pos, { toValue: { x: -xOffset, y: yOffset }, duration: 400, easing: Easing.linear, useNativeDriver: true }),
//             ]),
//             Animated.delay(200),

//             Animated.parallel([
//                 Animated.timing(dot2Pos, { toValue: { x: 0, y: 0 }, duration: 500, easing: Easing.ease, useNativeDriver: true }),
//                 Animated.timing(dot1Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
//                 Animated.timing(dot3Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
//                 Animated.timing(dot4Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
//             ]),
//             Animated.delay(300),

//             Animated.parallel([
//                 Animated.timing(dot2Pos, { toValue: { x: xOffset, y: -yOffset }, duration: 500, easing: Easing.ease, useNativeDriver: true }),
//                 Animated.timing(dot1Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
//                 Animated.timing(dot3Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
//                 Animated.timing(dot4Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
//             ]),
//             Animated.delay(300),
//         ]);

//         animationSequence.start(() => {
//             setTimeout(() => {
//                 router.replace('/login');
//             }, 300);
//         });

//     }, []);

//     return (
//         <ImageBackground
//             source={require('../assets/images/background.jpeg')}
//             style={styles.background}
//             resizeMode="cover"
//         >
//             <View style={styles.overlay} />

//             <View style={styles.container}>
//                 <Image
//                     source={require('../assets/images/escudo_ecuador.png')}
//                     style={styles.logo}
//                     resizeMode="contain"
//                 />
//                 <View style={styles.divider} />

//                 <Text style={styles.instituteText}>
//                     Instituto Nacional de Investigaciones Agropecuarias - INIAP
//                 </Text>

//                 <View style={styles.dotsContainer}>
//                     <Animated.View style={[styles.dot, { transform: [{ translateX: dot1Pos.x }, { translateY: dot1Pos.y }], opacity: dot1Opacity }]} />
//                     <Animated.View style={[styles.dot, { transform: [{ translateX: dot2Pos.x }, { translateY: dot2Pos.y }] }]} />
//                     <Animated.View style={[styles.dot, { transform: [{ translateX: dot3Pos.x }, { translateY: dot3Pos.y }], opacity: dot3Opacity }]} />
//                     <Animated.View style={[styles.dot, { transform: [{ translateX: dot4Pos.x }, { translateY: dot4Pos.y }], opacity: dot4Opacity }]} />
//                 </View>

//                 <Text style={styles.loadingText}>Cargando infomación local...</Text>
//             </View>
//         </ImageBackground>
//     );
// }

// const styles = StyleSheet.create({
//     background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.8)' }, // Un tono más oscuro que empata con el tema de la app
//     container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, width: '100%' },
//     logo: { width: 250, height: 150, marginBottom: 10 },
//     divider: { width: '80%', height: 1, backgroundColor: '#38bdf8', marginVertical: 20 }, // Color de acento de tu app
//     instituteText: { color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 50, fontWeight: '800' },
//     dotsContainer: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
//     dot: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#4ade80', position: 'absolute' }, // Verde INIAP
//     loadingText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' },
// });