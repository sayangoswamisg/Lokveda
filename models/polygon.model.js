/* LOCATION VERIFIER WITH BORDER PROTECTION

We calculate where the polygon edge that meets the user’s horizontal line, then check whether that meeting point is to the right of the user.
It currently supports nearly accurate 28 states & 8 union territories of India.

    > imports polygon data from MongoDB

    > exports
    #checkUserProximity: verifies user is in inside service area & updates DB; need to pass user model

    > helper functions
    #getDistanceFromLatLonInKm, #isInsidePolygon, #checkUserProximity
*/

import mongoose from 'mongoose';

// Init Polygon Model from Mongoose Schema
const polygonSchema = new mongoose.Schema({
    location: {
        type: String,
        required: [true, 'Location not mentioned']
    },
    coords: {
        type: Array,
        required: [true, 'Co-ordinates not provided']
    }
});
const Polygon = new mongoose.model('Polygon', polygonSchema);

// Ray-casting algorithm to check if point is inside polygon
function isInsidePolygon(point, polygon) {
    const x = point.lat, y = point.lon;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const yi = polygon[i][0], yj = polygon[j][0]; // Longitude
        const xi = polygon[i][1], xj = polygon[j][1]; // Latitude
        const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Haversine distance calculation (in km)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180; // delta latitude in radians
    const dLon = (lon2 - lon1) * Math.PI / 180; // delta longitude in radians
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Role-based distance limits for staffs/admins (km)
const roleLimits = { staff: 10, admin: 250 };

// Verifies user distance & boundary to check if they're in-premises
export async function verifyUserProximity(_user, userLat, userLon) {
    // I/p office coords & check their availability
    const officeLat = _user.areaRef.lat,
        officeLon = _user.areaRef.lon;
    if (!officeLat || !officeLon) return 'Office coordinates unavailable, kindly contact us if this problem persists 😕';

    // Check distance for admins/staffs
    if (_user.role !== 'citizen') {
        const distance = getDistanceFromLatLonInKm(userLat, userLon, officeLat, officeLon),
            maxDistance = roleLimits[_user.role];
        if (distance > maxDistance) return `You are ${Math.abs(maxDistance - distance).toFixed(2)} km outside your allowed distance 😕`;
    }

    // 1. Fetch allowed states polygon from MongoDB
    for (const location of _user.allowedLocs) {
        const polygon = await Polygon.findOne({ location });
        // 2. Check user boundary
        if (isInsidePolygon({ lat: userLat, lon: userLon }, polygon.coords)) {
            // 3. Look for suspicious login attempts
            if (_user.security.lastSeen > Date.now() - 84_00_000 && _user.security.lastLocation !== location) { // 3 hrs
                const distance = getDistanceFromLatLonInKm(userLat, userLon, _user.security.lat, _user.security.lon);
                if (distance > 200) { // ?
                    _user.security.suspicious.logins += 1;
                    _user.security.suspicious.updatedAt = Date.now();
                    await _user.save();
                }
            }
            // 4. Update user security doc
            _user.security.lat = userLat;
            _user.security.lon = userLon;
            _user.security.lastLocation = location;
            await _user.save();
            return true; // OK
        }
    } // X
    return "You seem to be outside your working/habited states. Contact your Panchayat office if they're unaware of your workplace shift 😕";
}