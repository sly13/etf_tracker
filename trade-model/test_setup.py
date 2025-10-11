#!/usr/bin/env python3
"""
Скрипт для тестирования настройки проекта и проверки зависимостей.
"""

import sys
import importlib
from typing import List, Tuple


def check_python_version() -> bool:
    """Проверка версии Python."""
    version = sys.version_info
    if version.major == 3 and version.minor >= 11:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - требуется Python 3.11+")
        return False


def check_dependencies() -> Tuple[bool, List[str]]:
    """Проверка установленных зависимостей."""
    required_packages = [
        'pandas',
        'numpy', 
        'sklearn',
        'xgboost',
        'sqlalchemy',
        'psycopg2',
        'joblib',
        'matplotlib',
        'dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'sklearn':
                importlib.import_module('sklearn')
            elif package == 'dotenv':
                importlib.import_module('dotenv')
            else:
                importlib.import_module(package)
            print(f"✅ {package} - OK")
        except ImportError:
            print(f"❌ {package} - НЕ УСТАНОВЛЕН")
            missing_packages.append(package)
    
    return len(missing_packages) == 0, missing_packages


def check_project_structure() -> bool:
    """Проверка структуры проекта."""
    import os
    
    required_files = [
        'db.py',
        'train.py', 
        'predict.py',
        'requirements.txt',
        'env.example',
        'README.md'
    ]
    
    required_dirs = [
        'data',
        'models'
    ]
    
    all_good = True
    
    # Проверка файлов
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file} - OK")
        else:
            print(f"❌ {file} - НЕ НАЙДЕН")
            all_good = False
    
    # Проверка директорий
    for dir_name in required_dirs:
        if os.path.exists(dir_name) and os.path.isdir(dir_name):
            print(f"✅ {dir_name}/ - OK")
        else:
            print(f"❌ {dir_name}/ - НЕ НАЙДЕНА")
            all_good = False
    
    return all_good


def check_env_file() -> bool:
    """Проверка файла конфигурации."""
    import os
    
    if os.path.exists('.env'):
        print("✅ .env - OK")
        return True
    elif os.path.exists('env.example'):
        print("⚠️  .env - НЕ НАЙДЕН, но есть env.example")
        print("   Скопируйте env.example в .env и настройте параметры")
        return False
    else:
        print("❌ .env и env.example - НЕ НАЙДЕНЫ")
        return False


def main():
    """Основная функция тестирования."""
    print("🔍 ПРОВЕРКА НАСТРОЙКИ ПРОЕКТА")
    print("=" * 50)
    
    all_checks_passed = True
    
    # Проверка версии Python
    print("\n📋 Проверка версии Python:")
    if not check_python_version():
        all_checks_passed = False
    
    # Проверка зависимостей
    print("\n📦 Проверка зависимостей:")
    deps_ok, missing = check_dependencies()
    if not deps_ok:
        all_checks_passed = False
        print(f"\n⚠️  Для установки недостающих пакетов выполните:")
        print("   pip install -r requirements.txt")
    
    # Проверка структуры проекта
    print("\n📁 Проверка структуры проекта:")
    if not check_project_structure():
        all_checks_passed = False
    
    # Проверка конфигурации
    print("\n⚙️  Проверка конфигурации:")
    if not check_env_file():
        all_checks_passed = False
    
    # Итоговый результат
    print("\n" + "=" * 50)
    if all_checks_passed:
        print("🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО!")
        print("\nСледующие шаги:")
        print("1. Настройте .env файл с параметрами подключения к БД")
        print("2. Запустите: python train.py")
        print("3. Запустите: python predict.py")
    else:
        print("❌ ОБНАРУЖЕНЫ ПРОБЛЕМЫ")
        print("\nИсправьте указанные выше проблемы перед продолжением")
    
    print("=" * 50)


if __name__ == "__main__":
    main()
