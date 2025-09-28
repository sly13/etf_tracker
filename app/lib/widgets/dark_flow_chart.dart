import 'package:flutter/material.dart';
import '../components/chart/index.dart';

class DarkFlowChart extends StatefulWidget {
  final List<dynamic> flowData;
  final String title;

  const DarkFlowChart({super.key, required this.flowData, required this.title});

  @override
  State<DarkFlowChart> createState() => _DarkFlowChartState();
}

class _DarkFlowChartState extends State<DarkFlowChart> {
  ChartPeriod _selectedPeriod = ChartPeriod.daily;
  List<dynamic> _filteredData = [];

  @override
  void initState() {
    super.initState();
    _filterData();
  }

  @override
  void didUpdateWidget(DarkFlowChart oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.flowData != widget.flowData) {
      _filterData();
    }
  }

  void _filterData() {
    setState(() {
      _filteredData = ChartDataService.filterDataByPeriod(
        widget.flowData,
        _selectedPeriod,
      );
    });
  }

  void _onPeriodChanged(ChartPeriod period) {
    setState(() {
      _selectedPeriod = period;
    });
    _filterData();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: ChartColors.background,
        borderRadius: BorderRadius.all(
          Radius.circular(ChartStyles.borderRadius),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ChartHeader(
            title: widget.title,
            selectedPeriod: _selectedPeriod,
            onPeriodChanged: _onPeriodChanged,
          ),
          KeyMetrics(
            filteredData: _filteredData,
            selectedPeriod: _selectedPeriod,
            allFlowData: widget.flowData,
          ),
          Expanded(
            child: FlowChart(
              filteredData: _filteredData,
              selectedPeriod: _selectedPeriod,
            ),
          ),
        ],
      ),
    );
  }
}
