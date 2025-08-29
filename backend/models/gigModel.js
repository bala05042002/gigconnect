import mongoose from 'mongoose';

const gigSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['Web Development', 'Graphic Design', 'Writing', 'Gardening', 'Plumbing', 'Cleaning', 'Other'],
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'awaiting_payment', 'completed', 'cancelled', 'cancellation_pending', 'cancellation_rejected'],
            default: 'open',
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid'],
            default: 'pending',
        },
        acceptedBid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bid',
            required: false,
        },
        cancellationRequestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

gigSchema.index({ location: '2dsphere' });

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;