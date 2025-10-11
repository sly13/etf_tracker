import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class MLService {
  private readonly logger = new Logger(MLService.name);
  private readonly mlScriptPath = path.join(__dirname, '../../../trade-model');
  private readonly pythonPath = path.join(
    this.mlScriptPath,
    'venv',
    'bin',
    'python',
  );

  async getBitcoinPrediction(): Promise<any> {
    try {
      this.logger.log('Запуск предсказания Биткоина...');

      const { stdout, stderr } = await execAsync(
        `"${this.pythonPath}" predict.py`,
        {
          cwd: this.mlScriptPath,
          timeout: 30000, // 30 секунд таймаут
        },
      );

      if (stderr) {
        this.logger.warn(`Предупреждения ML скрипта: ${stderr}`);
      }

      // Парсим вывод скрипта
      const lines = stdout.split('\n');
      let prediction = '';
      let confidence = '';
      let price = '';
      let direction = '';

      for (const line of lines) {
        if (line.includes('Направление:')) {
          direction = line.split(':')[1]?.trim() || '';
        }
        if (line.includes('Уверенность:')) {
          confidence = line.split(':')[1]?.trim() || '';
        }
        if (line.includes('Последняя цена:')) {
          price = line.split('$')[1]?.trim() || '';
        }
      }

      // Ищем JSON файл с результатами (только от predict.py, не demo)
      const jsonFiles = fs
        .readdirSync(this.mlScriptPath)
        .filter(
          (file) =>
            file.startsWith('prediction_') &&
            file.endsWith('.json') &&
            !file.includes('demo'),
        )
        .sort()
        .reverse();

      let jsonData = null;
      if (jsonFiles.length > 0) {
        try {
          const jsonPath = path.join(this.mlScriptPath, jsonFiles[0]);
          const jsonContent = fs.readFileSync(jsonPath, 'utf8');
          jsonData = JSON.parse(jsonContent);
        } catch (error) {
          this.logger.warn('Не удалось прочитать JSON файл:', error);
        }
      }

      return {
        success: true,
        prediction: direction,
        confidence: confidence,
        price: price,
        timestamp: new Date().toISOString(),
        data: jsonData,
      };
    } catch (error) {
      this.logger.error('Ошибка при получении предсказания:', error);
      return {
        success: false,
        error: `Ошибка ML модели: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
