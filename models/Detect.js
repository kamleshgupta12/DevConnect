const mongoose = require('mongoose');
const { Schema } = mongoose;

const userEnvironmentSchema = new Schema({
  // Device Information
  device: {
    browser: {
      name: String,
      version: String
    },
    os: {
      name: String,
      version: String
    },
    device: {
      type: {
        type: String,
        default: 'desktop'
      },
      vendor: String,
      model: String
    },
    cpu: {
      architecture: String
    }
  },
  
  // Network Information - corrected to properly handle object
  network: {
    type: {
      type: String,
      enum: ['wifi', 'cellular', 'ethernet', 'unknown', '4g', '3g', '2g'],
      default: 'unknown'
    },
    downlink: {
      type: Number,
      default: 0
    },
    rtt: {
      type: Number,
      default: 0
    }
  },
  
  // Rest of your schema remains the same...
  location: {
    latitude: Number,
    longitude: Number
  },
  address: {
    city: String,
    town: String,
    village: String,
    state: String,
    country: String,
    postcode: String,
    country_code: String
  },
  battery: {
    level: Number,
    charging: Boolean
  },
  screen: {
    resolution: String,
    pixelRatio: Number,
    colorDepth: Number
  },
  photoUrl: String,
  cloudinaryId: String,
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  errors: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('UserEnvironment', userEnvironmentSchema);