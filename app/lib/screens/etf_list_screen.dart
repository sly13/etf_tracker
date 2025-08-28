import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/etf_provider.dart';
import '../models/etf.dart';
import '../widgets/etf_card.dart';
import '../widgets/search_bar.dart';
import '../widgets/filter_dropdown.dart';

class ETFListScreen extends StatefulWidget {
  const ETFListScreen({super.key});

  @override
  State<ETFListScreen> createState() => _ETFListScreenState();
}

class _ETFListScreenState extends State<ETFListScreen> {
  String _searchQuery = '';
  String _selectedAssetClass = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ETFProvider>().loadETFs();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ETF Портфель'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<ETFProvider>().loadETFs();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                ETFSearchBar(
                  onChanged: (query) {
                    setState(() {
                      _searchQuery = query;
                    });
                  },
                ),
                const SizedBox(height: 16),
                FilterDropdown(
                  assetClasses: context
                      .watch<ETFProvider>()
                      .getUniqueAssetClasses(),
                  selectedAssetClass: _selectedAssetClass,
                  onChanged: (assetClass) {
                    setState(() {
                      _selectedAssetClass = assetClass ?? '';
                    });
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: Consumer<ETFProvider>(
              builder: (context, etfProvider, child) {
                if (etfProvider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (etfProvider.error != null) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Ошибка: ${etfProvider.error}',
                          style: const TextStyle(color: Colors.red),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            etfProvider.clearError();
                            etfProvider.loadETFs();
                          },
                          child: const Text('Повторить'),
                        ),
                      ],
                    ),
                  );
                }

                List<ETF> filteredETFs = etfProvider.searchETFs(_searchQuery);
                if (_selectedAssetClass.isNotEmpty) {
                  filteredETFs = etfProvider.filterETFsByAssetClass(
                    _selectedAssetClass,
                  );
                }

                if (filteredETFs.isEmpty) {
                  return const Center(
                    child: Text(
                      'ETF не найдены',
                      style: TextStyle(fontSize: 18),
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => etfProvider.loadETFs(),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filteredETFs.length,
                    itemBuilder: (context, index) {
                      final etf = filteredETFs[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: ETFCard(
                          etf: etf,
                          onTap: () {
                            // Навигация к детальному экрану ETF
                            // Navigator.push(context, MaterialPageRoute(
                            //   builder: (context) => ETFDetailScreen(etf: etf),
                            // ));
                          },
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Навигация к экрану создания ETF
          // Navigator.push(context, MaterialPageRoute(
          //   builder: (context) => CreateETFScreen(),
          // ));
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
