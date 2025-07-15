// AETHERIS/components/shared/BackButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- COLORES ---
const PRIMARY_GREEN = '#6BB240';
const WHITE = '#fff';
const BUTTON_HOVER_COLOR = '#5aa130';

export default function BackButton({ onPress, title = 'Regresar' }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={20} color={WHITE} />
            <Text style={styles.backButtonText}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PRIMARY_GREEN,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: PRIMARY_GREEN,
        zIndex: 10,
        shadowColor: PRIMARY_GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transitionDuration: '0.2s',
                transitionProperty: 'background-color, border-color, color',
                ':hover': {
                    backgroundColor: BUTTON_HOVER_COLOR,
                    borderColor: BUTTON_HOVER_COLOR,
                },
            },
        }),
    },
    backButtonText: {
        color: WHITE,
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },
});
