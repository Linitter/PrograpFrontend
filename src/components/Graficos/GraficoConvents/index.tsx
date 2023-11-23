import { ApexOptions } from 'apexcharts';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { TableColumnsType } from 'antd';
import { Checkbox } from 'antd';
import './index.css';
import Table, { ColumnsType } from 'antd/es/table';
import { getObjectResource } from '../../../hooks/objectResourceService';
import { getGoals } from '../../../hooks/goalService';
import { getBottomToBottom } from '../../../hooks/bottomToBottom';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

interface DataType {
  key: React.Key;
  id: string;
  grantorId: string;
  source: string;
  year: string;
  amendmentNumber: string;
  agreementNumber: string;
  processNumber: string;
  transferAmount: string;
  counterpartValue: string;
  globalValue: string;
  description: string;
  balance: string;
  covenantAuthor: any[];
}
[];

// expensão da tabela de objetos/recursos
interface ExpandedDataTypeObject {
  key: React.Key;
  id: string;
  objectsId: string;
  status: string;
  executedValue: string;
  deliveryDate: string;
}

export default function GraficoConvents() {
  const [convents, setConvents] = useState<DataType[]>([]); //fundo a fundo
  const [objectResource, setObjectResource] = useState<any[]>([]); // obejtos/recusos

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
      const fundoAFundoObjects = objectResource.filter(
        obj => obj.goal !== undefined && obj.goal !== null,
      );
      // Filtrar os objetos relacionados ao fundo a fundo
      const investimentoCount = fundoAFundoObjects.filter(
        obj => obj.natureExpense === 'Investimento',
      ).length;

      const custeioCount = fundoAFundoObjects.filter(
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

  //Defina os status que você deseja acompanhar
  const statusToTrack = ['Entregue', 'Concluído', 'Em execução'];

  // Crie um objeto para contar a quantidade de cada status
  const statusCounts: Record<string, number> = {};
  statusToTrack.forEach(status => {
    statusCounts[status] = 0;
  });

  // Calcule a contagem de cada status
  objectResource.forEach(obj => {
    if (obj.goal) {
      // Verifique se o objeto possui um ID de goal
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

  // tabela de eixo
  const columns: ColumnsType<DataType> = [
    {
      title: 'Eixo',
      dataIndex: 'axle',
      key: 'axle',
      width: '85%',
      render: axle => (axle ? `${axle.name} - ${axle.description}` : '*******'),
    },
    {
      title: 'Ano',
      dataIndex: 'year',
      key: 'year',
      width: '20%',
    },
  ];

  const expandedRowRenderObject = (record: any) => {
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
  };

  // funções de listagem
  useEffect(() => {
    loadingbottomToBottomForm();
    loadingGoalForm();
    loadingObjectResourceForm();
  }, []);

  async function loadingbottomToBottomForm() {
    const response = await getBottomToBottom('bottomToBottom');
    if (response !== false) {
      setConvents(response.data);
    }
  }

  async function loadingGoalForm() {
    const response = await getGoals('goals');
    if (response !== false) {
      //      setGoal(response.data);
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
    const filteredTableData = convents
      .filter(filterBySelectedYearsAndAxes)
      .map(item => mapGoalsAndFilterResourceObjects(item))
      .filter(item => item.goal.length > 0);
    setFilteredData(filteredTableData);
  }, [
    convents,
    selectedAxes,
    selectedYears,
    selectedStatus,
    selectedNatureExpense,
  ]);

  function filterBySelectedYearsAndAxes(item: any) {
    const isYearSelected =
      selectedYears.length === 0 ||
      selectedYears.includes(item.year?.toString());
    const isAxisSelected =
      selectedAxes.length === 0 || selectedAxes.includes(item.axle?.name);

    const hasSelectedStatus =
      selectedStatus.length === 0 ||
      item.goal.some((goalItem: any) => {
        const resourceObjects = goalItem.resourceObjects;
        return resourceObjects.some((objectResourceItem: any) =>
          selectedStatus.includes(objectResourceItem.status),
        );
      });

    // Adicione a verificação para a propriedade natureExpense
    const hasSelectedNatureExpense =
      selectedNatureExpense.length === 0 ||
      item.goal.some((goalItem: any) => {
        const resourceObjects = goalItem.resourceObjects;
        return resourceObjects.some((objectResourceItem: any) =>
          selectedNatureExpense.includes(objectResourceItem.natureExpense),
        );
      });

    return (
      isAxisSelected &&
      isYearSelected &&
      hasSelectedStatus &&
      hasSelectedNatureExpense
    );
  }
  function mapGoalsAndFilterResourceObjects(item: any) {
    const filteredGoals = item.goal?.map((goalItem: any) => {
      const filteredResourceObjects = goalItem?.resourceObjects.filter(
        (objectResourceItem: any) =>
          (selectedStatus.length === 0 ||
            selectedStatus.includes(objectResourceItem.status)) &&
          (selectedNatureExpense.length === 0 ||
            selectedNatureExpense.includes(objectResourceItem.natureExpense)),
      );

      return {
        ...goalItem,
        resourceObjects: filteredResourceObjects,
      };
    });

    return {
      ...item,
      goal: filteredGoals,
      key: item.id,
    };
  }
  return (
    <>
      <div className="vertical-divider">
        <h2 className="filter-title">FILTROS</h2>
        <div className="checkbox-type">
          <h3>Tipo</h3>
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleNatureExpenseChange(e, 'Investimento')}
            checked={selectedNatureExpense.includes('Investimento')}
          >
            Investimento
          </Checkbox>
          <br />
          <Checkbox
            className="checkboxBottom"
            onChange={e => handleNatureExpenseChange(e, 'Custeio')}
            checked={selectedNatureExpense.includes('Custeio')}
          >
            Custeio
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

      <div className="custom-bar">
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
      <div className="custom-bar-vertical">
        <h3 className="h3Etapa">Etapa</h3>
        {/* grafico em bar vertical */}
        <ReactApexChart
          options={options}
          series={options.series}
          type="bar"
          height={210}
        />
      </div>
      <div className="table-object">
        {/* tabela com expanção - eixos -> metas -> objetos */}
        <Table
          columns={columns}
          rowKey="key"
          dataSource={filteredData}
          expandable={{
            defaultExpandedRowKeys: ['0'],
          }}
          rowClassName={() => 'custom-table-row'} // Defina o nome da classe para o estilo personalizado
          className="custom-table-dashboard"
          pagination={false}
        />
      </div>
    </>
  );
}
