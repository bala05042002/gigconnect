import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import GigListPage from './pages/GigListPage';
import CreateGigPage from './pages/CreateGigPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import GigDetailPage from './pages/GigDetailPage';
import MyGigsPage from './pages/MyGigsPage';
import MyFreelancerGigsPage from './pages/MyFreelancerGigsPage';
import FreelancerPage from './pages/FreelancerPage';
import DirectChatPage from './pages/DirectChatPage'; // NEW direct chat page
import NotificationPage from './pages/NotificationPage';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import AboutUs from './pages/AboutUs';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import FreelancerChat from './pages/FreelancerChat';
import ChattingList from './pages/ChattingList';
import ChatFromNav from './pages/ChatFromNav';

const App = () => {
  console.log(import.meta.env.VITE_PORT)
  const currentUserId = localStorage.getItem('userId'); // Or from your auth context

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <>
            <Route path="/register" element={<RegisterForm />} />
          </>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/gigs" element={<GigListPage />} />
          <Route path="/gigs/create" element={<CreateGigPage />} />
          <Route path="/gigs/:gigId" element={<GigDetailPage />} />
          <Route path="/profiles/:userId" element={<ProfilePage />} />
          <Route path="/profiles/edit" element={<EditProfilePage />} />
          <Route path="/mygigs" element={<MyGigsPage />} />
          <Route path="/my-freelancer-gigs" element={<MyFreelancerGigsPage />} />
          <Route path="/freelancers" element={<FreelancerPage currentUserId={currentUserId} />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help-center" element={<HelpCenter />} /> {/* New route */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} /> {/* New route */}
          <Route path="/terms-of-service" element={<TermsAndConditions />} /> {/* New route */}
          <Route path="/freelancerchat" element={<FreelancerChat />} /> {/* New route */}
          <Route path="/chattinglist" element={<ChattingList />} /> {/* New route */}
          <Route path="/chattinglist/chatfromnav" element={<ChatFromNav />} /> {/* New route */}
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
