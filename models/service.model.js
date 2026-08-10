// models/service.model.js
import mongoose from 'mongoose';
import validator from 'validator';

// Reusable data fields
const fields = {
    name: () => ({
        type: String,
        validate: {
            validator: val => validator.isLength(val, { min: 2, max: 100 }),
            message: 'Name must be between 2 and 100 characters 🙂'
        },
        match: [/^[A-Za-z\s.'-]+$/, 'Name contains invalid characters 🤷‍♀️'],
        required: true,
        trim: true
    }),
    textarea: () => ({
        type: String,
        maxlength: [5000, 'You cannot write more than 5000 characters 🤷‍♀️'],
        validate: {
            validator: val => !/[<>]/.test(val),
            message: 'HTML tags("<", ">") are not allowed 🙂'
        },
        required: true,
        trim: true
    }),
    email: () => ({
        type: String,
        validate: [validator.isEmail, 'Please enter a valid email 🙂'],
        maxlength: [254, 'A valid email is under 254 characters 🤷‍♀️'],
        required: true,
        trim: true,
        lowercase: true
    }),
    date: () => ({
        type: Date,
        required: true
    }),
    time: () => ({
        type: String,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter a valid time 🤔'],
        required: true
    }),
    gender: () => ({
        type: String,
        enum: ['Male', 'Female', 'Other', 'male', 'female', 'other'],
        required: true
    }),
    reference: () => ({
        type: String,
        trim: true,
        validate: {
            validator: val => validator.isLength(val, { min: 10, max: 20 }),
            message: 'ID must be between 10 and 20 characters 🙂'
        },
        match: [/^[A-Za-z0-9-_]+$/, 'ID contains invalid characters 😮‍💨']
    }),
    aadhaar: () => ({
        type: String,
        required: true,
        match: [/^\d{12}$/, 'Aadhaar must be exactly 12 digits 🙂']
    }),
    applicant: () => ({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }),
    objId: () => ({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }),
    paymentMethod: () => ({
        type: String,
        enum: ['upi', 'card', 'netbanking'],
        required: true
    }),
    paymentStatus: () => ({
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    }),
    status: () => ({
        type: String,
        enum: ['pending', 'reviewed', 'approved', 'rejected'],
        default: 'pending'
    }),
    amount: () => ({
        type: Number,
        required: true,
        min: 1
    }),
    phone: () => ({
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, 'Phone number is of 10 digits 🙂']
    }),
    enum: (options) => ({
        type: String,
        required: true,
        enum: options
    }),
    num: (min = 0, max = 200, type = 'Age') => ({
        type: Number,
        required: true,
        min: [min, `${type} cannot be less than ${min}`],
        max: [max, 'Time traveler detected 🚀']
    }),
    remarks: () => ({
        approvedApplication: {
            type: Boolean,
            default: false
        },
        approvedProfile: {
            type: Boolean,
            default: false
        }
    })
};

// SERVICE SCHEMA — SERVICE ID : OBJECT, later: documents: [{ type: String }]
const schema = {
    birth: { // BIRTH CERTIFICATE APPLICATION
        childName: fields.name(),
        dob: fields.date(),
        birthTime: fields.time(),
        birthPlace: fields.textarea(),
        gender: fields.gender(),
        motherName: fields.name(),
        fatherName: fields.name(),
        address: fields.textarea(),
        religion: fields.name(),
        nationality: fields.textarea(),
        informantName: fields.name(),
        relationToChild: fields.name(),
        documents: []
    },
    death: { // DEATH CERTIFICATE APPLICATION
        deceasedName: fields.name(),
        dod: fields.date(),
        deathTime: fields.time(),
        deathPlace: fields.textarea(),
        age: fields.num(),
        gender: fields.gender(),
        cause: fields.textarea(),
        relativeName: fields.name(),
        address: fields.textarea(),
        informantName: fields.name(),
        relationToDeceased: fields.name(),
        documents: []
    },
    dues: { // VIEW AND CLEAR OUTSTANDING DUES
        fullName: fields.name(),
        mobile: fields.phone(),
        duesType: fields.enum(['maintenance', 'waste', 'misc']),
        amount: fields.amount(),
        paymentMethod: fields.paymentMethod(),
        paymentStatus: fields.paymentStatus(),
        transactionId: fields.reference()
    },
    'election-updates': { // GET LATEST ELECTION UPDATES
        state: fields.name(),
        district: fields.textarea(),
        email: fields.email()
    },
    grievance: { // SUBMIT A PUBLIC GRIEVANCE
        name: fields.name(),
        email: fields.email(),
        mobile: fields.phone(),
        complaintType: fields.enum(['service', 'corruption', 'behavior', 'infrastructure', 'other']),
        details: fields.textarea(),
        evidence: []
    },
    'health-checkup': { // BOOK A HEALTH CHECKUP APPOINTMENT
        name: fields.name(),
        age: fields.num(),
        gender: fields.gender(),
        date: fields.date(),
        checkupType: fields.enum(['general', 'dental', 'eye', 'cardio'])
    },
    jobs: { // EXPLORE LOCAL JOB OPPORTUNITIES
        fullName: fields.name(),
        email: fields.email(),
        phone: fields.phone(),
        jobRole: fields.enum(['developer', 'accountant', 'clerk', 'others']),
        resume: []
    },
    land: { // LAND RECORDS AND INFORMATION
        applicantName: fields.name(),
        landLocation: fields.name(),
        serviceType: fields.enum(['ownership', 'mutation', 'boundary']),
        landDocs: [],
        surveyNumber: fields.reference(),
        plotNumber: fields.reference()
    },
    mgnrega: { // MGNREGA JOB CARD INQUIRY
        jobCard: fields.reference(),
        name: fields.name(),
        district: fields.textarea(),
        panchayat: fields.textarea()
    },
    'property-tax': { // PROPERTY TAX PAYMENT FORM
        ownerName: fields.name(),
        propertyId: fields.name(),
        address: fields.textarea(),
        year: fields.num(2000, 2099, 'Year'),
        amount: fields.amount(),
        paymentMethod: fields.paymentMethod(),
        paymentStatus: fields.paymentStatus(),
        transactionId: fields.reference()
    },
    property: { // PROPERTY REGISTRATION AND RECORDS
        ownerName: fields.name(),
        address: fields.textarea(),
        propertyId: fields.name(),
        requestType: fields.enum(['view', 'update']),
        ownershipProof: []
    },
    'public-notices': { // VIEW PUBLIC NOTICES
        noticeCategory: fields.enum(['construction', 'environment', 'transport', 'general']),
        district: fields.textarea()
    },
    'public-works': { // PUBLIC WORKS PROJECT STATUS
        projectId: fields.name(),
        projectName: fields.name(),
        location: fields.name()
    },
    rti: { // RIGHT TO INFORMATION (RTI) APPLICATION
        applicantName: fields.name(),
        contact: fields.phone(),
        email: fields.email(),
        department: fields.name(),
        subject: fields.textarea(),
        infoRequired: fields.name()
    },
    sanitation: { // SANITATION AND WASTE MANAGEMENT REQUEST
        fullName: fields.name(),
        contact: fields.phone(),
        address: fields.textarea(),
        requestType: fields.enum(['garbage', 'drain', 'others']),
        notes: fields.textarea(),
        completedAt: { type: Date }
    },
    'skill-training': { // SKILL DEVELOPMENT TRAINING REGISTRATION
        name: fields.name(),
        age: fields.num(15, 60),
        email: fields.email(),
        program: fields.enum(['coding', 'digital-marketing', 'mechanics', 'fashion']),
        idProof: fields.reference(),
        enrolledAt: { type: Date },
        completedAt: { type: Date }
    },
    subsidies: { // APPLY FOR GOVERNMENT SUBSIDIES
        applicantName: fields.name(),
        aadhaarNumber: fields.aadhaar(),
        subsidyType: fields.enum(['agriculture', 'education', 'housing']),
        trackingId: fields.reference(),
        documents: [],
        disbursedAt: { type: Date }
    },
    tenders: { // VIEW AND PARTICIPATE IN TENDERS
        tenderId: fields.reference(),
        orgName: fields.name(),
        businessName: fields.name(),
        proposal: [],
        awardedAt: { type: Date }
    },
    'voter-id': { // VOTER ID REGISTRATION AND SERVICES
        fullName: fields.name(),
        dob: fields.date(),
        address: fields.textarea(),
        applicationNumber: fields.reference(),
        issuedAt: { type: Date }
    },
    'voter-list': { // SEARCH YOUR NAME IN ELECTORAL VOTER LIST
        fullName: fields.name(),
        fathersName: fields.name(),
        district: fields.textarea(),
        constituency: fields.name()
    },
    'water-tax': { // WATER TAX PAYMENT FORM
        consumerName: fields.name(),
        consumerNumber: fields.name(),
        address: fields.textarea(),
        billingPeriod: fields.textarea(),
        amount: fields.amount(),
        paymentMethod: fields.paymentMethod(),
        paymentStatus: fields.paymentStatus(),
        transactionId: fields.reference()
    },
    'welfare-schemes': { // APPLY FOR WELFARE SCHEMES
        applicantName: fields.name(),
        aadhaarNumber: fields.aadhaar(),
        schemeName: fields.enum(['oldage', 'widow', 'disability', 'others']),
        incomeCert: fields.reference(),
        documents: [],
        benefitDisbursedAt: { type: Date }
    }
};

// Export mongoose model by service ID dynamically
export function serviceModel(serviceID) {

    // Returns same model when requested
    if (mongoose.models[serviceID]) return mongoose.models[serviceID];

    // If new, then attach necessary fields
    const reqSchema = schema[serviceID];
    reqSchema.applicant = fields.applicant();
    reqSchema.status = fields.status();
    reqSchema.remarks = fields.remarks();
    reqSchema.reviewedBy = fields.objId();
    reqSchema.approvedBy = fields.objId();
    reqSchema.rejectedBy = fields.objId();
    reqSchema.reviewedAt = { type: Date };
    reqSchema.approvedAt = { type: Date };
    reqSchema.rejectedAt = { type: Date };

    // & return the model
    return mongoose.model(serviceID, new mongoose.Schema(reqSchema, { timestamps: true }), serviceID);
}