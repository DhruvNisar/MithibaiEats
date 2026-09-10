import fs from 'fs';
import path from 'path';

const SRC_DIR = 'C:/Users/Zidane/.gemini/antigravity/scratch/mithibai-eats/client/src';

const mocks = {
  'pages/auth/Login.tsx': `export const Login = () => <div className="p-8">Login Page</div>;`,
  'pages/auth/Register.tsx': `export const Register = () => <div className="p-8">Register Page</div>;`,
  'pages/student/CanteenList.tsx': `export const CanteenList = () => <div className="p-8">Canteen List</div>;`,
  'pages/student/Home.tsx': `export const Home = () => <div className="p-8">Home Dashboard</div>;`,
  'pages/student/FoodDetail.tsx': `export const FoodDetail = () => <div className="p-8">Food Detail</div>;`,
  'pages/student/OrderHistory.tsx': `export const OrderHistory = () => <div className="p-8">Order History</div>;`,
  'pages/student/Profile.tsx': `export const Profile = () => <div className="p-8">User Profile</div>;`,
  'pages/student/Favorites.tsx': `export const Favorites = () => <div className="p-8">Favorites</div>;`,
  'pages/student/QRLanding.tsx': `export const QRLanding = () => <div className="p-8">QR Landing Page</div>;`,
  
  'pages/staff/StaffDashboard.tsx': `export const StaffDashboard = () => <div className="p-8">Staff KDS</div>;`,
  'pages/staff/StaffInventory.tsx': `export const StaffInventory = () => <div className="p-8">Staff Inventory</div>;`,
  
  'pages/admin/AdminDashboard.tsx': `export const AdminDashboard = () => <div className="p-8">Admin Dashboard</div>;`,
  'pages/admin/AdminOrders.tsx': `export const AdminOrders = () => <div className="p-8">Admin Orders</div>;`,
  'pages/admin/AdminFood.tsx': `export const AdminFood = () => <div className="p-8">Admin Food</div>;`,
  'pages/admin/AdminCanteens.tsx': `export const AdminCanteens = () => <div className="p-8">Admin Canteens</div>;`,
  'pages/admin/AdminUsers.tsx': `export const AdminUsers = () => <div className="p-8">Admin Users</div>;`,
  'pages/admin/AdminStaff.tsx': `export const AdminStaff = () => <div className="p-8">Admin Staff</div>;`,
  'pages/admin/AdminAnalytics.tsx': `export const AdminAnalytics = () => <div className="p-8">Admin Analytics</div>;`,
  'pages/admin/AdminInventory.tsx': `export const AdminInventory = () => <div className="p-8">Admin Inventory</div>;`,
  'pages/admin/AdminReviews.tsx': `export const AdminReviews = () => <div className="p-8">Admin Reviews</div>;`,
  'pages/admin/AdminQR.tsx': `export const AdminQR = () => <div className="p-8">Admin QR</div>;`,
  'pages/admin/AdminSettings.tsx': `export const AdminSettings = () => <div className="p-8">Admin Settings</div>;`,
  
  'layouts/StaffLayout.tsx': `import { Outlet } from 'react-router-dom'; export const StaffLayout = () => <div>Staff Layout <Outlet/></div>;`,
  'layouts/AdminLayout.tsx': `import { Outlet } from 'react-router-dom'; export const AdminLayout = () => <div>Admin Layout <Outlet/></div>;`,
};

Object.entries(mocks).forEach(([filepath, content]) => {
  fs.writeFileSync(path.join(SRC_DIR, filepath), 'import React from "react";\n' + content);
});
console.log('Mock files generated');
