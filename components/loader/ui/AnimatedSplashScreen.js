import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { Video } from 'expo-av';
import { useTheme } from '../../../services/theme';

const { width, height } = Dimensions.get('window');

function AnimatedSplashScreen({ onFinish }) {
    const { isDark } = useTheme();
    const bg = isDark ? '#000000' : '#F2F2F7';
    const videoRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const finishedRef = useRef(false);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const handlePlaybackStatusUpdate = (status) => {
        if (status.isLoaded && status.didJustFinish && !finishedRef.current) {
            finishedRef.current = true;
            onFinish?.();
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, backgroundColor: bg }]}>
                <Video
                    ref={videoRef}
                    source={require('../../../assets/videos/INIAP.mp4')}
                    style={styles.video}
                    resizeMode="cover"
                    shouldPlay
                    isLooping={false}
                    isMuted={false}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    video: {
        width: '100%',
        height: '100%',
    },
});

export default AnimatedSplashScreen;
