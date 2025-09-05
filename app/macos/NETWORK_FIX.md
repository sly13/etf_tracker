# Исправление сетевых проблем в macOS приложении

## Проблема

Приложение не может подключиться к API `etf-flow.vadimsemenko.ru` из-за ограничений безопасности macOS.

## Решение

### 1. Добавлены разрешения в Info.plist

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>etf-flow.vadimsemenko.ru</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
            <key>NSExceptionRequiresForwardSecrecy</key>
            <true/>
        </dict>
    </dict>
</dict>
```

### 2. Добавлены разрешения в entitlements

В `DebugProfile.entitlements` и `Release.entitlements` добавлено:

```xml
<key>com.apple.security.network.client</key>
<true/>
```

### 3. Пересборка приложения

```bash
flutter build macos
```

## Следующие шаги

1. **Откройте проект в Xcode**: `open Runner.xcworkspace`
2. **Создайте Widget Extension Target**:
   - File → New → Target
   - Widget Extension (macOS)
   - Назовите `ETFTrackerMacWidget`
3. **Замените файлы** на наши из папки `ETFTrackerMacWidget/`
4. **Настройте Bundle Identifier** и Capabilities
5. **Соберите проект**

Подробная инструкция: [XCODE_INTEGRATION.md](XCODE_INTEGRATION.md)
