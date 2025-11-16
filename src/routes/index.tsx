import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import PublicAuctionPage from '@/pages/PublicAuctionPage';
import AuctionPerformance from '@/pages/AuctionPerformance';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auction/:auctionId" element={<PublicAuctionPage />} />
        <Route path="/auction/:auctionId/performance" element={<AuctionPerformance />} />
      </Routes>
    </Router>
  );
}