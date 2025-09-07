// SSN formatter (XXX-XX-XXXX)
export const formatSSN = (value: string): string => {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, "");
  
  // Format based on input length
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 5) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
  }
};

// Phone number formatter (XXX) XXX-XXXX
export const formatPhone = (value: string): string => {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, "");
  
  // Format based on input length
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
};

// Currency formatter ($X,XXX.XX)
export const formatCurrency = (value: string): string => {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, "");
  
  // Make sure we only have one decimal point
  const parts = cleaned.split(".");
  let formatted = parts[0];
  
  // Add commas for thousands
  formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Add decimal part if exists
  if (parts.length > 1) {
    formatted += "." + parts[1].slice(0, 2); // Limit to 2 decimal places
  }
  
  // Add dollar sign
  return "$" + formatted;
};

