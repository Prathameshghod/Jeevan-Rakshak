// Dummy data for the application

export const SparklineAreaData = [
  { id: 1, yval: 2 },
  { id: 2, yval: 6 },
  { id: 3, yval: 8 },
  { id: 4, yval: 5 },
  { id: 5, yval: 10 },
];

export const EditorData = [
  {
    id: 1,
    name: 'Sample Content',
    content: 'This is sample content',
  },
];

export const financialChartData = [
  { x: new Date(2005, 0, 1), low: 21, high: 28, open: 27, close: 23 },
  { x: new Date(2005, 0, 2), low: 22, high: 29, open: 23, close: 25 },
  { x: new Date(2005, 0, 3), low: 23, high: 30, open: 25, close: 27 },
];

export const FinancialPrimaryXAxis = {
  valueType: 'DateTime',
  labelFormat: 'y',
  intervalType: 'Years',
  edgelabelPlacement: 'Shift',
};

export const FinancialPrimaryYAxis = {
  labelFormat: '{value}%',
  rangeType: 'Auto',
  majorGridLines: { width: 0 },
  background: 'white',
};

export const pieChartData = [
  { x: '2018', y: 18 },
  { x: '2019', y: 18 },
  { x: '2020', y: 18 },
  { x: '2021', y: 20 },
  { x: '2022', y: 14 },
];

export const PyramidData = [
  { x: '2018', y: 18, text: '35%' },
  { x: '2019', y: 18, text: '15%' },
  { x: '2020', y: 18, text: '30%' },
  { x: '2021', y: 20, text: '20%' },
];

export const ColorMappingData = [
  { x: 'USA', y: 46 },
  { x: 'GBR', y: 27 },
  { x: 'CHN', y: 26 },
];

export const ColorMappingPrimaryXAxis = {
  valueType: 'Category',
};

export const ColorMappingPrimaryYAxis = {
  minimum: 0,
  maximum: 100,
  interval: 20,
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
};

export const rangeColorMapping = [
  { from: 0, to: 35, color: '#FFEB3B' },
  { from: 35, to: 50, color: '#FFC107' },
  { from: 50, to: 100, color: '#FF5722' },
];

export const cartData = [
  { id: 1, name: 'Product 1', price: 100, quantity: 2 },
  { id: 2, name: 'Product 2', price: 200, quantity: 1 },
];

export const lineCustomSeries = [
  { dataSource: [{ x: 1, y: 21 }, { x: 2, y: 24 }], xName: 'x', yName: 'y' },
];

export const LinePrimaryXAxis = {
  valueType: 'Double',
};

export const LinePrimaryYAxis = {
  labelFormat: '{value}',
};

export const stackedCustomSeries = [
  { dataSource: [{ x: 1, y: 11, y1: 15 }, { x: 2, y: 24, y1: 28 }], xName: 'x', yName: 'y' },
];

export const stackedPrimaryXAxis = {
  valueType: 'Category',
};

export const stackedPrimaryYAxis = {
  labelFormat: '{value}',
};

export const chatData = [
  { id: 1, message: 'Hello', timestamp: new Date() },
  { id: 2, message: 'Hi there', timestamp: new Date() },
];

export const links = [
  { title: 'Dashboard', links: [{ name: 'default', icon: 'dashboard' }] },
  { title: 'Pages', links: [{ name: 'orders', icon: 'shopping_cart' }] },
];

export const themeColors = [
  { name: 'blue-theme', color: '#03C9A9' },
  { name: 'green-theme', color: '#26C485' },
  { name: 'purple-theme', color: '#9C27B0' },
  { name: 'red-theme', color: '#FF5252' },
  { name: 'orange-theme', color: '#FF9800' },
];

export const userProfileData = [
  { icon: 'email', title: 'Email', desc: 'user@example.com' },
  { icon: 'phone', title: 'Phone', desc: '+1234567890' },
];

export const areaCustomSeries = [
  { dataSource: [{ x: 1, y: 21 }, { x: 2, y: 24 }], xName: 'x', yName: 'y' },
];

export const areaPrimaryXAxis = {
  valueType: 'Double',
};

export const areaPrimaryYAxis = {
  labelFormat: '{value}',
};

export const barCustomSeries = [
  { dataSource: [{ x: '2005', y: 21 }, { x: '2006', y: 24 }], xName: 'x', yName: 'y' },
];

export const barPrimaryXAxis = {
  valueType: 'Category',
};

export const barPrimaryYAxis = {
  labelFormat: '{value}',
};

export const colorMappingData = [
  { x: 'USA', y: 46 },
  { x: 'GBR', y: 27 },
];

export const hiloData = [
  { x: new Date(2005, 0, 1), low: 21, high: 28, open: 27, close: 23 },
];

export const HiloPrimaryXAxis = {
  valueType: 'DateTime',
  labelFormat: 'y',
};

export const HiloPrimaryYAxis = {
  labelFormat: '{value}',
};
