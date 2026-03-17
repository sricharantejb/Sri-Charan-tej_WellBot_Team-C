import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, ButtonBase } from '@mui/material';
import { KeyboardHide, Backspace, SpaceBar } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const TELUGU_KEYS = [
    ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం', 'అః'],
    ['క', 'ఖ', 'గ', 'ఘ', 'ఙ', 'చ', 'ఛ', 'జ', 'ఝ', 'ఞ', 'ట', 'ఠ', 'డ', 'ఢ'],
    ['ణ', 'త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల'],
    ['వ', 'శ', 'ష', 'స', 'హ', 'ళ', 'క్ష', 'జ్ఞ', 'ా', 'ి', 'ీ', 'ు', 'ూ', 'ె'],
    ['ే', 'ై', 'ొ', 'ో', 'ౌ', '్', 'ం', 'ః', 'ఁ', '0', '1', '2', '3', '4'],
];

const HINDI_KEYS = [
    ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः', 'ऋ', 'ॠ'],
    ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ'],
    ['ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल'],
    ['व', 'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ', 'ा', 'ि', 'ी', 'ु', 'ू', 'े'],
    ['ै', 'ो', 'ौ', '्', 'ं', 'ः', 'ँ', 'ऽ', '।', '0', '1', '2', '3', '4'],
];

const VirtualKeyboard = ({ lang, onChar, onBackspace, onClose }) => {
    const keys = lang === 'te' ? TELUGU_KEYS : HINDI_KEYS;
    const label = lang === 'te' ? 'తెలుగు కీబోర్డు' : 'हिन्दी कीबोर्ड';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.25 }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        mt: 2,
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: '20px',
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(99,102,241,0.9)', fontWeight: 800, letterSpacing: '0.05em' }}>
                            {label}
                        </Typography>
                        <Tooltip title="Close keyboard">
                            <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#ef4444' } }}>
                                <KeyboardHide fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Key rows */}
                    {keys.map((row, rowIdx) => (
                        <Box key={rowIdx} sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', mb: 0.5 }}>
                            {row.map((char) => (
                                <ButtonBase
                                    key={char}
                                    onClick={() => onChar(char)}
                                    sx={{
                                        minWidth: 36,
                                        height: 36,
                                        px: 1,
                                        borderRadius: '8px',
                                        fontSize: char.length > 2 ? '11px' : '15px',
                                        fontWeight: 600,
                                        color: 'white',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        transition: 'all 0.15s',
                                        '&:hover': {
                                            background: 'rgba(99, 102, 241, 0.25)',
                                            borderColor: 'rgba(99, 102, 241, 0.5)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                                        },
                                        '&:active': { transform: 'scale(0.93)' }
                                    }}
                                >
                                    {char}
                                </ButtonBase>
                            ))}
                        </Box>
                    ))}

                    {/* Action row */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <ButtonBase
                            onClick={() => onChar(' ')}
                            sx={{
                                flex: 1,
                                height: 36,
                                borderRadius: '8px',
                                color: 'rgba(255,255,255,0.6)',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                fontSize: '11px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                '&:hover': { background: 'rgba(255,255,255,0.08)' }
                            }}
                        >
                            <SpaceBar fontSize="small" /> SPACE
                        </ButtonBase>
                        <ButtonBase
                            onClick={onBackspace}
                            sx={{
                                width: 60,
                                height: 36,
                                borderRadius: '8px',
                                color: '#ef4444',
                                background: 'rgba(239,68,68,0.06)',
                                border: '1px solid rgba(239,68,68,0.15)',
                                '&:hover': { background: 'rgba(239,68,68,0.15)' }
                            }}
                        >
                            <Backspace fontSize="small" />
                        </ButtonBase>
                    </Box>
                </Paper>
            </motion.div>
        </AnimatePresence>
    );
};

export default VirtualKeyboard;
