const express = require('express');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Dashboard data for different roles
const dashboardData = {
    'Green Hydrogen Producer': {
        title: 'Green Hydrogen Producer Dashboard',
        welcomeMessage: 'Welcome, Producer!',
        stats: {
            'Hydrogen Production': '1,250 kg/day',
            'Carbon Credits Generated': '850 credits',
            'Active Facilities': '3 plants',
            'Certification Status': 'Verified'
        },
        recentActivities: [
            'Production report submitted for Plant A',
            'New certification received for Plant B',
            'Carbon credit transaction completed',
            'Maintenance scheduled for Plant C'
        ],
        quickActions: [
            'Submit Production Report',
            'Request Certification',
            'View Market Prices',
            'Manage Facilities'
        ]
    },
    'Regulatory Authority': {
        title: 'Regulatory Authority Dashboard',
        welcomeMessage: 'Welcome, Regulatory Authority!',
        stats: {
            'Pending Certifications': '24',
            'Approved Facilities': '156',
            'Compliance Reports': '89%',
            'Active Investigations': '3'
        },
        recentActivities: [
            'Certification approved for HydroTech Corp',
            'Compliance audit scheduled',
            'New regulation published',
            'Investigation report finalized'
        ],
        quickActions: [
            'Review Certifications',
            'Schedule Audits',
            'Generate Reports',
            'Update Regulations'
        ]
    },
    'Industry Buyer': {
        title: 'Industry Buyer Dashboard',
        welcomeMessage: 'Welcome, Industry Buyer!',
        stats: {
            'Available Credits': '5,420',
            'Monthly Purchases': '1,200 credits',
            'Average Price': '$45/credit',
            'Portfolio Value': '$243,900'
        },
        recentActivities: [
            'Purchased 200 credits from GreenH2 Ltd',
            'Price alert triggered for premium credits',
            'Contract renewed with HydroGen Corp',
            'ESG report generated'
        ],
        quickActions: [
            'Browse Marketplace',
            'Purchase Credits',
            'View Portfolio',
            'Set Price Alerts'
        ]
    },
    'Certification Body': {
        title: 'Certification Body Dashboard',
        welcomeMessage: 'Welcome, Certification Body!',
        stats: {
            'Pending Reviews': '18',
            'Certifications Issued': '342',
            'Active Auditors': '15',
            'Revenue This Month': '$125,400'
        },
        recentActivities: [
            'Site inspection completed at EcoHydro',
            'New auditor certified',
            'Certification standard updated',
            'Quality review conducted'
        ],
        quickActions: [
            'Schedule Inspections',
            'Issue Certificates',
            'Manage Auditors',
            'Update Standards'
        ]
    }
};

// @route   GET /api/dashboard/data
// @desc    Get dashboard data based on user role
// @access  Private
router.get('/data', auth, (req, res) => {
    try {
        const userRole = req.user.role;
        const data = dashboardData[userRole];

        if (!data) {
            return res.status(404).json({ message: 'Dashboard data not found for this role' });
        }

        res.json({
            success: true,
            data: {
                ...data,
                user: {
                    username: req.user.username,
                    role: req.user.role
                }
            }
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard data' });
    }
});

// Role-specific endpoints with authorization

// @route   GET /api/dashboard/producer
// @desc    Get producer-specific data
// @access  Private (Green Hydrogen Producer only)
router.get('/producer', auth, authorize(['Green Hydrogen Producer']), (req, res) => {
    res.json({
        success: true,
        data: {
            productionFacilities: [
                { id: 1, name: 'Plant Alpha', capacity: '500 kg/day', status: 'Active' },
                { id: 2, name: 'Plant Beta', capacity: '450 kg/day', status: 'Maintenance' },
                { id: 3, name: 'Plant Gamma', capacity: '300 kg/day', status: 'Active' }
            ],
            carbonCredits: {
                generated: 850,
                sold: 620,
                available: 230
            }
        }
    });
});

// @route   GET /api/dashboard/regulatory
// @desc    Get regulatory authority-specific data
// @access  Private (Regulatory Authority only)
router.get('/regulatory', auth, authorize(['Regulatory Authority']), (req, res) => {
    res.json({
        success: true,
        data: {
            pendingApplications: [
                { id: 1, company: 'HydroTech Corp', type: 'New Facility', submitted: '2025-08-25' },
                { id: 2, company: 'GreenEnergy Ltd', type: 'Expansion', submitted: '2025-08-28' }
            ],
            complianceMetrics: {
                totalFacilities: 156,
                compliant: 139,
                underReview: 17
            }
        }
    });
});

// @route   GET /api/dashboard/buyer
// @desc    Get industry buyer-specific data
// @access  Private (Industry Buyer only)
router.get('/buyer', auth, authorize(['Industry Buyer']), (req, res) => {
    res.json({
        success: true,
        data: {
            marketPrices: [
                { type: 'Premium Credits', price: 52, change: '+2.3%' },
                { type: 'Standard Credits', price: 45, change: '-1.1%' },
                { type: 'Bulk Credits', price: 38, change: '+0.8%' }
            ],
            portfolio: {
                totalCredits: 5420,
                value: 243900,
                monthlyTarget: 1500
            }
        }
    });
});

// @route   GET /api/dashboard/certification
// @desc    Get certification body-specific data
// @access  Private (Certification Body only)
router.get('/certification', auth, authorize(['Certification Body']), (req, res) => {
    res.json({
        success: true,
        data: {
            inspectionQueue: [
                { id: 1, company: 'EcoHydro Inc', scheduled: '2025-09-02', auditor: 'John Smith' },
                { id: 2, company: 'CleanH2 Corp', scheduled: '2025-09-05', auditor: 'Sarah Johnson' }
            ],
            certificationStats: {
                issued: 342,
                pending: 18,
                expired: 23
            }
        }
    });
});

module.exports = router;
