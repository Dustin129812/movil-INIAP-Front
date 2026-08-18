// ============================================
// DATE PICKER WHEEL - Selector de fecha estilo iOS
// ============================================
// Scroll vertical para dia, mes, año
// Uso: <DatePickerWheel value={date} onChange={setDate} />

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const getDiasDelMes = (mes, anio) => {
    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (mes === 1 && ((anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0)) {
        return 29;
    }
    return diasPorMes[mes];
};

const generarAnios = () => {
    const actual = new Date().getFullYear();
    const anios = [];
    for (let i = actual - 10; i <= actual + 5; i++) {
        anios.push(i);
    }
    return anios;
};

const generarDias = (mes, anio) => {
    const dias = getDiasDelMes(mes, anio);
    const result = [];
    for (let i = 1; i <= dias; i++) {
        result.push(i);
    }
    return result;
};

function WheelPicker({ data, selectedValue, onValueChange, label }) {
    const flatListRef = useRef(null);
    const initialScrollDone = useRef(false);

    useEffect(() => {
        if (!initialScrollDone.current && data.length > 0) {
            const index = data.findIndex(item => item === selectedValue);
            if (index > -1) {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({ index, animated: false });
                }, 100);
            }
            initialScrollDone.current = true;
        }
    }, [selectedValue, data]);

    const renderItem = ({ item, index }) => {
        const isSelected = item === selectedValue;
        return (
            <TouchableOpacity
                style={styles.wheelItem}
                onPress={() => onValueChange(item)}
            >
                <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextSelected]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    const getItemLayout = (_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
    });

    return (
        <View style={styles.wheelContainer}>
            <Text style={styles.wheelLabel}>{label}</Text>
            <FlatList
                ref={flatListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => `${label}-${item}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                getItemLayout={getItemLayout}
                initialNumToRender={VISIBLE_ITEMS}
                windowSize={VISIBLE_ITEMS}
                maxToRenderPerBatch={VISIBLE_ITEMS}
            />
        </View>
    );
}

export default function DatePickerWheel({ visible, value, onChange, onClose, isDark }) {
    const insets = useSafeAreaInsets();

    const parseDate = (dateStr) => {
        if (!dateStr) {
            const now = new Date();
            return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
        }
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return {
                year: parseInt(parts[0], 10),
                month: parseInt(parts[1], 10) - 1,
                day: parseInt(parts[2], 10),
            };
        }
        const now = new Date();
        return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
    };

    const initial = parseDate(value);
    const [day, setDay] = useState(initial.day);
    const [month, setMonth] = useState(initial.month);
    const [year, setYear] = useState(initial.year);
    const [dias, setDias] = useState(generarDias(initial.month, initial.year));
    const anios = generarAnios();

    useEffect(() => {
        setDias(generarDias(month, year));
        if (day > getDiasDelMes(month, year)) {
            setDay(getDiasDelMes(month, year));
        }
    }, [month, year]);

    const handleConfirm = () => {
        const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(formatted);
        onClose();
    };

    const bgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const secondaryColor = isDark ? '#8E8E93' : '#8E8E93';

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.pickerContainer, { backgroundColor: bgColor, paddingBottom: insets.bottom + 16 }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={[styles.cancelText, { color: secondaryColor }]}>Cancelar</Text>
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: textColor }]}>Fecha de Siembra</Text>
                        <TouchableOpacity onPress={handleConfirm}>
                            <Text style={[styles.doneText, { color: '#34C759' }]}>Listo</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.wheelsContainer}>
                        <WheelPicker
                            data={dias}
                            selectedValue={day}
                            onValueChange={setDay}
                            label="Día"
                        />
                        <WheelPicker
                            data={MESES}
                            selectedValue={month}
                            onValueChange={setMonth}
                            label="Mes"
                        />
                        <WheelPicker
                            data={anios}
                            selectedValue={year}
                            onValueChange={setYear}
                            label="Año"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    pickerContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.2)',
    },
    cancelText: {
        fontSize: 17,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
    },
    doneText: {
        fontSize: 17,
        fontWeight: '600',
    },
    wheelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        height: ITEM_HEIGHT * VISIBLE_ITEMS + 20,
    },
    wheelContainer: {
        flex: 1,
        alignItems: 'center',
    },
    wheelLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    wheelItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelItemText: {
        fontSize: 20,
        color: '#8E8E93',
    },
    wheelItemTextSelected: {
        color: '#000000',
        fontWeight: '600',
    },
});
