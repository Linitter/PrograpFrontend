import { ApexOptions } from 'apexcharts';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { TableColumnsType } from 'antd';
import { Checkbox } from 'antd';
import './index.css';
import Table, { ColumnsType } from 'antd/es/table';
import { getObjectResource } from '../../../hooks/objectResourceService';

import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { getCovenants } from '../../../hooks/covenantsService';
import { getAuthor } from '../../../hooks/uthorService';
import { getCovenantAuthor } from '../../../hooks/covenantAuthor';
interface DataType {
  key: React.Key;
  id: string;
  grantorId: string;
  source: string;
  year: string;
  amendmentNumber: string;
  amendment: string;
  agreementNumber: string;
  processNumber: string;
  transferAmount: string;
  counterpartValue: string;
  globalValue: string;
  description: string;
  balance: string;
  covenantAuthor: any[];
  author: ExpandedDataTypeAuthor[];
  contributionValue: any;
  resourceObjects: ExpandedDataTypeObject[];
}
[];

interface DataTypeConvenantsAuthor {
  contributionValue: any;
  authors: ExpandedDataTypeAuthor[];
  convenats: DataType[];
}

// expensão da tabela de autor
interface ExpandedDataTypeAuthor {
  key: React.Key;
  id: string;
  name: string;
  description: string;
}

// expensão da tabela de objetos/recursos
interface ExpandedDataTypeObject {
  key: React.Key;
  id: string;
  objectsId: string;
  status: string;
  executedValue: string;
  deliveryDate: string;
}

export default function GraficoConvenants() {
  const [convenants, setConvenants] = useState<DataType[]>([]); //fundo a fundo
  const [objectResource, setObjectResource] = useState<any[]>([]); // obejtos/recusos
  const [author, setAuthor] = useState<any[]>([]); // obejtos/recusos
  const [convenantsAuthor, setCoventsAuthor] = useState<any[]>([]); // obejtos/recusos

  const [barChartData, setBarChartData] = useState<number[]>([0, 0]); // Initialize with zeros
  const [selectedAxes, setSelectedAxes] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<DataType[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedNatureExpense, setSelectedNatureExpense] = useState<string[]>(
    [],
  );

  let totalCount = 0; //para a % da table vertical

  //primeiro grafico em barra
  const barChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      width: 350,
    },

    plotOptions: {
      bar: {
        barHeight: '96%',
        distributed: true,
        horizontal: true,

        dataLabels: {
          position: 'bottom',
        },
      },
    },
    colors: ['#00152A', '#af8e44'],

    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#fff'],
      },
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val + '%';
      },
      offsetX: 0,
      dropShadow: {
        enabled: true,
      },
    },

    xaxis: {
      categories: ['Investimento', 'Custeio'],
    },
    yaxis: {
      max: 100, // Define o valor máximo do eixo y como 100
      labels: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      y: {
        title: {
          formatter: (seriesName: string) => 'Total do repasse', // Título personalizado
        },
        formatter: (val: number) => val.toFixed(2) + '%', // Formatação para porcentagem com 2 casas decimais
      },
    },
  };
  const getBarChartSeries = () => {
    return [
      {
        data: barChartData,
      },
    ];
  };

  useEffect(() => {
    if (objectResource.length > 0) {
      // Filtrar os objetos que têm o campo goal definido
      const convenantsObjects = objectResource.filter(
        obj => obj.covenants !== undefined && obj.covenants !== null,
      );
      // Filtrar os objetos relacionados ao fundo a fundo
      const investimentoCount = convenantsObjects.filter(
        obj => obj.natureExpense === 'Investimento',
      ).length;

      const custeioCount = convenantsObjects.filter(
        obj => obj.natureExpense === 'Custeio',
      ).length;

      const total = investimentoCount + custeioCount;
      const investimentoPercentage = parseFloat(
        ((investimentoCount / total) * 100).toFixed(2),
      );
      const custeioPercentage = parseFloat(
        ((custeioCount / total) * 100).toFixed(2),
      );
      setBarChartData([investimentoPercentage, custeioPercentage]);
    }
  }, [objectResource]);

  // grafico de pizza
  // criando cores aleatórias para o grafico
  const randomColors = [
    '#00152A',
    '#af8e44',
    '#077776',
    '#8B4513',
    '#4CAF50',
    '#A52A2A',
    '#763568',
    '#00BCD4',
  ];

  const somarValorTotal = (authorId: any) => {
    let soma = 0;

    const findAuthors = convenantsAuthor.filter(
      (item: any) => item.authors.id === authorId,
    );

    findAuthors.forEach((item: any) => {
      // Remova os pontos dos números antes de convertê-los
      const contributionValueWithoutDots = item.contributionValue.replace(
        /\./g,
        '',
      );
      const contributionValueAsNumber = parseFloat(
        contributionValueWithoutDots.replace(',', '.'),
      );
      if (!isNaN(contributionValueAsNumber)) {
        soma += contributionValueAsNumber;
      }
    });

    const formattedSum = soma.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

    return formattedSum;
  };

  const convenantsInfo: Record<
    string,
    {
      globalValue: number;
      globalValueTotal: number;
      count: number;
    }
  > = {};

  let totalGlobalValue = 0;
  let count = 0;

  const findConvenants = convenants.filter(
    (item: any) => item.globalValue && item.deleted_at === null,
  );

  findConvenants.forEach((item: any) => {
    const globalValue = item.globalValue.replace(/\./g, '').replace(',', '.');
    const globalValueAsNumber = parseFloat(globalValue);
    if (!isNaN(globalValueAsNumber)) {
      totalGlobalValue += globalValueAsNumber; // Increment the total
      count++;
      convenantsInfo[item.agreementNumber] = {
        count: 0,
        globalValueTotal: totalGlobalValue,
        globalValue: globalValueAsNumber, // Store the numeric value
      };
    }
  });

  const totalAmount = totalGlobalValue;

  const donutChartData = Object.values(convenantsInfo).map((info: any) => {
    const value = (info.globalValue / totalAmount) * 100;
    return {
      name: `${info.globalValue}`, // Nome ou rótulo do valor
      data: parseFloat(value.toFixed(1)), // Convertendo para número de uma casa decimal
    };
  });
  const formattedChartData: ApexNonAxisChartSeries = donutChartData.map(
    item => item.data,
  );
  // Criar rótulos personalizados para a legenda com os top 5 autores
  const legendLabels = Object.keys(convenantsInfo).map(agreementNumberFdd => {
    const { globalValue } = convenantsInfo[agreementNumberFdd];
    return `${agreementNumberFdd} - ${globalValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })}`;
  });

  // Configuração do gráfico de pizza com os top 5 autores
  const donutChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
    },
    legend: {
      position: 'right',
    },
    labels: legendLabels,
    colors: randomColors.slice(0, legendLabels.length),
    series: formattedChartData,
    tooltip: {
      enabled: true,
      y: {
        formatter: (value: number) => `${value.toFixed(1)}%`, // Adiciona o símbolo de porcentagem ao valor do tooltip
      },
    },
  };

  // grafico vertical
  //Defina os status que você deseja acompanhar
  const statusToTrack = ['Entregue', 'Concluído', 'Em execução'];

  // Crie um objeto para contar a quantidade de cada status
  const statusCounts: Record<string, number> = {};
  statusToTrack.forEach(status => {
    statusCounts[status] = 0;
  });

  // Calcule a contagem de cada status
  objectResource.forEach(obj => {
    if (obj.covenants) {
      // Verifique se o objeto possui um ID de convenants
      const status = obj.status;

      if (statusToTrack.includes(status)) {
        statusCounts[status]++;
        totalCount++;
      }
    }
  });
  // Crie as séries para o gráfico
  const seriesData = statusToTrack.map(status => ({
    name: status,
    data: [(statusCounts[status] / totalCount) * 100],
  }));

  const options: ApexOptions = {
    series: seriesData,
    chart: {
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        dataLabels: {
          position: 'top', // top, center, bottom
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        if (typeof val === 'number') {
          return val.toFixed(1) + '%';
        }
        return val.toString(); // Certifica-se de retornar uma string
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#000000'],
      },
    },

    xaxis: {
      categories: [''],
      position: 'top',
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        fill: {
          type: 'gradient',
          gradient: {
            colorFrom: '#D8E3F0',
            colorTo: '#BED1E6',
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
        formatter: function (val) {
          return val + '%';
        },
      },
    },

    legend: {
      show: true,
      position: 'right',
      offsetX: 0,
      offsetY: 50,
    },
    colors: ['#00152A', '#af8e44', '#077776'],
  };

  // TABELA de eixos com os itens somatoria
  const columnsConvenants: ColumnsType<DataType> = [
    {
      title: 'N° Convênio',
      dataIndex: 'agreementNumber',
      key: 'agreementNumber',
      width: '20%',
    },
    {
      title: 'Valor do repasse',
      dataIndex: 'transferAmount',
      key: 'transferAmount',
      width: '20%',
    },
    {
      title: 'Valor contrapartida',
      dataIndex: 'counterpartValue',
      key: 'counterpartValue',
      width: '20%',
    },

    {
      title: 'Valor global',
      dataIndex: 'globalValue',
      key: 'globalValue',
      width: '20%',
    },

    {
      title: 'Saldo',
      dataIndex: 'balance',
      key: 'balance',
      width: '20%',
    },
  ];

  // Função para calcular a soma de 'amount' referente aos obejtos por eixo
  const amountInfo: Record<string, number> = {}; // quantidade
  const estimatedTotalValueInfo: Record<string, number> = {}; // total estimado
  const executedValueInfo: Record<string, number> = {}; //valor executado

  convenants.forEach(convenants => {
    convenants.resourceObjects.forEach((objectResourceItem: any) => {
      const amount = parseFloat(objectResourceItem.amount);
      const estimatedTotalValue = parseFloat(
        objectResourceItem.estimatedTotalValue
          .replace(/[^\d,]/g, '')
          .replace(',', '.'),
      );
      const executedValue = parseFloat(
        objectResourceItem.executedValue
          .replace(/[^\d,]/g, '')
          .replace(',', '.'),
      );
      if (!isNaN(amount)) {
        const axleName = '';
        if (
          typeof convenants.author === 'object' &&
          convenants.author !== null
        ) {
          const axleData = author;
          const axleName = (axleData as { name?: string }).name;
        }
        // Use o nome do "eixo" ou outra chave de identificação para agrupar as somas
        if (axleName) {
          if (amountInfo[axleName]) {
            amountInfo[axleName] += amount;
          } else {
            amountInfo[axleName] = amount;
          }
          if (estimatedTotalValueInfo[axleName]) {
            estimatedTotalValueInfo[axleName] += estimatedTotalValue;
          } else {
            estimatedTotalValueInfo[axleName] = estimatedTotalValue;
          }
          if (executedValueInfo[axleName]) {
            executedValueInfo[axleName] += executedValue;
          } else {
            executedValueInfo[axleName] = executedValue;
          }
        }
      }
    });
  });
  // tabela de eixo
  const columns: ColumnsType<DataType> = [
    {
      title: 'N° Convênio',
      dataIndex: 'agreementNumber',
      key: 'agreementNumber',
      width: '85%',
    },
    {
      title: 'Ano',
      dataIndex: 'year',
      key: 'year',
      width: '20%',
    },
  ];

  const expandedRowRender = (record: any) => {
    const objectWithKeys = objectResource.map((objectResource, index) => ({
      ...objectResource,
      key: `objectResource_${index}`,
    }));

    // Filtra os objetos vinculados a uma meta
    const filterObjectResource = objectWithKeys.filter(object => {
      return (
        object.covenants?.id === record.id && // Apenas objetos vinculados à meta selecionada
        (selectedStatus.length === 0 ||
          selectedStatus.includes(object.status)) &&
        (selectedNatureExpense.length === 0 ||
          selectedNatureExpense.includes(object.natureExpense))
      );
    });
    //Objetos
    const columns: TableColumnsType<ExpandedDataTypeObject> = [
      {
        title: 'Objeto',
        dataIndex: 'objects',
        key: 'objects',
        width: '27%',
        render: objects => (objects ? objects?.name : ''),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: '10%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Natureza',
        dataIndex: 'natureExpense',
        key: 'natureExpense',
        width: '18%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Qtde',
        dataIndex: 'amount',
        key: 'amount',
        width: '1%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Valor unitário',
        dataIndex: 'unitaryValue',
        key: 'unitaryValue',
        width: '20%',
        render: (value: any) => value || '*********',
      },

      {
        title: 'Valor executado',
        dataIndex: 'executedValue',
        key: 'executedValue',
        width: '25%',
        render: (value: any) => value || '*********',
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={filterObjectResource}
        pagination={false}
      />
    );
  };
  {
    /* const expandedRowRenderObject = (record: any) => {
    const objectWithKeys = objectResource.map((objectResource, index) => ({
      ...objectResource,
      key: `objectResource_${index}`,
    }));

    // Filtra os objetos vinculados a uma meta
    const filterObjectResource = objectWithKeys.filter(object => {
      return (
        object.goal?.id === record.id && // Apenas objetos vinculados à meta selecionada
        (selectedStatus.length === 0 ||
          selectedStatus.includes(object.status)) &&
        (selectedNatureExpense.length === 0 ||
          selectedNatureExpense.includes(object.natureExpense))
      );
    });
    //Objetos
    const columns: TableColumnsType<ExpandedDataTypeObject> = [
      {
        title: 'Objeto',
        dataIndex: 'objects',
        key: 'objects',
        width: '27%',
        render: objects => (objects ? objects?.name : ''),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: '10%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Natureza',
        dataIndex: 'natureExpense',
        key: 'natureExpense',
        width: '18%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Qtde',
        dataIndex: 'amount',
        key: 'amount',
        width: '1%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Valor unitário',
        dataIndex: 'unitaryValue',
        key: 'unitaryValue',
        width: '20%',
        render: (value: any) => value || '*********',
      },

      {
        title: 'Valor executado',
        dataIndex: 'executedValue',
        key: 'executedValue',
        width: '25%',
        render: (value: any) => value || '*********',
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={filterObjectResource}
        pagination={false}
      />
    );
  };*/
  }

  // funções de listagem
  useEffect(() => {
    loadingConvenantsForm();
    loadingAuthorForm();
    loadingCoventsAuthorForm();
    loadingObjectResourceForm();
  }, []);

  async function loadingConvenantsForm() {
    const response = await getCovenants('covenants');
    if (response !== false) {
      setConvenants(response.data);
    }
  }

  async function loadingAuthorForm() {
    const response = await getAuthor('author');
    if (response !== false) {
      setAuthor(response.data);
    }
  }

  async function loadingCoventsAuthorForm() {
    const response = await getCovenantAuthor('covenantAuthor');
    if (response !== false) {
      setCoventsAuthor(response.data);
    }
  }

  async function loadingObjectResourceForm() {
    const response = await getObjectResource('resourceobjects');
    if (response !== false) {
      setObjectResource(response.data);
    }
  }
  //funções dos checkbox
  const handleAxisChange = (e: CheckboxChangeEvent, axis: string) => {
    const selected = e.target.checked;
    if (selected) {
      setSelectedAxes([...selectedAxes, axis]);
    } else {
      setSelectedAxes(selectedAxes.filter(item => item !== axis));
    }
  };

  const handleYearChange = (e: CheckboxChangeEvent, year: string) => {
    const selected = e.target.checked;
    if (selected) {
      setSelectedYears([...selectedYears, year]);
    } else {
      setSelectedYears(selectedYears.filter(item => item !== year));
    }
  };
  const handleStatusChange = (e: CheckboxChangeEvent, status: string) => {
    const selected = e.target.checked;
    if (selected) {
      setSelectedStatus([...selectedStatus, status]);
    } else {
      setSelectedStatus(selectedStatus.filter(item => item !== status));
    }
  };

  const handleNatureExpenseChange = (
    e: CheckboxChangeEvent,
    natureExpense: string,
  ) => {
    const selected = e.target.checked;
    console.log('natureExpense', natureExpense);
    console.log('selected', selected);
    if (selected) {
      setSelectedNatureExpense([...selectedNatureExpense, natureExpense]);
    } else {
      setSelectedNatureExpense(
        selectedNatureExpense.filter(item => item !== natureExpense),
      );
    }
  };

  //Parte doss filtros do checkbox
  useEffect(() => {
    author.forEach((item: any) => {
      somarValorTotal(item);
    });
  }, [author]);

  {
    /*function mapGoalsAndFilterResourceObjects(item: any) {
    console.log('i', item);
    const filteredGoals = item.map((item: any) => {
      const filteredResourceObjects = item?.resourceObjects.filter(
        (objectResourceItem: any) =>
          (selectedStatus.length === 0 ||
            selectedStatus.includes(objectResourceItem.status)) &&
          (selectedNatureExpense.length === 0 ||
            selectedNatureExpense.includes(objectResourceItem.natureExpense)),
      );
      console.log('a', filteredResourceObjects);

      return {
        ...item,
        resourceObjects: filteredResourceObjects,
      };
    });

    return {
      ...item,
      goal: filteredGoals,
      key: item.id,
    };
  }*/
  }
  return (
    <>
      <div className="vertical-divider">
        <h2 className="filter-title">FILTROS</h2>
        <div className="checkbox-type">
          <h3>Tipo</h3>
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleNatureExpenseChange(e, 'Bancada')}
            checked={selectedNatureExpense.includes('Bancada')}
          >
            Bancada
          </Checkbox>
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleNatureExpenseChange(e, 'Individual')}
            checked={selectedNatureExpense.includes('Individual')}
          >
            Individual
          </Checkbox>
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleNatureExpenseChange(e, 'Especial')}
            checked={selectedNatureExpense.includes('Especial')}
          >
            Especial
          </Checkbox>
        </div>

        <div className="checkbox-year">
          <h3>Ano</h3>
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleYearChange(e, '2019')}
            checked={selectedYears.includes('2019')}
          >
            2019
          </Checkbox>
          <br />
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleYearChange(e, '2020')}
            checked={selectedYears.includes('2020')}
          >
            2020
          </Checkbox>
          <br />
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleYearChange(e, '2021')}
            checked={selectedYears.includes('2021')}
          >
            2021
          </Checkbox>
          <br />
        </div>

        <div className="checkbox-axle">
          <h3>Eixo</h3>
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleAxisChange(e, 'EIXO I')}
            checked={selectedAxes.includes('EIXO I')}
          >
            EIXO I
          </Checkbox>
          <br />
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleAxisChange(e, 'EIXO IV')}
            checked={selectedAxes.includes('EIXO IV')}
          >
            EIXO IV
          </Checkbox>
        </div>
        <div className="checkbox-status">
          <h3>Status</h3>
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleStatusChange(e, 'Entregue')}
            checked={selectedStatus.includes('Entregue')}
          >
            Entregue
          </Checkbox>
          <br />
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleStatusChange(e, 'Concluído')}
            checked={selectedStatus.includes('Concluído')}
          >
            Concluído
          </Checkbox>
          <br />
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleStatusChange(e, 'Em execução')}
            checked={selectedStatus.includes('Em execução')}
          >
            Em execução
          </Checkbox>
        </div>
      </div>

      <div className="custom-donut-convenants">
        {/* grafico de pizza */}
        <h3>Valor FDD</h3>
        <div className="pass-value">
          <h4>Valor Total</h4>
          {/* Exibe o valor total com a formatação "R$ 54.654,00" */}
          <p className="total-value">
            {totalAmount.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
        </div>
        <ReactApexChart
          className="pie-chart"
          options={donutChartOptions}
          series={donutChartOptions.series}
          type="donut"
          id="donutChart" // Adicione um ID ao gráfico
        />
      </div>
      <div className="custom-bar-convenants">
        {/* grafico em barra horizontal */}
        <h3>Tipo de despesa</h3>
        <div className="total-expense-amount">
          <h4>Investimento</h4>
          <p className="invest-cust">{barChartData[0].toFixed(2)}%</p>
          <h4>Custeio</h4>
          <p className="invest-cust">{barChartData[1].toFixed(2)}%</p>
        </div>
        <ReactApexChart
          className="bar-chart"
          options={barChartOptions}
          series={getBarChartSeries()}
          type="bar"
          height={140}
        />
      </div>
      <div className="custom-bar-convenants-vertical">
        <h3 className="h3Etapa">Etapa</h3>
        {/* grafico em bar vertical */}
        <ReactApexChart
          options={options}
          series={options.series}
          type="bar"
          height={210}
        />
      </div>
      <div className="table-object-convenants">
        {/* tabela com expanção - eixos -> metas -> objetos */}
        <Table
          columns={columns}
          rowKey={record => record.id} // Utilize a chave única (record.id) como a chave da linha
          dataSource={convenants}
          expandable={{
            expandedRowRender,
            defaultExpandedRowKeys: convenants.map((record: any) => record.id), // Defina as chaves das linhas que devem ser expandidas por padrão
          }}
          rowClassName={() => 'custom-table-row'} // Defina o nome da classe para o estilo personalizado
          className="custom-table-dashboard"
          pagination={false}
        />
      </div>
      <div className="table-convenants">
        {/* tabelas de eixos com somatoria */}
        <Table
          columns={columnsConvenants}
          rowKey="name"
          dataSource={convenants} // Use os dados atualizados da tabela
          className="custom-table-dashboard"
          rowClassName={() => 'custom-table-row'} // Defina o nome da classe para o estilo personalizado
          pagination={false}
        />
      </div>
    </>
  );
}
