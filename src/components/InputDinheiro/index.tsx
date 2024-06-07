import React from 'react';
import { Input } from 'antd';

type DataType = {
  props: any;
  value: string;
  handleMoeda: (moeda: string) => void;
  disabled?: boolean;
};

const InputDinheiro = ({ props, value, disabled, handleMoeda }: DataType) => {
  function moeda(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    const onlyNumbers = value.replace(/\D/g, '');

    if (onlyNumbers) {
      // Convert the string to a number and format it as a BRL currency
      const number = parseFloat(onlyNumbers) / 100;
      const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 2,
      }).format(number);

      return formattedValue;
    }

    return ''; // Return an empty string if the value is not valid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = moeda(e);
    handleMoeda(formattedValue);
  };

  const displayValue = value || ''; // Set displayValue as empty string if undefined

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      maxLength={25}
      disabled={disabled}
      style={disabled ? { color: '#aaa', backgroundColor: '#cdcdcd' } : {}}
    />
  );
};

export default InputDinheiro;
