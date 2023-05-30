import ModalContent from './Modal';
import { action } from "@storybook/addon-actions";
import React from 'react';

export default {
    title: 'UI/ModalContent',
    component: ModalContent,
    tags: ['autodocs'],
    args: {
        onClick: action('onClick'),
        score: 0,
        questionLength: 10,
    },
};

export const Basic = {
}