import React from 'react';

export enum ToastType {
    SUCCESS = 'success',
    DANGER = 'error',
    INFO = 'info',
    WARNING = 'warning',
}

let toastCallback: ((message: string, type: ToastType) => void) | null = null;

export const setToastCallback = (callback: (message: string, type: ToastType) => void) => {
    toastCallback = callback;
};

export const toastBar = (message: string, type: ToastType = ToastType.INFO) => {
    if (toastCallback) {
        toastCallback(message, type);
    } else {
        console.warn('Toast callback not set. Message:', message);
    }
};