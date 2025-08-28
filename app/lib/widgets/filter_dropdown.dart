import 'package:flutter/material.dart';

class FilterDropdown extends StatelessWidget {
  final List<String> assetClasses;
  final String selectedAssetClass;
  final Function(String?) onChanged;

  const FilterDropdown({
    super.key,
    required this.assetClasses,
    required this.selectedAssetClass,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selectedAssetClass.isEmpty ? null : selectedAssetClass,
          hint: const Text('Все классы активов'),
          isExpanded: true,
          icon: Icon(
            Icons.filter_list,
            color: Colors.grey[500],
          ),
          items: [
            const DropdownMenuItem<String>(
              value: '',
              child: Text('Все классы активов'),
            ),
            ...assetClasses.map((assetClass) {
              return DropdownMenuItem<String>(
                value: assetClass,
                child: Text(assetClass),
              );
            }).toList(),
          ],
          onChanged: onChanged,
          style: const TextStyle(fontSize: 16),
          dropdownColor: Colors.white,
        ),
      ),
    );
  }
}
