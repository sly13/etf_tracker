import React, { useState, useEffect } from 'react';
import {
	AppBar,
	Box,
	CssBaseline,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
	Typography,
	Button,
	Collapse,
	CircularProgress,
} from '@mui/material';
import {
	Menu as MenuIcon,
	Dashboard as DashboardIcon,
	Apps as AppsIcon,
	People as PeopleIcon,
	Logout as LogoutIcon,
	ExpandLess,
	ExpandMore,
	AppRegistration as AppIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import applicationsService from '../services/applicationsService';

const drawerWidth = 240;

function Layout({ children }) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [applicationsOpen, setApplicationsOpen] = useState(true);
	const [applications, setApplications] = useState([]);
	const [loadingApplications, setLoadingApplications] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { logout } = useAuth();

	useEffect(() => {
		fetchApplications();
	}, []);

	const fetchApplications = async () => {
		setLoadingApplications(true);
		try {
			const response = await applicationsService.getApplications();
			if (response.success) {
				setApplications(response.applications || []);
			}
		} catch (error) {
			console.error('Ошибка загрузки приложений:', error);
		} finally {
			setLoadingApplications(false);
		}
	};

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const handleApplicationsClick = () => {
		navigate('/applications');
	};

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const drawer = (
		<div>
			<Toolbar>
				<Typography variant="h6" noWrap component="div">
					ETF Admin
				</Typography>
			</Toolbar>
			<List>
				{/* Дашборд */}
				<ListItem disablePadding>
					<ListItemButton
						selected={location.pathname === '/'}
						onClick={() => navigate('/')}
					>
						<ListItemIcon><DashboardIcon /></ListItemIcon>
						<ListItemText primary="Дашборд" />
					</ListItemButton>
				</ListItem>

				{/* Приложения с подменю */}
				<ListItem disablePadding>
					<ListItemButton
						selected={location.pathname === '/applications'}
						onClick={handleApplicationsClick}
					>
						<ListItemIcon><AppsIcon /></ListItemIcon>
						<ListItemText primary="Приложения" />
					</ListItemButton>
				</ListItem>
				<Collapse in={applicationsOpen} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						{loadingApplications ? (
							<ListItem disablePadding>
								<Box sx={{ pl: 4, py: 1, display: 'flex', alignItems: 'center' }}>
									<CircularProgress size={16} sx={{ mr: 1 }} />
									<Typography variant="body2" color="text.secondary">
										Загрузка...
									</Typography>
								</Box>
							</ListItem>
						) : (
							applications.map((app) => (
								<ListItem key={app.id} disablePadding>
									<ListItemButton
										sx={{ pl: 4 }}
										selected={location.pathname === `/applications/${app.name}`}
										onClick={() => navigate(`/applications/${app.name}`)}
									>
										<ListItemIcon><AppIcon /></ListItemIcon>
										<ListItemText primary={app.displayName} />
									</ListItemButton>
								</ListItem>
							))
						)}
					</List>
				</Collapse>

				{/* Пользователи */}
				<ListItem disablePadding>
					<ListItemButton
						selected={location.pathname === '/users'}
						onClick={() => navigate('/users')}
					>
						<ListItemIcon><PeopleIcon /></ListItemIcon>
						<ListItemText primary="Пользователи" />
					</ListItemButton>
				</ListItem>
			</List>
		</div>
	);

	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />
			<AppBar
				position="fixed"
				sx={{
					width: { sm: `calc(100vw - ${drawerWidth}px)` },
					ml: { sm: `${drawerWidth}px` },
				}}
			>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						edge="start"
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { sm: 'none' } }}
					>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
						ETF Tracker Admin Panel
					</Typography>
					<Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
						Выйти
					</Button>
				</Toolbar>
			</AppBar>
			<Box
				component="nav"
				sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
				aria-label="mailbox folders"
			>
				<Drawer
					variant="temporary"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true,
					}}
					sx={{
						display: { xs: 'block', sm: 'none' },
						'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
					}}
				>
					{drawer}
				</Drawer>
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: 'none', sm: 'block' },
						'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
					}}
					open
				>
					{drawer}
				</Drawer>
			</Box>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					width: { sm: `calc(100vw - ${drawerWidth}px)` },
					maxWidth: 'none',
					overflow: 'hidden',
					minWidth: 0,
				}}
			>
				<Toolbar />
				{children}
			</Box>
		</Box>
	);
}

export default Layout;
