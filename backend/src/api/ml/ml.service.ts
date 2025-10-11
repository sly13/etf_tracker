import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class MLService {
  private readonly logger = new Logger(MLService.name);
  private readonly mlScriptPath = path.join(
    __dirname,
    '../../../../trade-model',
  );
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

      // Парсим вывод скрипта (упрощенная версия)
      const lines = stdout.split('\n');
      const prediction = {
        direction: 'Неизвестно',
        probability_up: 0.5,
        confidence: 0.5,
        last_price: 0,
        timestamp: new Date().toISOString(),
      };

      // Простой парсинг вывода
      for (const line of lines) {
        if (line.includes('Направление:')) {
          prediction.direction =
            line.split('Направление:')[1]?.trim() || 'Неизвестно';
        }
        if (line.includes('Вероятность роста:')) {
          const match = line.match(/(\d+\.?\d*)%/);
          if (match) {
            prediction.probability_up = parseFloat(match[1]) / 100;
          }
        }
        if (line.includes('Последняя цена:')) {
          const match = line.match(/\$([\d,]+\.?\d*)/);
          if (match) {
            prediction.last_price = parseFloat(match[1].replace(/,/g, ''));
          }
        }
      }

      prediction.confidence = Math.max(
        prediction.probability_up,
        1 - prediction.probability_up,
      );

      this.logger.log(
        `Предсказание получено: ${prediction.direction} (${(prediction.probability_up * 100).toFixed(1)}%)`,
      );

      return prediction;
    } catch (error) {
      this.logger.error(`Ошибка при получении предсказания: ${error.message}`);
      throw new Error(`Ошибка ML модели: ${error.message}`);
    }
  }

  async predictFromData(data: any): Promise<any> {
    try {
      this.logger.log('Предсказание на основе переданных данных...');

      // Создаем временный JSON файл с данными
      const tempFile = path.join(this.mlScriptPath, 'temp_data.json');

      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));

      // Запускаем скрипт с JSON данными
      const { stdout, stderr } = await execAsync(
        `"${this.pythonPath}" predict.py --json temp_data.json`,
        {
          cwd: this.mlScriptPath,
          timeout: 30000,
        },
      );

      // Удаляем временный файл
      fs.unlinkSync(tempFile);

      if (stderr) {
        this.logger.warn(`Предупреждения ML скрипта: ${stderr}`);
      }

      // Парсим результат аналогично getBitcoinPrediction
      const prediction = {
        direction: 'Неизвестно',
        probability_up: 0.5,
        confidence: 0.5,
        timestamp: new Date().toISOString(),
      };

      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes('Направление:')) {
          prediction.direction =
            line.split('Направление:')[1]?.trim() || 'Неизвестно';
        }
        if (line.includes('Вероятность роста:')) {
          const match = line.match(/(\d+\.?\d*)%/);
          if (match) {
            prediction.probability_up = parseFloat(match[1]) / 100;
          }
        }
      }

      prediction.confidence = Math.max(
        prediction.probability_up,
        1 - prediction.probability_up,
      );

      this.logger.log(
        `Предсказание на основе данных получено: ${prediction.direction}`,
      );

      return prediction;
    } catch (error) {
      this.logger.error(
        `Ошибка при предсказании на основе данных: ${error.message}`,
      );
      throw new Error(`Ошибка ML модели: ${error.message}`);
    }
  }

  async getModelInfo(): Promise<any> {
    try {
      this.logger.log('Получение информации о модели...');

      const { stdout, stderr } = await execAsync(
        `"${this.pythonPath}" -c "import joblib; import os; model_path='models/etf_model_v1.pkl'; print(f'Model exists: {os.path.exists(model_path)}'); print(f'Model size: {os.path.getsize(model_path) if os.path.exists(model_path) else 0} bytes')"`,
        {
          cwd: this.mlScriptPath,
          timeout: 10000,
        },
      );

      if (stderr) {
        this.logger.warn(`Предупреждения: ${stderr}`);
      }

      const info = {
        model_exists: stdout.includes('Model exists: True'),
        model_size: 0,
        last_trained: 'Unknown' as string,
        features_count: 25,
        model_type: 'XGBoost',
      };

      // Парсим размер модели
      const sizeMatch = stdout.match(/Model size: (\d+) bytes/);
      if (sizeMatch) {
        info.model_size = parseInt(sizeMatch[1]);
      }

      // Пытаемся получить дату обучения
      try {
        const { stdout: modelInfo } = await execAsync(
          `"${this.pythonPath}" -c "import joblib; import os; from datetime import datetime; model_path='models/etf_model_v1.pkl'; data = joblib.load(model_path) if os.path.exists(model_path) else {}; print(data.get('trained_at', 'Unknown'))"`,
          {
            cwd: this.mlScriptPath,
            timeout: 10000,
          },
        );
        info.last_trained = modelInfo.trim();
      } catch {
        info.last_trained = 'Unknown';
      }

      return info;
    } catch (error) {
      this.logger.error(
        `Ошибка при получении информации о модели: ${error.message}`,
      );
      throw new Error(`Ошибка получения информации о модели: ${error.message}`);
    }
  }
}
