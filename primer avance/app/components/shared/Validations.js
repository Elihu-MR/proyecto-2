export const formatName = (text) => {
    if (!text) return '';
    const cleanedText = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
    return cleanedText
        .split(' ')
        .map(word => {
            if (word.length === 0) return '';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
};

export const isValidName = (name) => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(name) && name.trim().length > 0;
};

export const isAdult = (dateString) => {
    if (!dateString) return false;
    const parts = dateString.split('-');
    if (parts.length !== 3) return false;

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; 
    const day = parseInt(parts[2]);

    const birthDate = new Date(year, month, day);
    if (isNaN(birthDate.getTime()) || birthDate.getFullYear() !== year || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
        return false; 
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 18 && age <= 120;
};

export const formatPhoneNumber = (text) => {
    if (!text) return '';
    const cleaned = text.replace(/\D/g, '');
    return cleaned.slice(0, 10);
};

export const isValidPhoneNumber = (phoneNumber) => {
    return /^\d{10}$/.test(phoneNumber);
};

export const isValidDateFormat = (dateString) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
};

export const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

export const doPasswordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
};