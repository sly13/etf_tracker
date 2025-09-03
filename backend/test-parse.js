// Тест для проверки исправленной функции parseNumber

function parseNumber(text) {
  if (!text) return 0;

  try {
    // Удаляем все символы кроме цифр, точек, запятых, минусов и скобок
    const cleanText = text.replace(/[^\d.,\-()]/g, '');

    if (text.includes('(') && text.includes(')')) {
      // Для отрицательных чисел в скобках
      const numberText = cleanText.replace(/[()]/g, '');
      const number = parseFloat(numberText.replace(/,/g, ''));
      return isNaN(number) ? 0 : -number;
    }

    // Для положительных чисел
    // Заменяем все запятые на пустую строку (убираем разделители тысяч)
    // Оставляем точку как десятичный разделитель
    const numberText = cleanText.replace(/,/g, '');
    const number = parseFloat(numberText);
    return isNaN(number) ? 0 : number;
  } catch {
    return 0;
  }
}

// Тестовые случаи
const testCases = [
  '10.6',
  '4.4', 
  '2.5',
  '2.3',
  '10.2',
  '1.1',
  '2.7',
  '9,199.3*',
  '1,022.5*',
  '10,255',
  '(484.1)',
  '(326.9)',
  '(133.3)',
  '(346.2)',
  '(152.4)',
  '266.5',
  '71.3',
  '204.0',
  '7.5',
  '7.6',
  '5.5',
  '13.2',
  '15.1',
  '106.6'
];

console.log('Тестирование функции parseNumber:');
console.log('================================');

testCases.forEach(testCase => {
  const result = parseNumber(testCase);
  console.log(`"${testCase}" -> ${result}`);
});

console.log('\nПроверка типов данных:');
console.log('=====================');

// Проверяем, что все результаты являются числами
const allResults = testCases.map(testCase => parseNumber(testCase));
const allAreNumbers = allResults.every(result => typeof result === 'number' && !isNaN(result));
console.log(`Все результаты являются числами: ${allAreNumbers}`);

// Проверяем отрицательные числа
const negativeResults = testCases.filter(testCase => testCase.includes('(')).map(testCase => parseNumber(testCase));
console.log('Отрицательные числа:', negativeResults);

// Проверяем большие числа с запятыми
const largeNumbers = testCases.filter(testCase => testCase.includes(',')).map(testCase => parseNumber(testCase));
console.log('Большие числа с запятыми:', largeNumbers);

