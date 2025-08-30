import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { io } from 'socket.io-client';
import ReviewForm from '../components/ReviewForm';

let socket;

const GigDetailPage = () => {
    const { gigId } = useParams();
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const messagesContainerRef = useRef(null); // <-- scrollable container

    const [gig, setGig] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [bids, setBids] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [bidFormData, setBidFormData] = useState({ proposal: '', price: '' });
    const [showBidForm, setShowBidForm] = useState(false);
    const [acceptedBid, setAcceptedBid] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isCancelling, setIsCancelling] = useState(false);

    console.log(gig);

    // Scroll to bottom whenever messages update
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!user) {
            const storedUser = JSON.parse(localStorage.getItem('userInfo'));
            if (storedUser) {
                setUser(storedUser);
            } else {
                navigate('/login');
            }
        }
    }, [user, setUser, navigate]);

    useEffect(() => {
        if (!user) return;

        const fetchAllGigData = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const gigRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}`, config);
                const fetchedGig = gigRes.data;
                setGig(fetchedGig);
                setAcceptedBid(fetchedGig.acceptedBid);

                const messagesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${gigId}`, config);
                setMessages(messagesRes.data || []);

                if (user.role === 'client') {
                    const bidsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/bids/${gigId}`, config);
                    setBids(bidsRes.data || []);
                } else if (user.role === 'freelancer') {
                    const myBidsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/bids/mybids`, config);
                    setMyBids(myBidsRes.data || []);
                }

                const reviewsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/gig/${gigId}`);
                setReviews(reviewsRes.data || []);

            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to fetch gig details.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllGigData();
    }, [gigId, user, navigate]);

    useEffect(() => {
        if (gig) {
            socket = io(`${import.meta.env.VITE_API_URL}`);
            socket.emit('join_gig_room', gigId);
            socket.on('receive_message', (message) => {
                setMessages((prev) => {
                    if (!prev.some(msg => msg._id === message._id)) return [...prev, message];
                    return prev;
                });
            });
            return () => socket.disconnect();
        }
    }, [gig, gigId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !gig) return;

        const receiverId = gig.user?._id === user?._id ? acceptedBid?.user?._id : gig.user?._id;
        if (!receiverId) return toast.error('Cannot send message: no valid receiver found.');

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, { receiverId, gigId, content: newMessage }, config);
            socket.emit('send_message', data);
            setNewMessage('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send message.');
        }
    };

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        if (!bidFormData.proposal.trim() || !bidFormData.price) return toast.error('Fill both proposal and price');

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/bids`, { gigId, proposal: bidFormData.proposal, price: Number(bidFormData.price) }, config);
            toast.success('Your application has been submitted!');
            setShowBidForm(false);

            setMyBids((prev) => [...prev, data]);

            if (user.role === 'client') {
                const { data: bidsData } = await axios.get(`${import.meta.env.VITE_API_URL}/api/bids/${gigId}`, config);
                setBids(bidsData || []);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit bid.');
        }
    };

    const handleAcceptBid = async (bidId) => {
        if (!window.confirm('Accept this bid?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/bids/${bidId}/accept`, {}, config);
            toast.success('Bid accepted! Gig is now in-progress.');
            setGig(prev => ({ ...prev, status: data.gigStatus }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept bid.');
        }
    };

    const handleFreelancerFinish = async () => {
        if (!window.confirm('Mark gig as finished? The client will be notified to pay.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}/freelancer-finish`, {}, config);
            toast.success('Gig marked as finished. Awaiting client payment!');
            setGig(prev => ({ ...prev, status: 'awaiting_payment' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to mark gig as finished.');
        }
    };

    // ✅ Razorpay Payment
    const handleClientPay = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: { order, key } } = await axios.post(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}/create-order`, {}, config);

            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: "Gig Platform",
                description: gig?.title,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        const verifyConfig = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } };
                        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }, verifyConfig);

                        toast.success(data.message || "Payment successful");
                        setGig(prev => ({ ...prev, status: 'completed', paymentStatus: 'paid' }));
                    } catch (err) {
                        toast.error(err.response?.data?.message || 'Payment verification failed.');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: "#31363F",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initiate payment.');
        }
    };

    const handleDeleteGig = async () => {
        if (!window.confirm('Are you sure you want to delete this gig?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}`, config);
            toast.success('Gig has been deleted.');
            navigate('/gigs');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete gig.');
        }
    };

    const handleCancelRequest = async () => {
        if (!window.confirm('Are you sure you want to request a cancellation?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}/cancel-request`, {}, config);
            toast.success('Cancellation request sent.');
            setGig(prev => ({ ...prev, status: 'cancellation_pending' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send cancellation request.');
        }
    };

    const handleApproveCancel = async () => {
        if (!window.confirm('Approve cancellation?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}/approve-cancel`, {}, config);
            toast.success('Cancellation approved.');
            setGig(prev => ({ ...prev, status: 'cancelled' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve cancellation.');
        }
    };

    const handleRejectCancel = async () => {
        if (!window.confirm('Reject cancellation request?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}/reject-cancel`, {}, config);
            toast.success('Cancellation rejected.');
            setGig(prev => ({ ...prev, status: 'in-progress' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject cancellation.');
        }
    };

    const handleReviewAdded = (newReview) => {
        setReviews((prev) => [...prev, newReview]);
    };

    const hasApplied = myBids.some(bid => bid.gig?._id === gigId);
    const isGigOpen = gig && gig.status === 'open';
    const isGigOwner = gig && user && gig.user?._id === user._id;
    const isAcceptedFreelancer = acceptedBid && user && acceptedBid.user?._id === user._id;
    const isChatVisible = (user && acceptedBid && (user._id === gig?.user?._id || user._id === acceptedBid.user?._id)) || (user?.role === 'freelancer' && hasApplied);
    const isAuthorizedToView = isGigOpen || isGigOwner || isAcceptedFreelancer || (user && user.role === 'freelancer' && hasApplied);
    const isGigCompleted = gig && gig.status === 'completed';
    const existingReview = reviews.find(r => r.user?._id?.toString() === user?._id?.toString());
    const reviewedUserId = isGigOwner ? acceptedBid?.user?._id : gig?.user?._id;

    if (loading || !user) 
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center text-xl animate-pulse">Loading gig details...</div>
            </div>
    );
    if (!isAuthorizedToView) return <div className="text-center mt-8 text-red-500">Gig not found or not authorized</div>;

    return (
        <div className="relative min-h-screen bg-gray-900 text-white p-4 md:p-8 overflow-hidden">
            <div className="floating-light light1"></div>
            <div className="floating-light light2"></div>
            <div className="floating-light light3"></div>

            {/* Gig Info */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2 text-indigo-400">{gig?.title}</h1>
                <p className="text-gray-300 text-lg mb-4">{gig?.description}</p>
                <div className="space-y-2 text-gray-200">
                    <p>Price: <span className="text-green-600 font-semibold">₹{gig?.price}</span></p>
                    <p>Category: <span className="text-indigo-600 font-semibold">{gig?.category}</span></p>
                    <p>Posted By: <Link to={`/profiles/${gig?.user?._id}`} className="text-indigo-600 hover:underline">{gig?.user?.name}</Link></p>
                    <p>Posted On: {new Date(gig.createdAt).toLocaleString()}</p>
                    <p>Status: <span className={`font-medium ${gig?.status === 'open' ? 'text-green-400' : 'text-yellow-400'}`}>{gig?.status}</span></p>
                    {isGigOwner && gig?.status === 'awaiting_payment' && (
                        <p className="text-yellow-500 font-semibold">Payment Status: Awaiting client payment</p>
                    )}
                    {isGigOwner && gig?.status === 'completed' && gig?.paymentStatus === 'paid' && (
                        <p className="text-green-500 font-semibold">Payment Status: Paid</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-4">
                    {user?.role === 'freelancer' && !isGigOwner && isGigOpen && !hasApplied && (
                        <button onClick={() => setShowBidForm(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Apply for this Gig</button>
                    )}
                    {hasApplied && (
                        <p className="text-gray-500 font-medium">You have already applied for this gig.</p>
                    )}
                    {isGigOwner && isGigOpen && (
                        <button onClick={handleDeleteGig} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete Gig</button>
                    )}
                    {isAcceptedFreelancer && gig?.status === 'in-progress' && (
                        <button onClick={handleFreelancerFinish} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Finish Job</button>
                    )}
                    {isGigOwner && gig?.status === 'awaiting_payment' && (
                        <button onClick={handleClientPay} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Pay Amount</button>
                    )}
                    {isGigOwner && gig?.status === 'in-progress' && (
                        <button onClick={handleCancelRequest} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Request Cancellation</button>
                    )}
                    {isAcceptedFreelancer && gig?.status === 'cancellation_pending' && (
                        <>
                            <button onClick={handleApproveCancel} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Approve Cancellation</button>
                            <button onClick={handleRejectCancel} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Reject Cancellation</button>
                        </>
                    )}
                </div>
            </div>

            {/* Bid Form */}
            {showBidForm && !hasApplied && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-6 max-w-4xl mx-auto mt-8">
                    <h2 className="text-2xl font-bold mb-4">Submit Your Application</h2>
                    <form onSubmit={handleBidSubmit} className="space-y-4">
                        <textarea value={bidFormData.proposal} onChange={(e) => setBidFormData({ ...bidFormData, proposal: e.target.value })} rows="4" placeholder="Your proposal..." className="w-full px-4 py-2 border rounded-md" />
                        <input type="number" value={bidFormData.price} onChange={(e) => setBidFormData({ ...bidFormData, price: e.target.value })} placeholder="Your price" className="w-full px-4 py-2 border rounded-md" />
                        <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Submit Application</button>
                    </form>
                </div>
            )}

            {/* Applications (for client) */}
            {isGigOwner && (
            <div className="bg-black/70 backdrop-blur-md rounded-xl shadow-md p-6 mt-8 max-w-4xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Applications ({bids.length})</h2>
                {bids.length ? (
                <div className="space-y-4">
                    {bids.map(bid => (
                    <div
                        key={bid._id}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                    >
                        <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                            <Link
                            to={`/profiles/${bid.user?._id}`}
                            className="hover:underline text-indigo-400"
                            >
                            {bid.user?.name}
                            </Link>
                        </h3>
                        <p className="text-gray-300">{bid?.proposal}</p>
                        <span className="block font-bold text-green-400 mt-1">
                            ₹{bid?.price}
                        </span>
                        </div>
                        {isGigOpen && (
                        <button
                            onClick={() => handleAcceptBid(bid._id)}
                            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                        >
                            Accept
                        </button>
                        )}
                    </div>
                    ))}
                </div>
                ) : (
                <p className="text-gray-400">No applications submitted yet.</p>
                )}
            </div>
            )}

            {/* Chat Section */}
            {isChatVisible && (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-6 max-w-4xl mx-auto mt-8 flex flex-col">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">Messages</h2>
                    <div ref={messagesContainerRef} className="border rounded-md p-4 h-80 overflow-y-auto flex flex-col space-y-4 mb-4">
                        {messages.length ? messages.map((msg, idx) => (
                            <div 
                                key={msg._id || idx} className={`p-3 max-w-xs ${msg.sender?._id === user?._id ? 'bg-indigo-700 self-end ml-auto rounded-t-2xl rounded-bl-2xl' : 'bg-gray-300 border-gray-200 text-black self-start rounded-t-2xl rounded-br-2xl'}`}>
                                <div className="font-semibold">{msg.sender?.name}</div>
                                <div>{msg?.content}</div>
                                <div className="text-xs text-gray-500 mt-1">{new Date(msg?.createdAt).toLocaleString()}</div>
                            </div>
                        )) : <div className="text-center text-gray-500 mt-10">No messages yet.</div>}
                    </div>
                    <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-2">
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type message..." className="flex-1 px-4 py-2 border rounded-md" />
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">Send</button>
                    </form>
                </div>
            )}
            {/* Review Section */}
            {isGigCompleted && (
                <ReviewForm
                    gigId={gig?._id}
                    reviewedUserId={reviewedUserId}
                    token={user?.token}
                    onReviewAdded={handleReviewAdded}
                    existingReview={existingReview}
                />
            )}
        </div>
    );
};

export default GigDetailPage;
