import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../models/cefi_index.dart';
import '../services/etf_service.dart';
import '../utils/card_style_utils.dart';
import 'universal_cefi_index_card.dart';

class SingleCEFIIndexWidget extends StatefulWidget {
  final String indexType; // 'btc', 'eth', 'sol'
  final String title;
  final IconData icon;
  final Color iconColor;

  const SingleCEFIIndexWidget({
    super.key,
    required this.indexType,
    required this.title,
    required this.icon,
    required this.iconColor,
  });

  @override
  State<SingleCEFIIndexWidget> createState() => _SingleCEFIIndexWidgetState();
}

class _SingleCEFIIndexWidgetState extends State<SingleCEFIIndexWidget> {
  final ETFService _etfService = ETFService();
  CEFIIndexResponse? _data;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final allData = await _etfService.getAllCEFIIndices(limit: 30);
      CEFIIndexResponse? indexData;
      
      switch (widget.indexType) {
        case 'btc':
          indexData = allData.btc;
          break;
        case 'eth':
          indexData = allData.eth;
          break;
        case 'sol':
          indexData = allData.sol;
          break;
      }

      setState(() {
        _data = indexData;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Container(
        decoration: CardStyleUtils.getCardDecoration(context),
        padding: CardStyleUtils.getCardPadding(context),
        child: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_error != null) {
      return Container(
        decoration: CardStyleUtils.getCardDecoration(context),
        padding: CardStyleUtils.getCardPadding(context),
        child: Column(
          children: [
            Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              'cefi.error.loading'.tr(),
              style: TextStyle(
                color: Colors.red,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: _loadData,
              child: Text('common.retry'.tr()),
            ),
          ],
        ),
      );
    }

    if (_data == null) {
      return Container(
        decoration: CardStyleUtils.getCardDecoration(context),
        padding: CardStyleUtils.getCardPadding(context),
        child: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return UniversalCEFIIndexCard(
      indexData: _data!,
      title: widget.title,
      icon: widget.icon,
      iconColor: widget.iconColor,
      indexType: widget.indexType,
    );
  }
}

