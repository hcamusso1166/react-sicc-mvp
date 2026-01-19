export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const CUIT_PATTERN = /^\d{2}-\d{8}-\d$/

export const isBlank = (value) => !value?.toString().trim()