
interface FormData {
  stockNumber: string;
  shape: string;
  carat: string;
  color: string;
  clarity: string;
  price: string;
}

export function useSingleStoneValidation() {
  const validateFormData = (formData: FormData): boolean => {
    return !!(
      formData.stockNumber && 
      formData.shape && 
      formData.carat && 
      formData.color && 
      formData.clarity && 
      formData.price
    );
  };

  return { validateFormData };
}
