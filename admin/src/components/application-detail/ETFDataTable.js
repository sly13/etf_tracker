import React from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

function ETFDataTable({ title, data, loading, columns }) {
	return (
		<Grid item xs={12}>
			<Card variant="outlined">
				<CardContent>
					<Typography variant="h6" gutterBottom>
						{title}
					</Typography>
					{loading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
							<CircularProgress />
						</Box>
					) : (
						<Box sx={{ height: 400, width: '100%' }}>
							<DataGrid
								rows={data}
								getRowId={(row) => row.date}
								columns={columns}
								paginationModel={{ page: 0, pageSize: 10 }}
								pageSizeOptions={[10, 25, 50]}
								autoSizeColumns={true}
								autoSizeColumnsOnMount={true}
								sx={{
									width: '100%',
									border: 'none',
									'& .MuiDataGrid-root': {
										border: 'none',
									},
									'& .MuiDataGrid-cell': {
										borderBottom: '1px solid',
										borderColor: 'divider',
									},
									'& .MuiDataGrid-columnHeaders': {
										borderBottom: '2px solid',
										borderColor: 'divider',
									},
									'& .MuiDataGrid-columnHeader': {
										fontWeight: 'bold',
									},
									'& .font-bold': {
										fontWeight: 'bold',
									},
								}}
							/>
						</Box>
					)}
				</CardContent>
			</Card>
		</Grid>
	);
}

export default ETFDataTable;
