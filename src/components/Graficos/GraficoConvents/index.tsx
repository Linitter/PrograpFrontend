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
    colors: ['#00152A', '#af8e44', '#373D3F'],

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
      categories: ['Bancada', 'Individual', 'Especial'],
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
    if (convenants.length > 0) {
      // Filtrar os objetos que têm o campo goal definido
      const convenantsObjects = convenants.filter(
        convenants =>
          convenants.resourceObjects !== undefined &&
          convenants.resourceObjects !== null,
      );
      // Filtrar os objetos relacionados ao fundo a fundo
      const bancadaCount = convenantsObjects.filter(
        convenants => convenants.amendment === 'Bancada',
      ).length;

      const individualCount = convenantsObjects.filter(
        convenants => convenants.amendment === 'Individual',
      ).length;

      const especialCount = convenantsObjects.filter(
        convenants => convenants.amendment === 'Especial',
      ).length;

      const total = bancadaCount + individualCount + especialCount;
      if (total !== 0) {
        const bancadaPercentage = parseFloat(
          ((bancadaCount / total) * 100).toFixed(2),
        );
        const individualPercentage = parseFloat(
          ((individualCount / total) * 100).toFixed(2),
        );

        const especialPercentage = parseFloat(
          ((especialCount / total) * 100).toFixed(2),
        );
        setBarChartData([
          bancadaPercentage,
          individualPercentage,
          especialPercentage,
        ]);
      }
    }
  }, [convenants]);

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

  // Contar a quantidade de cada tipo de eixo e calcular a soma dos valores
  const authorInfo: Record<
    string,
    { count: number; contributionValue: number; nameAuthor: string }
  > = {};

  let totalContributionValue = 0;

  author.forEach(author => {
    let soma = 0; // Initialize soma as a number

    const findAuthors = convenantsAuthor.filter(
      (item: any) => item.authors.id === author.id && item.deleted_at === null,
    );

    findAuthors.forEach((item: any) => {
      const contributionValueWithoutDots = item.contributionValue.replace(
        /\./g,
        '',
      );

      const contributionValueAsNumber = parseFloat(
        contributionValueWithoutDots.replace(',', '.'),
      );

      if (!isNaN(contributionValueAsNumber)) {
        soma += contributionValueAsNumber;
        totalContributionValue += contributionValueAsNumber; // Incrementar o total
      }
    });

    authorInfo[author.id] = {
      count: findAuthors.length,
      contributionValue: soma,
      nameAuthor: author.name,
    };
  });
  const sortedAuthors = Object.values(authorInfo).sort(
    (a, b) => b.contributionValue - a.contributionValue,
  );

  // Selecionar os 5 primeiros autores após a ordenação
  const top5Authors = sortedAuthors.slice(0, 5);

  // Criar rótulos personalizados para a legenda com os top 5 autores
  const legendLabels = top5Authors.map(author => {
    const { contributionValue, nameAuthor } = author;
    const percentage = (contributionValue / totalContributionValue) * 100;
    return `${nameAuthor} - R$ ${contributionValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })} (${percentage.toFixed(2)}%)`;
  });

  // Criar valores percentuais para o gráfico de pizza com os top 5 autores
  const seriesValues = top5Authors.map(
    author => (author.contributionValue / totalContributionValue) * 100,
  );

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
    series: seriesValues,
  };

  //calculando a soma dos valores  de todos os eixos
  const sumOfValues = convenantsAuthor.map(item => {
    // Remova todos os caracteres não numéricos
    const numericAmount = item.contributionValue.replace(/[^\d,]/g, '');

    // Substitua a vírgula por ponto (para parse correto como número)
    const cleanedAmount = numericAmount.replace(',', '.');

    // Converta para um número de ponto flutuante
    return parseFloat(cleanedAmount);
  });
  // Calcula o valor total
  const totalAmount = sumOfValues.reduce((total, amount) => total + amount, 0);

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
      }
    }
  });

  // Crie as séries para o gráfico
  const seriesData = statusToTrack.map(status => ({
    name: status,
    data: [statusCounts[status]],
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
        return val + '%';
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
      title: 'Autor',
      dataIndex: 'name',
      key: 'name',
      width: '75%',
    },
    {
      title: 'valor',
      dataIndex: 'id',
      key: 'id',
      width: '25%',
      render: (id: string) => somarValorTotal(id) || '', // Renderiza o valor total do autor
    },
  ];
  // LISTAGEM DE EIXOS
  // TABELA DE METAS
  const expandedRowRender = (record: any) => {
    //adicionar uma chave única para cada DESTINAÇÃO usando o índice
    const authorWithKeys = record.covenantAuthor.map(
      (convenantsAuthor: any, index: any) => ({
        ...convenantsAuthor,
        key: `convenantsAuthor_${index}`,
      }),
    );
    // filtra as metas vinculados com um fundo a fundo
    const filteredConvenant = authorWithKeys.filter(
      (convenantsAuthor: any) => convenantsAuthor?.authors?.id === record?.id,
    );

    // tabela do fundo a fundo
    const columns: TableColumnsType<any> = [
      {
        title: 'N° Convênio',
        dataIndex: 'covenants',
        key: 'covenants',
        width: '20%',
        render: (value: any) => {
          return value?.agreementNumber || 'N/A';
        },
      },
      {
        title: 'Emenda',
        dataIndex: 'covenants',
        key: 'covenants',
        width: '30%',
        render: (value: any) => {
          return value?.amendment || 'N/A';
        },
      },
      {
        title: 'Valor previsto',
        dataIndex: 'contributionValue',
        key: 'contributionValue',
        width: '30%',
        render: (value: any) => value || '*********',
      },
      {
        title: 'Ano',
        dataIndex: 'covenants',
        key: 'covenants',
        width: '25%',
        render: (value: any) => {
          return value?.year || 'N/A';
        },
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={filteredConvenant}
        pagination={false}
        rowClassName={() => 'custom-table-destiny'} // Defina o nome da classe para o estilo personalizado
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
        <h3>Valor do autor</h3>
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
        <h3>Tipo de emenda</h3>
        <div className="total-expense-amount-convenants">
          <h4>Bancada</h4>
          <p className="invest-cust-convenants">
            {barChartData[0].toFixed(2)}%
          </p>
          <h4>Individual</h4>
          <p className="invest-cust-convenants">
            {barChartData[1].toFixed(2)}%
          </p>
          <h4>Especial</h4>
          <p className="invest-cust-convenants">
            {barChartData[2] !== undefined
              ? `${barChartData[2].toFixed(2)}%`
              : 'N/A'}
          </p>
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
          dataSource={author}
          expandable={{
            expandedRowRender,
            defaultExpandedRowKeys: author.map(record => record.id), // Defina as chaves das linhas que devem ser expandidas por padrão
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
