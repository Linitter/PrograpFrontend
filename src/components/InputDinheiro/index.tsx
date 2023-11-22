import React from 'react';
import { Input } from 'antd';

type DataType = {
  props: any;
  value: string;
  handleMoeda: (moeda: string) => void;
};

const CurrencyInput = ({ props, value, handleMoeda }: DataType) => {
  function moeda(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    const onlyNumbers = value.replace(/\D/g, '');

    // Verifica se o valor é um número válido antes de formatar
    if (!isNaN(parseFloat(onlyNumbers))) {
      // Format the currency (assuming BRL)
      const number = parseFloat(onlyNumbers) / 100;
      const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 2,
      }).format(number);

      return `${formattedValue}`;
    }

    return ''; // Retorna uma string vazia se o valor não for um número válido
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = moeda(e);
    handleMoeda(formattedValue);
  };

  const displayValue = value || ''; // Definindo o displayValue como string vazia se for undefined

  return (
    <Input
      {...props}
      value={`R$ ${displayValue}`}
      onChange={handleChange}
      maxLength={25}
    />
  );
};

export default CurrencyInput;
