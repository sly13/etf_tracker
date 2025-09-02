class User {
  final String id;
  final String? name;
  final String? email;
  final String? appleId;
  final Subscription? subscription;
  final UserPreferences? preferences;
  final DateTime createdAt;
  final DateTime lastLoginAt;

  User({
    required this.id,
    this.name,
    this.email,
    this.appleId,
    this.subscription,
    this.preferences,
    required this.createdAt,
    required this.lastLoginAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'],
      email: json['email'],
      appleId: json['appleId'],
      subscription: json['subscription'] != null
          ? Subscription.fromJson(json['subscription'])
          : null,
      preferences: json['preferences'] != null
          ? UserPreferences.fromJson(json['preferences'])
          : null,
      createdAt: DateTime.parse(
        json['createdAt'] ?? DateTime.now().toIso8601String(),
      ),
      lastLoginAt: DateTime.parse(
        json['lastLoginAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'appleId': appleId,
      'subscription': subscription?.toJson(),
      'preferences': preferences?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'lastLoginAt': lastLoginAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? appleId,
    Subscription? subscription,
    UserPreferences? preferences,
    DateTime? createdAt,
    DateTime? lastLoginAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      appleId: appleId ?? this.appleId,
      subscription: subscription ?? this.subscription,
      preferences: preferences ?? this.preferences,
      createdAt: createdAt ?? this.createdAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
    );
  }
}

class Subscription {
  final String plan; // 'free', 'basic', 'premium'
  final DateTime? expiresAt;
  final bool autoRenew;

  Subscription({required this.plan, this.expiresAt, this.autoRenew = false});

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      plan: json['plan'] ?? 'free',
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'])
          : null,
      autoRenew: json['autoRenew'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'plan': plan,
      'expiresAt': expiresAt?.toIso8601String(),
      'autoRenew': autoRenew,
    };
  }

  bool get isActive {
    if (plan == 'free') return true;
    if (expiresAt == null) return false;
    return DateTime.now().isBefore(expiresAt!);
  }
}

class UserPreferences {
  final bool notifications;
  final String theme;
  final List<String> favoriteETFs;

  UserPreferences({
    this.notifications = true,
    this.theme = 'system',
    this.favoriteETFs = const [],
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      notifications: json['notifications'] ?? true,
      theme: json['theme'] ?? 'system',
      favoriteETFs: List<String>.from(json['favoriteETFs'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notifications': notifications,
      'theme': theme,
      'favoriteETFs': favoriteETFs,
    };
  }
}
