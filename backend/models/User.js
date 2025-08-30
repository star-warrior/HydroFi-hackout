const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        required: true,
        enum: ['Green Hydrogen Producer', 'Regulatory Authority', 'Industry Buyer', 'Certification Body'],
        default: 'Green Hydrogen Producer'
    },
    factoryName: {
        type: String,
        required: function() {
            return this.role === 'Green Hydrogen Producer';
        },
        trim: true,
        maxlength: 100
    },
    factoryId: {
        type: String,
        unique: true,
        sparse: true, // Allow null values but ensure uniqueness when present
        uppercase: true,
        length: 12
    }
}, {
    timestamps: true
});

// Function to generate factory ID based on factory name
function generateFactoryId(factoryName) {
    // Convert factory name to uppercase and remove spaces
    const cleanName = factoryName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Take first 4 characters of cleaned name (pad with X if shorter)
    const namePrefix = (cleanName + 'XXXX').substring(0, 4);
    
    // Generate random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    // Generate random 4-character suffix
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `${namePrefix}${randomNum}${suffix}`;
}

// Hash password and generate factory ID before saving
userSchema.pre('save', async function (next) {
    try {
        // Hash password if modified
        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        
        // Generate factory ID for producers if not already set
        if (this.role === 'Green Hydrogen Producer' && this.factoryName && !this.factoryId) {
            let factoryId;
            let isUnique = false;
            
            // Keep generating until we get a unique factory ID
            while (!isUnique) {
                factoryId = generateFactoryId(this.factoryName);
                const existingUser = await mongoose.model('User').findOne({ factoryId });
                if (!existingUser) {
                    isUnique = true;
                }
            }
            
            this.factoryId = factoryId;
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// Validate that producers have factoryId after save
userSchema.post('save', function(doc, next) {
    if (doc.role === 'Green Hydrogen Producer' && !doc.factoryId) {
        const error = new Error('Factory ID generation failed for producer');
        return next(error);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
