// import { Grid, Paper, Typography, Box } from '@mui/material';
// import {
//   PeopleAlt as UsersIcon,
//   DirectionsCar as CarsIcon,
//   Assignment as BookingsIcon,
//   LocationOn as StationsIcon,
// } from '@mui/icons-material';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// // Fake data for demonstration
// const mockData = {
//   users: 1234,
//   vehicles: 89,
//   bookings: 456,
//   stations: 12,
//   chartData: [
//     { name: 'Jan', bookings: 65 },
//     { name: 'Feb', bookings: 59 },
//     { name: 'Mar', bookings: 80 },
//     { name: 'Apr', bookings: 81 },
//     { name: 'May', bookings: 56 },
//     { name: 'Jun', bookings: 55 },
//   ],
// };

// const StatCard = ({ title, value, icon: Icon, color }: any) => (
//   <Paper
//     elevation={0}
//     sx={{
//       p: 3,
//       borderRadius: 2,
//       bgcolor: 'white',
//       border: '1px solid',
//       borderColor: 'divider',
//     }}
//   >
//     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//       <Icon sx={{ color: color, mr: 1 }} />
//       <Typography variant="h6" color="text.secondary">
//         {title}
//       </Typography>
//     </Box>
//     <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
//       {value}
//     </Typography>
//   </Paper>
// );

// const AdminDashboard = () => {
//   return (
//     <Box>
//       <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
//         Dashboard
//       </Typography>

//       <Grid container spacing={3}>
//         {/* Stats Cards */}
//         <Grid item xs={12} sm={6} md={3}>
//           <StatCard
//             title="Total Users"
//             value={mockData.users}
//             icon={UsersIcon}
//             color="primary.main"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <StatCard
//             title="Total Vehicles"
//             value={mockData.vehicles}
//             icon={CarsIcon}
//             color="success.main"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <StatCard
//             title="Total Bookings"
//             value={mockData.bookings}
//             icon={BookingsIcon}
//             color="warning.main"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <StatCard
//             title="Total Stations"
//             value={mockData.stations}
//             icon={StationsIcon}
//             color="error.main"
//           />
//         </Grid>

//         {/* Charts */}
//         <Grid item xs={12}>
//           <Paper
//             elevation={0}
//             sx={{
//               p: 3,
//               borderRadius: 2,
//               bgcolor: 'white',
//               border: '1px solid',
//               borderColor: 'divider',
//             }}
//           >
//             <Typography variant="h6" sx={{ mb: 3 }}>
//               Monthly Bookings
//             </Typography>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={mockData.chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="bookings" fill="#10B981" />
//               </BarChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default AdminDashboard;